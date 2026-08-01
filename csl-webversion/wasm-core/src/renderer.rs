// WebGL2 Renderer - Minecraft-style block rendering
// Uses chunk meshing, texture atlases, and efficient batching

use wasm_bindgen::prelude::*;
use web_sys::{
    WebGl2RenderingContext, WebGlProgram, WebGlShader,
    WebGlVertexArrayObject, WebGlTexture, WebGlUniformLocation,
    HtmlCanvasElement,
};
use std::collections::HashMap;
use crate::world::{World, BlockType};
use crate::entity::Player;
use crate::mod_api::ModManager;

const VERTEX_SHADER: &str = r#"#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in vec3 aNormal;
layout(location = 3) in float aTexIndex;
layout(location = 4) in float aLightLevel;

uniform mat4 uProjection;
uniform mat4 uView;

out vec2 vTexCoord;
out vec3 vNormal;
flat out float vTexIndex;
out float vLightLevel;
out vec3 vWorldPos;

void main() {
    vec4 worldPos = vec4(aPosition, 1.0);
    vWorldPos = aPosition;
    vTexCoord = aTexCoord;
    vNormal = aNormal;
    vTexIndex = aTexIndex;
    vLightLevel = aLightLevel;

    gl_Position = uProjection * uView * worldPos;
}
"#;

const FRAGMENT_SHADER: &str = r#"#version 300 es
precision highp float;
precision highp sampler2DArray;

in vec2 vTexCoord;
in vec3 vNormal;
flat in float vTexIndex;
in float vLightLevel;
in vec3 vWorldPos;

uniform sampler2DArray uTextureAtlas;
uniform vec3 uSunDirection;
uniform vec3 uFogColor;
uniform float uFogStart;
uniform float uFogEnd;
uniform vec3 uCameraPos;

out vec4 fragColor;

void main() {
    // Calculate texture layer from texIndex
    float layer = floor(vTexIndex + 0.5);
    vec3 texCoord3D = vec3(vTexCoord.x, vTexCoord.y, layer);

    vec4 texColor = texture(uTextureAtlas, texCoord3D);

    if (texColor.a < 0.1) discard;

    // Simple lighting
    float ambient = 0.4;
    float diffuse = max(dot(vNormal, normalize(uSunDirection)), 0.0) * 0.6;
    float light = max(ambient + diffuse, vLightLevel);

    vec3 color = texColor.rgb * light;

    // Fog
    float dist = length(vWorldPos - uCameraPos);
    float fogFactor = clamp((uFogEnd - dist) / (uFogEnd - uFogStart), 0.0, 1.0);
    color = mix(uFogColor, color, fogFactor);

    fragColor = vec4(color, texColor.a);
}
"#;

/// Block face data for mesh generation
#[derive(Debug, Clone, Copy)]
struct BlockFace {
    vertices: [[f32; 3]; 4],
    normal: [f32; 3],
    tex_coords: [[f32; 2]; 4],
}

/// Chunk mesh (generated per chunk)
struct ChunkMesh {
    vao: WebGlVertexArrayObject,
    vertex_count: i32,
    dirty: bool,
}

pub struct Renderer {
    gl: WebGl2RenderingContext,
    program: WebGlProgram,
    vao: WebGlVertexArrayObject,
    texture_atlas: WebGlTexture,
    projection_loc: WebGlUniformLocation,
    view_loc: WebGlUniformLocation,
    camera_pos_loc: WebGlUniformLocation,
    sun_dir_loc: WebGlUniformLocation,
    fog_color_loc: WebGlUniformLocation,
    fog_start_loc: WebGlUniformLocation,
    fog_end_loc: WebGlUniformLocation,
    chunk_meshes: HashMap<(i64, i64), ChunkMesh>,
    frame_count: u64,
    last_fps_time: f64,
    current_fps: f64,
    width: i32,
    height: i32,
}

impl Renderer {
    pub fn new() -> Result<Self, JsValue> {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let canvas = document.get_element_by_id("game-canvas")
            .ok_or_else(|| JsValue::from_str("Canvas not found "))?;
        let canvas: HtmlCanvasElement = canvas.dyn_into().unwrap();

        let gl = canvas
            .get_context("webgl2")?
            .ok_or_else(|| JsValue::from_str("WebGL2 not supported "))?;
        let gl: WebGl2RenderingContext = gl.dyn_into().unwrap();

        // Compile shaders
        let vert_shader = compile_shader(&gl, WebGl2RenderingContext::VERTEX_SHADER, VERTEX_SHADER)?;
        let frag_shader = compile_shader(&gl, WebGl2RenderingContext::FRAGMENT_SHADER, FRAGMENT_SHADER)?;
        let program = link_program(&gl, &vert_shader, &frag_shader)?;

        // Get uniform locations
        let projection_loc = gl.get_uniform_location(&program, "uProjection").unwrap();
        let view_loc = gl.get_uniform_location(&program, "uView").unwrap();
        let camera_pos_loc = gl.get_uniform_location(&program, "uCameraPos").unwrap();
        let sun_dir_loc = gl.get_uniform_location(&program, "uSunDirection").unwrap();
        let fog_color_loc = gl.get_uniform_location(&program, "uFogColor").unwrap();
        let fog_start_loc = gl.get_uniform_location(&program, "uFogStart").unwrap();
        let fog_end_loc = gl.get_uniform_location(&program, "uFogEnd").unwrap();

        // Create texture atlas
        let texture_atlas = create_texture_atlas(&gl)?;

        // Create VAO
        let vao = gl.create_vertex_array()
            .ok_or_else(|| JsValue::from_str("Cannot create VAO "))?;

        // Setup GL state
        gl.enable(WebGl2RenderingContext::DEPTH_TEST);
        gl.enable(WebGl2RenderingContext::CULL_FACE);
        gl.cull_face(WebGl2RenderingContext::BACK);
        gl.enable(WebGl2RenderingContext::BLEND);
        gl.blend_func(WebGl2RenderingContext::SRC_ALPHA, WebGl2RenderingContext::ONE_MINUS_SRC_ALPHA);

        Ok(Renderer {
            gl,
            program,
            vao,
            texture_atlas,
            projection_loc,
            view_loc,
            camera_pos_loc,
            sun_dir_loc,
            fog_color_loc,
            fog_start_loc,
            fog_end_loc,
            chunk_meshes: HashMap::new(),
            frame_count: 0,
            last_fps_time: js_sys::Date::now(),
            current_fps: 0.0,
            width: 800,
            height: 600,
        })
    }

    pub fn resize(&mut self, width: i32, height: i32) {
        self.width = width;
        self.height = height;
        self.gl.viewport(0, 0, width, height);
    }

    pub fn render(&mut self, world: &World, player: &Player, mods: &ModManager) -> Result<(), JsValue> {
        // First pass: build meshes for chunks that need it (needs &mut self)
        let player_chunk_x = (player.x as f64 / 16.0) as i64;
        let player_chunk_z = (player.z as f64 / 16.0) as i64;
        let render_distance = 8i64;

        let mut chunks_to_build: Vec<(i64, i64)> = Vec::new();
        for dx in -render_distance..=render_distance {
            for dz in -render_distance..=render_distance {
                let cx = player_chunk_x + dx;
                let cz = player_chunk_z + dz;
                if world.get_chunk(cx, cz).is_some() && !self.chunk_meshes.contains_key(&(cx, cz)) {
                    chunks_to_build.push((cx, cz));
                }
            }
        }
        for (cx, cz) in &chunks_to_build {
            let _ = self.build_chunk_mesh(*cx, *cz, world);
        }

        // Second pass: render (uses &self fields)
        let gl = &self.gl;

        // Clear
        gl.clear_color(0.49, 0.73, 0.98, 1.0); // Sky blue
        gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT | WebGl2RenderingContext::DEPTH_BUFFER_BIT);

        gl.use_program(Some(&self.program));

        // Set uniforms
        let projection = create_projection_matrix(self.width, self.height, 70.0);
        let view = create_view_matrix(player);

        gl.uniform_matrix4fv_with_f32_array(Some(&self.projection_loc), false, &projection);
        gl.uniform_matrix4fv_with_f32_array(Some(&self.view_loc), false, &view);
        gl.uniform3f(Some(&self.camera_pos_loc), player.x as f32, player.y as f32, player.z as f32);
        gl.uniform3f(Some(&self.sun_dir_loc), 0.5, 1.0, 0.3);
        gl.uniform3f(Some(&self.fog_color_loc), 0.49, 0.73, 0.98);
        gl.uniform1f(Some(&self.fog_start_loc), 64.0);
        gl.uniform1f(Some(&self.fog_end_loc), 256.0);

        // Bind texture atlas
        gl.active_texture(WebGl2RenderingContext::TEXTURE0);
        gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D_ARRAY, Some(&self.texture_atlas));

        // Render chunks
        for dx in -render_distance..=render_distance {
            for dz in -render_distance..=render_distance {
                let cx = player_chunk_x + dx;
                let cz = player_chunk_z + dz;
                if let Some(mesh) = self.chunk_meshes.get(&(cx, cz)) {
                    self.render_chunk_mesh(mesh)?;
                }
            }
        }

        // Let mods render their overlays
        mods.render_overlays(gl, player)?;

        // Update FPS
        self.update_fps();

        Ok(())
    }

    fn render_chunk_mesh(&self, mesh: &ChunkMesh) -> Result<(), JsValue> {
        let gl = &self.gl;
        gl.bind_vertex_array(Some(&mesh.vao));
        gl.draw_arrays(WebGl2RenderingContext::TRIANGLES, 0, mesh.vertex_count);
        Ok(())
    }

    /// Build or rebuild a chunk mesh from block data
    pub fn build_chunk_mesh(&mut self, cx: i64, cz: i64, world: &World) -> Result<(), JsValue> {
        let chunk = match world.get_chunk(cx, cz) {
            Some(c) => c,
            None => return Ok(()),
        };

        let gl = &self.gl;
        
        // Vertex format: position(3) + texcoord(2) + normal(3) + texIndex(1) + lightLevel(1) = 10 floats
        let mut vertices: Vec<f32> = Vec::new();
        
        for y in 0..384 {
            for x in 0..16 {
                for z in 0..16 {
                    let block = chunk.get_block(x, y, z);
                    if block == BlockType::Air {
                        continue;
                    }
                    
                    let tex_idx = block.texture_index() as f32;
                    let bx = (cx * 16 + x as i64) as f32;
                    let by = y as f32;
                    let bz = (cz * 16 + z as i64) as f32;
                    
                    // Check each face - only add if adjacent block is transparent
                    let faces = [
                        // +Y (top)
                        (y < 383 && world.get_block(cx * 16 + x as i64, y as i64 + 1, cz * 16 + z as i64).is_transparent(),
                         [bx, by+1.0, bz, bx+1.0, by+1.0, bz, bx+1.0, by+1.0, bz+1.0, bx, by+1.0, bz+1.0],
                         [0.0, 1.0, 0.0]),
                        // -Y (bottom)
                        (y > 0 && world.get_block(cx * 16 + x as i64, y as i64 - 1, cz * 16 + z as i64).is_transparent(),
                         [bx, by, bz+1.0, bx+1.0, by, bz+1.0, bx+1.0, by, bz, bx, by, bz],
                         [0.0, -1.0, 0.0]),
                        // +Z (south)
                        (world.get_block(cx * 16 + x as i64, y as i64, cz * 16 + z as i64 + 1).is_transparent(),
                         [bx, by, bz+1.0, bx+1.0, by, bz+1.0, bx+1.0, by+1.0, bz+1.0, bx, by+1.0, bz+1.0],
                         [0.0, 0.0, 1.0]),
                        // -Z (north)
                        (z > 0 && world.get_block(cx * 16 + x as i64, y as i64, cz * 16 + z as i64 - 1).is_transparent(),
                         [bx+1.0, by, bz, bx, by, bz, bx, by+1.0, bz, bx+1.0, by+1.0, bz],
                         [0.0, 0.0, -1.0]),
                        // +X (east)
                        (world.get_block(cx * 16 + x as i64 + 1, y as i64, cz * 16 + z as i64).is_transparent(),
                         [bx+1.0, by, bz+1.0, bx+1.0, by, bz, bx+1.0, by+1.0, bz, bx+1.0, by+1.0, bz+1.0],
                         [1.0, 0.0, 0.0]),
                        // -X (west)
                        (x > 0 && world.get_block(cx * 16 + x as i64 - 1, y as i64, cz * 16 + z as i64).is_transparent(),
                         [bx, by, bz, bx, by, bz+1.0, bx, by+1.0, bz+1.0, bx, by+1.0, bz],
                         [-1.0, 0.0, 0.0]),
                    ];
                    
                    for (visible, positions, normal) in &faces {
                        if !visible {
                            continue;
                        }
                        // Two triangles per face (6 vertices)
                        let tex_coords = [(0.0, 0.0), (1.0, 0.0), (1.0, 1.0), (0.0, 1.0)];
                        let light = 1.0; // Full light for now
                        
                        // Triangle 1: v0, v1, v2
                        for &vi in &[0, 1, 2] {
                            vertices.push(positions[vi * 3]);
                            vertices.push(positions[vi * 3 + 1]);
                            vertices.push(positions[vi * 3 + 2]);
                            vertices.push(tex_coords[vi].0);
                            vertices.push(tex_coords[vi].1);
                            vertices.push(normal[0]);
                            vertices.push(normal[1]);
                            vertices.push(normal[2]);
                            vertices.push(tex_idx);
                            vertices.push(light);
                        }
                        // Triangle 2: v0, v2, v3
                        for &vi in &[0, 2, 3] {
                            vertices.push(positions[vi * 3]);
                            vertices.push(positions[vi * 3 + 1]);
                            vertices.push(positions[vi * 3 + 2]);
                            vertices.push(tex_coords[vi].0);
                            vertices.push(tex_coords[vi].1);
                            vertices.push(normal[0]);
                            vertices.push(normal[1]);
                            vertices.push(normal[2]);
                            vertices.push(tex_idx);
                            vertices.push(light);
                        }
                    }
                }
            }
        }
        
        if vertices.is_empty() {
            return Ok(());
        }
        
        // Create GPU buffers
        let vao = gl.create_vertex_array()
            .ok_or_else(|| JsValue::from_str("Cannot create VAO"))?;
        gl.bind_vertex_array(Some(&vao));
        
        let vbo = gl.create_buffer()
            .ok_or_else(|| JsValue::from_str("Cannot create VBO"))?;
        gl.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, Some(&vbo));
        
        // Upload vertex data
        let array = js_sys::Float32Array::from(&vertices[..]);
        gl.buffer_data_with_array_buffer_view(
            WebGl2RenderingContext::ARRAY_BUFFER,
            &array,
            WebGl2RenderingContext::STATIC_DRAW,
        );
        
        // Vertex attributes (10 floats per vertex, 40 bytes stride)
        let stride = 10 * 4;
        // position (3 floats)
        gl.vertex_attrib_pointer_with_i32(0, 3, WebGl2RenderingContext::FLOAT, false, stride, 0);
        gl.enable_vertex_attrib_array(0);
        // texcoord (2 floats)
        gl.vertex_attrib_pointer_with_i32(1, 2, WebGl2RenderingContext::FLOAT, false, stride, 3 * 4);
        gl.enable_vertex_attrib_array(1);
        // normal (3 floats)
        gl.vertex_attrib_pointer_with_i32(2, 3, WebGl2RenderingContext::FLOAT, false, stride, 5 * 4);
        gl.enable_vertex_attrib_array(2);
        // texIndex (1 float)
        gl.vertex_attrib_pointer_with_i32(3, 1, WebGl2RenderingContext::FLOAT, false, stride, 8 * 4);
        gl.enable_vertex_attrib_array(3);
        // lightLevel (1 float)
        gl.vertex_attrib_pointer_with_i32(4, 1, WebGl2RenderingContext::FLOAT, false, stride, 9 * 4);
        gl.enable_vertex_attrib_array(4);
        
        let vertex_count = (vertices.len() / 10) as i32;
        
        self.chunk_meshes.insert((cx, cz), ChunkMesh {
            vao,
            vertex_count,
            dirty: false,
        });
        
        Ok(())
    }

    pub fn fps(&self) -> f64 {
        self.current_fps
    }

    fn update_fps(&mut self) {
        self.frame_count += 1;
        let now = js_sys::Date::now();
        if now - self.last_fps_time >= 1000.0 {
            self.current_fps = self.frame_count as f64 / ((now - self.last_fps_time) / 1000.0);
            self.frame_count = 0;
            self.last_fps_time = now;
        }
    }
}

fn compile_shader(gl: &WebGl2RenderingContext, shader_type: u32, source: &str) -> Result<WebGlShader, JsValue> {
    let shader = gl.create_shader(shader_type)
        .ok_or_else(|| JsValue::from_str("Cannot create shader "))?;
    gl.shader_source(&shader, source);
    gl.compile_shader(&shader);

    if !gl.get_shader_parameter(&shader, WebGl2RenderingContext::COMPILE_STATUS).as_bool().unwrap_or(false) {
        let log = gl.get_shader_info_log(&shader).unwrap_or_default();
        return Err(JsValue::from_str(&format!("Shader compile error: {}", log)));
    }

    Ok(shader)
}

fn link_program(gl: &WebGl2RenderingContext, vert: &WebGlShader, frag: &WebGlShader) -> Result<WebGlProgram, JsValue> {
    let program = gl.create_program()
        .ok_or_else(|| JsValue::from_str("Cannot create program "))?;
    gl.attach_shader(&program, vert);
    gl.attach_shader(&program, frag);
    gl.link_program(&program);

    if !gl.get_program_parameter(&program, WebGl2RenderingContext::LINK_STATUS).as_bool().unwrap_or(false) {
        let log = gl.get_program_info_log(&program).unwrap_or_default();
        return Err(JsValue::from_str(&format!("Program link error: {}", log)));
    }

    Ok(program)
}

fn create_texture_atlas(gl: &WebGl2RenderingContext) -> Result<WebGlTexture, JsValue> {
    let texture = gl.create_texture()
        .ok_or_else(|| JsValue::from_str("Cannot create texture "))?;
    gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D_ARRAY, Some(&texture));

    // Create a 16x16x256 texture array (256 block types, each 16x16)
    let size: i32 = 16;
    let layers: i32 = 256;
    let mut data = vec![0u8; (size * size * layers * 4) as usize];

    // Fill with procedural textures
    for layer in 0..layers {
        for y in 0..size {
            for x in 0..size {
                let idx = ((layer * size * size + y * size + x) * 4) as usize;
                let (r, g, b, a) = generate_block_texture(layer, x, y);
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = a;
            }
        }
    }

    // Upload texture data using tex_image_3d
    // Use texImage3D with ArrayBufferView (Uint8Array)
    let array = js_sys::Uint8Array::from(&data[..]);
    gl.tex_image_3d_with_opt_array_buffer_view(
        WebGl2RenderingContext::TEXTURE_2D_ARRAY,
        0,
        WebGl2RenderingContext::RGBA as i32,
        size,
        size,
        layers,
        0,
        WebGl2RenderingContext::RGBA,
        WebGl2RenderingContext::UNSIGNED_BYTE,
        Some(&array),
    );

    gl.tex_parameteri(WebGl2RenderingContext::TEXTURE_2D_ARRAY, WebGl2RenderingContext::TEXTURE_MIN_FILTER, WebGl2RenderingContext::NEAREST as i32);
    gl.tex_parameteri(WebGl2RenderingContext::TEXTURE_2D_ARRAY, WebGl2RenderingContext::TEXTURE_MAG_FILTER, WebGl2RenderingContext::NEAREST as i32);
    gl.tex_parameteri(WebGl2RenderingContext::TEXTURE_2D_ARRAY, WebGl2RenderingContext::TEXTURE_WRAP_S, WebGl2RenderingContext::REPEAT as i32);
    gl.tex_parameteri(WebGl2RenderingContext::TEXTURE_2D_ARRAY, WebGl2RenderingContext::TEXTURE_WRAP_T, WebGl2RenderingContext::REPEAT as i32);

    Ok(texture)
}

fn generate_block_texture(block_id: i32, x: i32, y: i32) -> (u8, u8, u8, u8) {
    // 16x16 pixel textures for each block type
    let px = x as usize;
    let py = y as usize;
    
    match block_id {
        0 => { // Stone - gray with noise
            let base = 120 + ((px.wrapping_mul(7) ^ py.wrapping_mul(13)) % 20) as u8;
            let edge = if px == 0 || px == 15 || py == 0 || py == 15 { 20 } else { 0 };
            (base - edge, base - edge, base - edge, 255)
        }
        1 => { // Dirt - brown with variation
            let base = 100 + ((px.wrapping_mul(5) ^ py.wrapping_mul(11)) % 15) as u8;
            (base + 20, base, base - 30, 255)
        }
        2 => { // Grass top - green with noise
            let noise = ((px.wrapping_mul(7) ^ py.wrapping_mul(17)) % 12) as u8;
            // Edge slightly darker
            let edge = if px == 0 || px == 15 || py == 0 || py == 15 { 15 } else { 0 };
            (40 + noise - edge, 140 + noise - edge, 40 + noise - edge, 255)
        }
        3 => { // Cobblestone - varied gray
            let v = ((px.wrapping_mul(13) ^ py.wrapping_mul(7)) % 30) as u8;
            (120 + v, 120 + v, 120 + v, 255)
        }
        4 => { // Wood/Planks - brown planks
            let line = if py % 4 == 0 { 20 } else { 0 };
            (160 - line, 120 - line, 60 - line, 255)
        }
        5 => { // Bedrock - very dark
            let v = ((px.wrapping_mul(3) ^ py.wrapping_mul(7)) % 10) as u8;
            (20 + v, 20 + v, 20 + v, 255)
        }
        6 => { // Diamond Ore - gray with cyan spots
            let is_spot = (px.wrapping_mul(3) ^ py.wrapping_mul(7)) % 8 == 0;
            if is_spot { (0, 200, 200, 255) } else { (120, 120, 120, 255) }
        }
        7 => { // Gold Ore - gray with yellow spots
            let is_spot = (px.wrapping_mul(5) ^ py.wrapping_mul(11)) % 7 == 0;
            if is_spot { (255, 220, 50, 255) } else { (120, 120, 120, 255) }
        }
        8 => { // Iron Ore - gray with tan spots
            let is_spot = (px.wrapping_mul(7) ^ py.wrapping_mul(13)) % 7 == 0;
            if is_spot { (200, 170, 140, 255) } else { (120, 120, 120, 255) }
        }
        9 => { // Coal Ore - gray with black spots
            let is_spot = (px.wrapping_mul(11) ^ py.wrapping_mul(3)) % 6 == 0;
            if is_spot { (30, 30, 30, 255) } else { (120, 120, 120, 255) }
        }
        10 => { // Water - blue with transparency
            let wave = ((px as f32 * 0.5).sin() * 10.0) as u8;
            (30, 100 + wave, 220 + wave, 180)
        }
        11 => { // Lava - orange/red animated look
            let v = ((px.wrapping_mul(17) ^ py.wrapping_mul(23)) % 20) as u8;
            (255, 120 + v, 20, 255)
        }
        12 => { // Sand - yellow/tan
            let v = ((px.wrapping_mul(3) ^ py.wrapping_mul(7)) % 10) as u8;
            (220 + v, 210 + v, 140 + v, 255)
        }
        13 => { // Gravel - gray with dots
            let v = ((px.wrapping_mul(7) ^ py.wrapping_mul(13)) % 15) as u8;
            (130 + v, 130 + v, 130 + v, 255)
        }
        14 => { // Log - tree bark
            let line = if py % 3 == 0 { 15 } else { 0 };
            (100 + line, 70 + line, 40 + line, 255)
        }
        15 => { // Leaves - green with holes
            let hole = (px.wrapping_mul(5) ^ py.wrapping_mul(9)) % 5 == 0;
            if hole { (0, 0, 0, 0) } else { (30, 150, 30, 200) }
        }
        16 => { // Glass - light blue transparent
            let edge = if px == 0 || px == 15 || py == 0 || py == 15 { 30 } else { 0 };
            (200 - edge, 230 - edge, 255 - edge, 80)
        }
        17 => { // Grass side - green top, dirt bottom
            if py < 4 { (40, 140, 40, 255) }
            else { (100, 80, 60, 255) }
        }
        18 => { // Snow - white
            let v = ((px.wrapping_mul(3) ^ py.wrapping_mul(7)) % 5) as u8;
            (250 - v, 250 - v, 255 - v, 255)
        }
        19 => { // Obsidian - dark purple
            let v = ((px.wrapping_mul(7) ^ py.wrapping_mul(11)) % 8) as u8;
            (20 + v, 10 + v, 30 + v, 255)
        }
        20 => { // Crafting Table - top
            let grid = if px % 4 == 0 || py % 4 == 0 { 30 } else { 0 };
            (160 + grid, 120 + grid, 60 + grid, 255)
        }
        21 => { // Furnace - gray with dark front
            let v = ((px.wrapping_mul(3) ^ py.wrapping_mul(7)) % 10) as u8;
            (140 + v, 140 + v, 140 + v, 255)
        }
        22 => { // Bookshelf - brown with stripes
            let stripe = if px % 3 == 0 { 20 } else { 0 };
            (140 + stripe, 100 + stripe, 50 + stripe, 255)
        }
        23 => { // TNT - red/white
            let band = if (py / 4) % 2 == 0 { 255 } else { 200 };
            (band, 50, 50, 255)
        }
        24 => { // Mossy Cobblestone - greenish gray
            let v = ((px.wrapping_mul(13) ^ py.wrapping_mul(7)) % 25) as u8;
            let moss = (px.wrapping_mul(3) ^ py.wrapping_mul(11)) % 5 == 0;
            if moss { (60, 130, 60, 255) } else { (130 + v, 130 + v, 130 + v, 255) }
        }
        25 => { // Obsidian - very dark purple
            let v = ((px.wrapping_mul(7) ^ py.wrapping_mul(11)) % 5) as u8;
            (15 + v, 5 + v, 25 + v, 255)
        }
        _ => {
            let hash = (block_id as u32).wrapping_mul(2654435761);
            let r = ((hash >> 16) & 0xFF) as u8;
            let g = ((hash >> 8) & 0xFF) as u8;
            let b = (hash & 0xFF) as u8;
            (r, g, b, 255)
        }
    }
}

fn create_projection_matrix(width: i32, height: i32, fov: f32) -> [f32; 16] {
    let aspect = width as f32 / height as f32;
    let f = 1.0 / (fov.to_radians() / 2.0).tan();
    let near = 0.1f32;
    let far = 1000.0f32;

    [
        f / aspect, 0.0, 0.0, 0.0,
        0.0, f, 0.0, 0.0,
        0.0, 0.0, (far + near) / (near - far), -1.0,
        0.0, 0.0, (2.0 * far * near) / (near - far), 0.0,
    ]
}

fn create_view_matrix(player: &Player) -> [f32; 16] {
    let (sin_yaw, cos_yaw) = player.yaw.to_radians().sin_cos();
    let (sin_pitch, cos_pitch) = player.pitch.to_radians().sin_cos();

    let forward = [
        cos_yaw * cos_pitch,
        sin_pitch,
        sin_yaw * cos_pitch,
    ];

    let up = [0.0f32, 1.0, 0.0];
    let right = [
        sin_yaw,
        0.0,
        -cos_yaw,
    ];

    let pos = [player.x as f32, player.y as f32, player.z as f32];

    [
        right[0], up[0], -forward[0], 0.0,
        right[1], up[1], -forward[1], 0.0,
        right[2], up[2], -forward[2], 0.0,
        -dot(&right, &pos), -dot(&up, &pos), dot(&forward, &pos), 1.0,
    ]
}

fn dot(a: &[f32; 3], b: &[f32; 3]) -> f32 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

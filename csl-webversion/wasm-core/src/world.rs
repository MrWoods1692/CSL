// World management - Chunk-based infinite world
// Handles chunk loading, unloading, block storage, and terrain generation

use std::collections::HashMap;

/// Block types (Minecraft-compatible IDs)
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u16)]
pub enum BlockType {
    Air = 0,
    Stone = 1,
    Grass = 2,
    Dirt = 3,
    Cobblestone = 4,
    Wood = 5,
    Bedrock = 7,
    Water = 9,
    Lava = 11,
    Sand = 12,
    Gravel = 13,
    GoldOre = 14,
    IronOre = 15,
    CoalOre = 16,
    Log = 17,
    Leaves = 18,
    DiamondOre = 56,
    Custom(u16),
}

impl BlockType {
    pub fn is_solid(&self) -> bool {
        !matches!(self, BlockType::Air | BlockType::Water)
    }

    pub fn is_transparent(&self) -> bool {
        matches!(self, BlockType::Air | BlockType::Water | BlockType::Leaves)
    }

    pub fn texture_index(&self) -> u16 {
        match self {
            BlockType::Air => 0,
            BlockType::Stone => 0,
            BlockType::Dirt => 1,
            BlockType::Grass => 2,
            BlockType::Cobblestone => 3,
            BlockType::Wood => 4,
            BlockType::Bedrock => 5,
            BlockType::DiamondOre => 6,
            BlockType::GoldOre => 7,
            BlockType::IronOre => 8,
            BlockType::CoalOre => 9,
            BlockType::Water => 10,
            BlockType::Lava => 11,
            BlockType::Sand => 12,
            BlockType::Gravel => 13,
            BlockType::Log => 14,
            BlockType::Leaves => 15,
            _ => 0,
        }
    }
}

/// A 16x384x16 chunk of blocks (1.18+ world height)
pub struct Chunk {
    pub x: i64,
    pub z: i64,
    blocks: Box<[BlockType; 16 * 384 * 16]>,
    pub dirty: bool,
    pub mesh_needs_update: bool,
}

impl Chunk {
    pub fn new(x: i64, z: i64) -> Self {
        Chunk {
            x,
            z,
            blocks: Box::new([BlockType::Air; 16 * 384 * 16]),
            dirty: false,
            mesh_needs_update: true,
        }
    }

    pub fn get_block(&self, x: usize, y: usize, z: usize) -> BlockType {
        if x >= 16 || y >= 384 || z >= 16 {
            return BlockType::Air;
        }
        self.blocks[y * 256 + z * 16 + x]
    }

    pub fn set_block(&mut self, x: usize, y: usize, z: usize, block: BlockType) {
        if x >= 16 || y >= 384 || z >= 16 {
            return;
        }
        self.blocks[y * 256 + z * 16 + x] = block;
        self.dirty = true;
        self.mesh_needs_update = true;
    }

    /// Generate terrain for this chunk
    pub fn generate(&mut self, seed: u64) {
        for x in 0..16 {
            for z in 0..16 {
                let world_x = self.x * 16 + x as i64;
                let world_z = self.z * 16 + z as i64;
                
                // Height calculation using simplex-like noise
                let height = calculate_height(world_x, world_z, seed);
                let base_y = (height + 64) as usize;
                
                // Bedrock layer
                self.set_block(x, 0, z, BlockType::Bedrock);
                
                for y in 1..base_y.saturating_sub(4) {
                    self.set_block(x, y, z, BlockType::Stone);
                }
                
                for y in base_y.saturating_sub(4)..base_y {
                    self.set_block(x, y, z, BlockType::Dirt);
                }
                
                // Grass on top
                if base_y < 384 {
                    self.set_block(x, base_y, z, BlockType::Grass);
                }
                
                // Water below sea level
                if base_y < 64 {
                    for y in base_y + 1..=64 {
                        if y < 384 {
                            self.set_block(x, y, z, BlockType::Water);
                        }
                    }
                }
                
                // Sand near water
                if base_y >= 62 && base_y <= 66 {
                    self.set_block(x, base_y, z, BlockType::Sand);
                }
            }
        }
    }
}

/// World manages all loaded chunks
pub struct World {
    chunks: HashMap<(i64, i64), Chunk>,
    seed: u64,
    spawn_point: (f64, f64, f64),
}

impl World {
    pub fn new() -> Self {
        World {
            chunks: HashMap::new(),
            seed: 0,
            spawn_point: (0.0, 64.0, 0.0),
        }
    }

    pub fn generate(&mut self, seed: u64) {
        self.seed = seed;
        self.chunks.clear();
        
        // Generate spawn area chunks
        for dx in -4..=4 {
            for dz in -4..=4 {
                let mut chunk = Chunk::new(dx, dz);
                chunk.generate(self.seed);
                self.chunks.insert((dx, dz), chunk);
            }
        }
    }

    pub fn get_chunk(&self, x: i64, z: i64) -> Option<&Chunk> {
        self.chunks.get(&(x, z))
    }

    pub fn get_chunk_mut(&mut self, x: i64, z: i64) -> Option<&mut Chunk> {
        self.chunks.get_mut(&(x, z))
    }

    pub fn get_block(&self, x: i64, y: i64, z: i64) -> BlockType {
        let chunk_x = x >> 4;
        let chunk_z = z >> 4;
        let local_x = (x & 15) as usize;
        let local_z = (z & 15) as usize;
        
        if y < 0 || y >= 384 {
            return BlockType::Air;
        }
        
        match self.chunks.get(&(chunk_x, chunk_z)) {
            Some(chunk) => chunk.get_block(local_x, y as usize, local_z),
            None => BlockType::Air,
        }
    }

    pub fn set_block(&mut self, x: i64, y: i64, z: i64, block: BlockType) {
        let chunk_x = x >> 4;
        let chunk_z = z >> 4;
        let block_x = (x & 15) as usize;
        let block_z = (z & 15) as usize;
        
        if y < 0 || y >= 384 {
            return;
        }
        
        if let Some(chunk) = self.chunks.get_mut(&(chunk_x, chunk_z)) {
            chunk.set_block(block_x, y as usize, block_z, block);
        }
    }

    /// Tick world - load/unload chunks based on player position
    pub fn tick(&mut self, player_pos: [f64; 3]) {
        let player_chunk_x = (player_pos[0] / 16.0) as i64;
        let player_chunk_z = (player_pos[2] / 16.0) as i64;
        let load_distance = 8;
        
        // Load new chunks
        for dx in -load_distance..=load_distance {
            for dz in -load_distance..=load_distance {
                let cx = player_chunk_x + dx;
                let cz = player_chunk_z + dz;
                
                if !self.chunks.contains_key(&(cx, cz)) {
                    let mut chunk = Chunk::new(cx, cz);
                    chunk.generate(self.seed);
                    self.chunks.insert((cx, cz), chunk);
                }
            }
        }
        
        // Unload far chunks
        let unload_distance = load_distance + 4;
        self.chunks.retain(|(cx, cz), _| {
            let dx = cx - player_chunk_x;
            let dz = cz - player_chunk_z;
            dx.abs() <= unload_distance && dz.abs() <= unload_distance
        });
    }

    /// Handle chunk data from server
    pub fn handle_chunk_data(&mut self, _data: &[u8]) {
        // Parse server chunk data packet (0x20 in play mode)
        // Format (1.21.4):
        // - Chunk X (i32), Chunk Z (i32)
        // - Heightmaps (NBT, skipped for now)
        // - Data size (varint) + chunk section data
        // Full implementation would parse NBT and section data
    }

    pub fn handle_light_data(&mut self, _data: &[u8]) {
        // Parse light update packet (0x24 in play mode)
        // Contains sky light and block light arrays per chunk section
    }

    pub fn handle_block_update(&mut self, _data: &[u8]) {
        // Parse block update packet (0x3E in play mode)
        // Format: location (long) + block_id (varint)
        // location = ((x & 0x3FFFFFF) << 38) | ((z & 0x3FFFFFF) << 12) | (y & 0xFFF)
    }

    pub fn spawn_point(&self) -> [f64; 3] {
        [self.spawn_point.0, self.spawn_point.1, self.spawn_point.2]
    }
}

/// Simple height calculation using sine-based noise
fn calculate_height(x: i64, z: i64, seed: u64) -> i64 {
    let fx = x as f64 * 0.01;
    let fz = z as f64 * 0.01;
    let s = seed as f64 * 0.001;
    
    let h = (fx.sin() * 10.0 
        + (fx * 2.0 + s).cos() * 8.0
        + (fz * 1.5).sin() * 12.0
        + (fz * 3.0 + s).cos() * 6.0
        + ((fx + fz) * 0.7).sin() * 15.0
        + ((fx - fz) * 0.5 + s).cos() * 5.0) as i64;
    
    h
}
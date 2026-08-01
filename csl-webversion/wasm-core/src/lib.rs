// CSL Web Runner - WASM Core Library
// Minecraft-compatible client engine

pub mod protocol;
pub mod renderer;
pub mod world;
pub mod entity;
pub mod mod_api;
pub mod input;
pub mod utils;

use wasm_bindgen::prelude::*;

/// Minecraft version identifier
#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum McVersion {
    V1_21_4,
    V1_20_4,
    V1_19_4,
    V1_18_2,
    V1_17_1,
    V1_16_5,
    V1_12_2,
    V1_8_9,
}

impl McVersion {
    pub fn protocol_version(&self) -> i32 {
        match self {
            McVersion::V1_21_4 => 769,
            McVersion::V1_20_4 => 765,
            McVersion::V1_19_4 => 762,
            McVersion::V1_18_2 => 758,
            McVersion::V1_17_1 => 756,
            McVersion::V1_16_5 => 754,
            McVersion::V1_12_2 => 340,
            McVersion::V1_8_9 => 47,
        }
    }

    pub fn version_string(&self) -> &str {
        match self {
            McVersion::V1_21_4 => "1.21.4",
            McVersion::V1_20_4 => "1.20.4",
            McVersion::V1_19_4 => "1.19.4",
            McVersion::V1_18_2 => "1.18.2",
            McVersion::V1_17_1 => "1.17.1",
            McVersion::V1_16_5 => "1.16.5",
            McVersion::V1_12_2 => "1.12.2",
            McVersion::V1_8_9 => "1.8.9",
        }
    }
}

/// Main game engine that ties everything together
#[wasm_bindgen]
pub struct GameEngine {
    version: McVersion,
    world: world::World,
    renderer: renderer::Renderer,
    input_manager: input::InputManager,
    player: entity::Player,
    mod_manager: mod_api::ModManager,
    network: Option<protocol::NetworkClient>,
    running: bool,
}

#[wasm_bindgen]
impl GameEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(version_str: &str) -> Result<GameEngine, JsValue> {
        console_error_panic_hook::set_once();
        
        let version = match version_str {
            "1.21.4" => McVersion::V1_21_4,
            "1.20.4" => McVersion::V1_20_4,
            "1.19.4" => McVersion::V1_19_4,
            "1.18.2" => McVersion::V1_18_2,
            "1.17.1" => McVersion::V1_17_1,
            "1.16.5" => McVersion::V1_16_5,
            "1.12.2" => McVersion::V1_12_2,
            "1.8.9" => McVersion::V1_8_9,
            _ => return Err(JsValue::from_str(&format!("Unsupported version: {}", version_str))),
        };

        Ok(GameEngine {
            version: version.clone(),
            world: world::World::new(),
            renderer: renderer::Renderer::new()?,
            input_manager: input::InputManager::new(),
            player: entity::Player::new(),
            mod_manager: mod_api::ModManager::new(),
            network: None,
            running: false,
        })
    }

    /// Initialize the engine with a canvas element
    pub fn init(&mut self, canvas_id: &str) -> Result<(), JsValue> {
        utils::debug(&format!("Initializing engine for Minecraft {}", self.version.version_string()));
        self.renderer = renderer::Renderer::new()?;
        self.input_manager.attach(canvas_id)?;
        utils::debug("Engine initialized successfully");
        Ok(())
    }

    /// Connect to a Minecraft server
    pub fn connect_server(&mut self, host: &str, port: u16) -> Result<(), JsValue> {
        utils::log(&format!("Connecting to server {}:{}", host, port));
        let mut client = protocol::NetworkClient::new(self.version.clone());
        client.connect(host, port)?;
        self.network = Some(client);
        utils::log("Connected to server");
        Ok(())
    }

    /// Load a singleplayer world
    pub fn load_singleplayer(&mut self, seed: u32) {
        utils::log(&format!("Loading singleplayer world with seed: {}", seed));
        self.world.generate(seed as u64);
        let spawn = self.world.spawn_point();
        self.player.x = spawn[0];
        self.player.y = spawn[1];
        self.player.z = spawn[2];
        utils::log(&format!("World generated, spawn at: ({:.1}, {:.1}, {:.1})", spawn[0], spawn[1], spawn[2]));
    }

    /// Load a mod into the engine
    pub fn load_mod(&mut self, mod_bytes: &[u8]) -> Result<(), JsValue> {
        utils::debug("Loading external mod...");
        self.mod_manager.load_mod(mod_bytes)
    }

    /// Enable/disable a loaded mod
    pub fn toggle_mod(&mut self, mod_id: &str, enabled: bool) {
        utils::debug(&format!("Toggling mod '{}': {}", mod_id, enabled));
        self.mod_manager.toggle(mod_id, enabled);
    }

    /// Get list of loaded mods
    pub fn get_mods(&self) -> String {
        serde_json::to_string(&self.mod_manager.list_mods()).unwrap_or_default()
    }

    /// Get mod count
    pub fn get_mod_count(&self) -> usize {
        self.mod_manager.mod_count()
    }

    /// Main game loop tick
    pub fn tick(&mut self, dt: f64) -> Result<(), JsValue> {
        if !self.running { return Ok(()); }

        // Process input
        let input_state = self.input_manager.poll();
        
        // Update player
        self.player.update(&input_state, dt, &self.world);
        
        // Process network packets
        if let Some(ref mut network) = self.network {
            network.tick(&mut self.world, &mut self.player);
        }
        
        // Update world (chunk loading/unloading)
        self.world.tick(self.player.position());
        
        // Run mod ticks
        self.mod_manager.tick(&mut self.world, &mut self.player);
        
        // Render
        self.renderer.render(&self.world, &self.player, &self.mod_manager)?;
        
        Ok(())
    }

    pub fn start(&mut self) {
        utils::log("Game engine started");
        self.running = true;
    }

    pub fn stop(&mut self) {
        utils::log("Game engine stopped");
        self.running = false;
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn get_version(&self) -> String {
        self.version.version_string().to_string()
    }

    pub fn get_player_position(&self) -> String {
        serde_json::to_string(&self.player.position()).unwrap_or_default()
    }

    pub fn get_fps(&self) -> f64 {
        self.renderer.fps()
    }

    /// Get engine status as JSON
    pub fn get_status(&self) -> String {
        let status = serde_json::json!({
            "version": self.version.version_string(),
            "running": self.running,
            "fps": self.renderer.fps(),
            "position": self.player.position(),
            "mods_loaded": self.mod_manager.mod_count(),
            "chunks_loaded": 0,
            "connected": self.network.is_some(),
        });
        status.to_string()
    }
}
// Minecraft 1.19.4 WASM Module

use wasm_bindgen::prelude::*;
use csl_wasm_core::GameEngine;

#[wasm_bindgen]
pub struct Mc1194Engine {
    engine: GameEngine,
}

#[wasm_bindgen]
impl Mc1194Engine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<Mc1194Engine, JsValue> {
        Ok(Mc1194Engine {
            engine: GameEngine::new("1.19.4")?,
        })
    }

    pub fn init(&mut self, canvas_id: &str) -> Result<(), JsValue> {
        self.engine.init(canvas_id)
    }

    pub fn start(&mut self) { self.engine.start(); }
    pub fn stop(&mut self) { self.engine.stop(); }
    
    pub fn tick(&mut self, dt: f64) -> Result<(), JsValue> {
        self.engine.tick(dt)
    }

    pub fn connect_server(&mut self, host: &str, port: u16) -> Result<(), JsValue> {
        self.engine.connect_server(host, port)
    }

    pub fn load_singleplayer(&mut self, seed: u32) {
        self.engine.load_singleplayer(seed);
    }

    pub fn load_mod(&mut self, mod_bytes: &[u8]) -> Result<(), JsValue> {
        self.engine.load_mod(mod_bytes)
    }

    pub fn get_version(&self) -> String { self.engine.get_version() }
    pub fn get_fps(&self) -> f64 { self.engine.get_fps() }
    pub fn get_player_position(&self) -> String { self.engine.get_player_position() }
    pub fn get_status(&self) -> String { self.engine.get_status() }
    pub fn get_mod_count(&self) -> usize { self.engine.get_mod_count() }
    pub fn get_mods(&self) -> String { self.engine.get_mods() }
    pub fn toggle_mod(&mut self, mod_id: &str, enabled: bool) {
        self.engine.toggle_mod(mod_id, enabled);
    }
}
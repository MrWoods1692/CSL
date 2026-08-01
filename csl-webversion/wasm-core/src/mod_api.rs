// Mod API - Dynamic mod loading system
// Mods are WASM modules that implement the Mod trait

use wasm_bindgen::prelude::*;
use web_sys::WebGl2RenderingContext;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use crate::world::World;
use crate::entity::Player;
use crate::renderer::Renderer;

/// Mod metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub mc_versions: Vec<String>,
    pub dependencies: Vec<String>,
    pub mod_type: String,
}

/// Mod trait - implemented by all mods
pub trait Mod: Send + Sync {
    fn info(&self) -> &ModInfo;
    
    /// Called when the mod is loaded
    fn on_load(&mut self) {}
    
    /// Called when the mod is unloaded
    fn on_unload(&mut self) {}
    
    /// Called each game tick
    fn on_tick(&mut self, world: &mut World, player: &mut Player) {}
    
    /// Called before rendering
    fn on_render_pre(&mut self, renderer: &mut Renderer) {}
    
    /// Called after rendering (for HUD overlays)
    fn on_render_post(&mut self, renderer: &mut Renderer) {}
    
    /// Handle keyboard input
    fn on_key(&mut self, key: &str, pressed: bool) -> bool { false }
    
    /// Handle mouse input
    fn on_mouse(&mut self, button: i32, pressed: bool) -> bool { false }
    
    /// Get mod settings UI (returns HTML string)
    fn settings_html(&self) -> Option<String> { None }
}

/// Mod manager handles loading, unloading, and ticking mods
pub struct ModManager {
    mods: Vec<Box<dyn Mod>>,
    mod_info: HashMap<String, ModInfo>,
    enabled: HashMap<String, bool>,
}

impl ModManager {
    pub fn new() -> Self {
        let mut manager = ModManager {
            mods: Vec::new(),
            mod_info: HashMap::new(),
            enabled: HashMap::new(),
        };
        
        // Load built-in mods
        manager.register_builtin_mod(Box::new(builtin::MinimapMod::new()));
        manager.register_builtin_mod(Box::new(builtin::ItemViewerMod::new()));
        manager.register_builtin_mod(Box::new(builtin::OptifineMod::new()));
        
        manager
    }

    /// Register a built-in mod
    fn register_builtin_mod(&mut self, mod_instance: Box<dyn Mod>) {
        let info = mod_instance.info().clone();
        self.mod_info.insert(info.id.clone(), info.clone());
        self.enabled.insert(info.id.clone(), true);
        self.mods.push(mod_instance);
    }

    /// Load a mod from WASM bytes (external mod)
    pub fn load_mod(&mut self, _mod_bytes: &[u8]) -> Result<(), JsValue> {
        // External mod loading would:
        // 1. Parse the mod manifest from the WASM module
        // 2. Validate version compatibility
        // 3. Check dependencies
        // 4. Instantiate the WASM module
        // 5. Call on_load() on the mod instance
        
        // For now, return a placeholder result
        let info = ModInfo {
            id: format!("mod_{}", self.mods.len()),
            name: "External Mod".to_string(),
            version: "0.1.0".to_string(),
            description: "An externally loaded mod".to_string(),
            author: "Unknown".to_string(),
            mc_versions: vec!["1.21.4".to_string()],
            dependencies: vec![],
            mod_type: "general".to_string(),
        };
        
        self.mod_info.insert(info.id.clone(), info.clone());
        self.enabled.insert(info.id.clone(), true);
        
        Ok(())
    }

    /// Toggle a mod on/off
    pub fn toggle(&mut self, mod_id: &str, enabled: bool) {
        if let Some(current) = self.enabled.get_mut(mod_id) {
            *current = enabled;
        }
    }

    /// Check if a mod is enabled
    pub fn is_enabled(&self, mod_id: &str) -> bool {
        self.enabled.get(mod_id).copied().unwrap_or(false)
    }

    /// Get mod count
    pub fn mod_count(&self) -> usize {
        self.mods.len()
    }

    /// List all loaded mods
    pub fn list_mods(&self) -> Vec<ModInfo> {
        self.mod_info.values().cloned().collect()
    }

    /// Tick all enabled mods
    pub fn tick(&mut self, world: &mut World, player: &mut Player) {
        for mod_instance in self.mods.iter_mut() {
            let id = &mod_instance.info().id;
            if self.enabled.get(id).copied().unwrap_or(true) {
                mod_instance.on_tick(world, player);
            }
        }
    }

    /// Render overlays from mods
    pub fn render_overlays(&self, _gl: &WebGl2RenderingContext, _player: &Player) -> Result<(), JsValue> {
        // Mods can render custom overlays here
        // Each mod's on_render_post would be called with access to the GL context
        Ok(())
    }
}

/// Built-in mods that come with the launcher

pub mod builtin {
    use super::*;

    /// Minimap mod
    pub struct MinimapMod {
        info: ModInfo,
        enabled: bool,
    }

    impl MinimapMod {
        pub fn new() -> Self {
            MinimapMod {
                info: ModInfo {
                    id: "csl.minimap".to_string(),
                    name: "CSL Minimap".to_string(),
                    version: "1.0.0".to_string(),
                    description: "A minimap overlay showing nearby terrain".to_string(),
                    author: "CSL Team".to_string(),
                    mc_versions: vec!["1.21.4".to_string(), "1.20.4".to_string(), "1.19.4".to_string()],
                    dependencies: vec![],
                    mod_type: "utility".to_string(),
                },
                enabled: true,
            }
        }
    }

    impl Mod for MinimapMod {
        fn info(&self) -> &ModInfo { &self.info }
        
        fn on_render_post(&mut self, renderer: &mut Renderer) {
            // Render minimap in corner
        }
    }

    /// JEI-like item viewer
    pub struct ItemViewerMod {
        info: ModInfo,
    }

    impl ItemViewerMod {
        pub fn new() -> Self {
            ItemViewerMod {
                info: ModInfo {
                    id: "csl.itemviewer".to_string(),
                    name: "CSL Item Viewer".to_string(),
                    version: "1.0.0".to_string(),
                    description: "View all items and recipes".to_string(),
                    author: "CSL Team".to_string(),
                    mc_versions: vec!["1.21.4".to_string(), "1.20.4".to_string(), "1.19.4".to_string()],
                    dependencies: vec![],
                    mod_type: "utility".to_string(),
                },
            }
        }
    }

    impl Mod for ItemViewerMod {
        fn info(&self) -> &ModInfo { &self.info }
    }

    /// Performance optimization mod
    pub struct OptifineMod {
        info: ModInfo,
    }

    impl OptifineMod {
        pub fn new() -> Self {
            OptifineMod {
                info: ModInfo {
                    id: "csl.optifine".to_string(),
                    name: "CSL Optifine".to_string(),
                    version: "1.0.0".to_string(),
                    description: "Performance optimizations and graphics settings".to_string(),
                    author: "CSL Team".to_string(),
                    mc_versions: vec!["1.21.4".to_string(), "1.20.4".to_string(), "1.19.4".to_string()],
                    dependencies: vec![],
                    mod_type: "optimization".to_string(),
                },
            }
        }
    }

    impl Mod for OptifineMod {
        fn info(&self) -> &ModInfo { &self.info }
    }
}
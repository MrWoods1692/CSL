// Utility functions

use wasm_bindgen::prelude::*;

/// Log levels for structured logging
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

/// Log a message to the browser console with level
pub fn log_with_level(level: LogLevel, msg: &str) {
    let js_msg = JsValue::from_str(msg);
    match level {
        LogLevel::Debug => web_sys::console::debug_1(&js_msg),
        LogLevel::Info => web_sys::console::info_1(&js_msg),
        LogLevel::Warn => web_sys::console::warn_1(&js_msg),
        LogLevel::Error => web_sys::console::error_1(&js_msg),
    }
}

/// Log a message to the browser console (info level)
#[wasm_bindgen]
pub fn log(msg: &str) {
    web_sys::console::log_1(&JsValue::from_str(msg));
}

/// Log a debug message
pub fn debug(msg: &str) {
    log_with_level(LogLevel::Debug, msg);
}

/// Log a warning message
pub fn warn(msg: &str) {
    log_with_level(LogLevel::Warn, msg);
}

/// Log an error message
pub fn error(msg: &str) {
    log_with_level(LogLevel::Error, msg);
}

/// Get current timestamp in milliseconds
pub fn now() -> f64 {
    js_sys::Date::now()
}

/// Generate a random number between min and max
pub fn random_range(min: f64, max: f64) -> f64 {
    js_sys::Math::random() * (max - min) + min
}

/// Simple hash function for procedural generation
pub fn hash(x: i32, y: i32, z: i32) -> u32 {
    let mut h = (x as u64).wrapping_mul(374761393);
    h = h.wrapping_add((y as u64).wrapping_mul(668265263));
    h = h.wrapping_add((z as u64).wrapping_mul(1274126177));
    h = h.wrapping_mul(2654435761);
    (h >> 32) as u32
}

/// Smooth noise function for terrain generation
pub fn noise(x: f64, y: f64, seed: u64) -> f64 {
    let ix = x.floor() as i32;
    let iy = y.floor() as i32;
    let fx = x - ix as f64;
    let fy = y - iy as f64;
    
    let s = seed as f64 * 0.001;
    
    // Smooth interpolation
    let u = fx * fx * (3.0 - 2.0 * fx);
    let v = fy * fy * (3.0 - 2.0 * fy);
    
    let a = (ix as f64 * 12.9898 + iy as f64 * 78.233 + s).sin() * 43758.5453;
    let b = ((ix + 1) as f64 * 12.9898 + iy as f64 * 78.233 + s).sin() * 43758.5453;
    let c = (ix as f64 * 12.9898 + (iy + 1) as f64 * 78.233 + s).sin() * 43758.5453;
    let d = ((ix + 1) as f64 * 12.9898 + (iy + 1) as f64 * 78.233 + s).sin() * 43758.5453;
    
    let a = a - a.floor();
    let b = b - b.floor();
    let c = c - c.floor();
    let d = d - d.floor();
    
    // Bilinear interpolation
    let i1 = a + (b - a) * u;
    let i2 = c + (d - c) * u;
    i1 + (i2 - i1) * v
}

/// Format a duration in milliseconds to a human-readable string
pub fn format_duration(ms: f64) -> String {
    if ms < 1000.0 {
        format!("{:.0}ms", ms)
    } else if ms < 60000.0 {
        format!("{:.1}s", ms / 1000.0)
    } else {
        let mins = (ms / 60000.0) as u64;
        let secs = ((ms as u64) % 60000) / 1000;
        format!("{}m{}s", mins, secs)
    }
}
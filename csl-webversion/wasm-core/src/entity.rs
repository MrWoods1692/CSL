// Entity system - Player, mobs, items, etc.

use crate::world::World;
use crate::input::InputState;

/// Player entity
pub struct Player {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub yaw: f32,
    pub pitch: f32,
    pub velocity: [f64; 3],
    pub on_ground: bool,
    pub health: f32,
    pub max_health: f32,
    pub food_level: i32,
    pub experience: f32,
    pub level: i32,
    pub gamemode: Gamemode,
    pub sneaking: bool,
    pub sprinting: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Gamemode {
    Survival,
    Creative,
    Adventure,
    Spectator,
}

impl Player {
    pub fn new() -> Self {
        Player {
            x: 0.0,
            y: 64.0,
            z: 0.0,
            yaw: 0.0,
            pitch: 0.0,
            velocity: [0.0, 0.0, 0.0],
            on_ground: false,
            health: 20.0,
            max_health: 20.0,
            food_level: 20,
            experience: 0.0,
            level: 0,
            gamemode: Gamemode::Survival,
            sneaking: false,
            sprinting: false,
        }
    }

    pub fn position(&self) -> [f64; 3] {
        [self.x, self.y, self.z]
    }

    /// Update player based on input
    pub fn update(&mut self, input: &InputState, dt: f64, world: &World) {
        let speed = if self.sprinting { 8.4 } else { 4.317 };
        let dt = dt as f32;
        
        // Mouse look
        self.yaw += input.mouse_dx * 0.15;
        self.pitch = (self.pitch - input.mouse_dy * 0.15).clamp(-89.0, 89.0);
        
        // Movement direction
        let (sin_yaw, cos_yaw) = (self.yaw.to_radians().sin(), self.yaw.to_radians().cos());
        
        let mut move_x = 0.0f32;
        let mut move_z = 0.0f32;
        
        if input.forward { move_x += cos_yaw; move_z += sin_yaw; }
        if input.backward { move_x -= cos_yaw; move_z -= sin_yaw; }
        if input.left { move_x += sin_yaw; move_z -= cos_yaw; }
        if input.right { move_x -= sin_yaw; move_z += cos_yaw; }
        
        // Normalize
        let len = (move_x * move_x + move_z * move_z).sqrt();
        if len > 0.0 {
            move_x /= len;
            move_z /= len;
        }
        
        // Apply movement
        let factor = speed * dt;
        self.x += (move_x * factor) as f64;
        self.z += (move_z * factor) as f64;
        
        // Jump
        if input.jump && self.on_ground {
            self.velocity[1] = 8.4;
            self.on_ground = false;
        }
        
        // Sneak
        self.sneaking = input.sneak;
        self.sprinting = input.sprint;
        
        // Gravity
        if !self.on_ground {
            self.velocity[1] -= 32.0f64 * dt as f64;
        }
        
        self.y += self.velocity[1] as f64 * dt as f64;
        
        // Ground collision
        let ground_y = world.get_block(
            self.x as i64, 
            (self.y - 1.6) as i64, 
            self.z as i64
        );
        
        if ground_y.is_solid() {
            self.y = (self.y - 1.6).floor() as i64 as f64 + 1.6 + 1.0;
            self.velocity[1] = 0.0;
            self.on_ground = true;
        }
    }

    pub fn handle_server_position(&mut self, _data: &[u8]) {
        // Parse server position update packet (0x38 in play mode)
        // Format: x(double), y(double), z(double), yaw(float), pitch(float)
        // flags(byte), teleport_id(varint)
        // Sets player position and rotation from server
    }

    pub fn handle_health_update(&mut self, _data: &[u8]) {
        // Parse health update packet (0x5F in play mode)
        // Format: health(float), food(varint), saturation(float)
        // Updates player health, food, and saturation
    }
}

/// Entity types for mobs and items
#[derive(Debug, Clone)]
pub enum EntityType {
    Player,
    Zombie,
    Skeleton,
    Creeper,
    Spider,
    Enderman,
    Item,
    ExperienceOrb,
    Custom(String),
}

/// Generic entity
pub struct Entity {
    pub id: i32,
    pub entity_type: EntityType,
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub yaw: f32,
    pub pitch: f32,
    pub velocity: [f32; 3],
    pub health: f32,
}
// Minecraft Protocol Implementation
// Handles packet encoding/decoding for multiple Minecraft versions

use crate::McVersion;
use crate::world::World;
use crate::entity::Player;
use wasm_bindgen::prelude::*;
use bytes::{BufMut, BytesMut};

/// Packet compression threshold
const COMPRESSION_THRESHOLD: i32 = 256;

/// Network state
#[derive(Debug, Clone, PartialEq)]
pub enum ConnectionState {
    Handshaking,
    Status,
    Login,
    Play,
    Configuration,
}

/// A Minecraft network packet
#[derive(Debug, Clone)]
pub struct Packet {
    pub id: i32,
    pub data: Vec<u8>,
}

/// Network client for connecting to Minecraft servers
pub struct NetworkClient {
    version: McVersion,
    state: ConnectionState,
    compression_enabled: bool,
    encryption_enabled: bool,
    socket: Option<web_sys::WebSocket>,
    packet_queue: Vec<Packet>,
    read_buffer: BytesMut,
}

impl NetworkClient {
    pub fn new(version: McVersion) -> Self {
        NetworkClient {
            version,
            state: ConnectionState::Handshaking,
            compression_enabled: false,
            encryption_enabled: false,
            socket: None,
            packet_queue: Vec::new(),
            read_buffer: BytesMut::new(),
        }
    }

    /// Connect to a Minecraft server via WebSocket proxy
    pub fn connect(&mut self, host: &str, port: u16) -> Result<(), JsValue> {
        // In browser, we need a WebSocket-to-TCP proxy
        // For now, connect via WebSocket to a proxy server
        let ws_url = format!("wss://{}/proxy/{}:{}", 
            "mcproxy.csl.run", host, port);
        
        let ws = web_sys::WebSocket::new(&ws_url)
            .map_err(|e| JsValue::from_str(&format!("WebSocket error: {:?}", e)))?;
        
        ws.set_binary_type(web_sys::BinaryType::Arraybuffer);
        self.socket = Some(ws);
        
        // Send handshake packet
        self.send_handshake(host, port)?;
        
        Ok(())
    }

    /// Send handshake packet (0x00)
    fn send_handshake(&mut self, host: &str, port: u16) -> Result<(), JsValue> {
        let mut buf = BytesMut::new();
        
        // Packet ID: 0x00
        write_varint(&mut buf, 0x00);
        // Protocol version
        write_varint(&mut buf, self.version.protocol_version());
        // Server address
        write_string(&mut buf, host);
        // Server port
        buf.put_u16(port);
        // Next state: 2 (login)
        write_varint(&mut buf, 2);
        
        self.send_raw(&buf)?;
        self.state = ConnectionState::Login;
        
        Ok(())
    }

    /// Send login start packet (0x00)
    pub fn send_login_start(&mut self, username: &str) -> Result<(), JsValue> {
        let mut buf = BytesMut::new();
        write_varint(&mut buf, 0x00);
        write_string(&mut buf, username);
        // Generate a simple random UUID string
        let random_uuid = format!("{:08x}-{:04x}-{:04x}-{:04x}-{:012x}",
            (js_sys::Math::random() * 4294967295.0) as u32,
            (js_sys::Math::random() * 65535.0) as u16,
            (js_sys::Math::random() * 65535.0) as u16,
            (js_sys::Math::random() * 65535.0) as u16,
            (js_sys::Math::random() * 281474976710655.0) as u64,
        );
        write_string(&mut buf, &random_uuid);
        
        self.send_raw(&buf)
    }

    /// Send a raw packet (with length prefix)
    fn send_raw(&mut self, data: &BytesMut) -> Result<(), JsValue> {
        let mut packet = BytesMut::new();
        write_varint(&mut packet, data.len() as i32);
        packet.extend_from_slice(data);
        
        if let Some(ref ws) = self.socket {
            let array = js_sys::Uint8Array::new_with_length(packet.len() as u32);
            for (i, &byte) in packet.iter().enumerate() {
                array.set_index(i as u32, byte);
            }
            ws.send_with_array_buffer(&array.buffer())
                .map_err(|e| JsValue::from_str(&format!("Send error: {:?}", e)))?;
        }
        
        Ok(())
    }

    /// Process incoming packets
    pub fn tick(&mut self, world: &mut World, player: &mut Player) {
        while let Some(packet) = self.packet_queue.pop() {
            self.handle_packet(packet, world, player);
        }
    }

    /// Handle a received packet based on current state
    fn handle_packet(&mut self, packet: Packet, world: &mut World, player: &mut Player) {
        match self.state {
            ConnectionState::Login => self.handle_login_packet(packet),
            ConnectionState::Play => self.handle_play_packet(packet, world, player),
            ConnectionState::Configuration => self.handle_config_packet(packet),
            _ => {}
        }
    }

    fn handle_login_packet(&mut self, packet: Packet) {
        match packet.id {
            0x02 => { // Login Success
                self.state = ConnectionState::Play;
            }
            0x03 => { // Set Compression
                self.compression_enabled = true;
            }
            _ => {}
        }
    }

    fn handle_play_packet(&mut self, packet: Packet, world: &mut World, player: &mut Player) {
        match packet.id {
            0x0F => { // Chat Message
                // Handle chat
            }
            0x1A => { // Disconnect
                self.state = ConnectionState::Handshaking;
            }
            0x20 => { // Chunk Data
                world.handle_chunk_data(&packet.data);
            }
            0x24 => { // Update Light
                world.handle_light_data(&packet.data);
            }
            0x38 => { // Player Position and Look
                player.handle_server_position(&packet.data);
            }
            0x3E => { // Block Update
                world.handle_block_update(&packet.data);
            }
            0x5F => { // Set Health
                player.handle_health_update(&packet.data);
            }
            _ => {}
        }
    }

    fn handle_config_packet(&mut self, packet: Packet) {
        match packet.id {
            0x03 => { // Finish Configuration
                self.state = ConnectionState::Play;
            }
            _ => {}
        }
    }
}

// === VarInt / VarLong encoding ===

pub fn read_varint(buf: &mut BytesMut) -> Result<i32, &'static str> {
    let mut value = 0i32;
    let mut position = 0;
    
    loop {
        if buf.is_empty() {
            return Err("Buffer underflow");
        }
        let byte = buf.split_to(1)[0];
        value |= ((byte & 0x7F) as i32) << position;
        
        if (byte & 0x80) == 0 {
            break;
        }
        
        position += 7;
        if position >= 32 {
            return Err("VarInt too big");
        }
    }
    
    Ok(value)
}

pub fn write_varint(buf: &mut BytesMut, value: i32) {
    let mut val = value as u32;
    loop {
        let mut temp = (val & 0x7F) as u8;
        val >>= 7;
        if val != 0 {
            temp |= 0x80;
        }
        buf.put_u8(temp);
        if val == 0 {
            break;
        }
    }
}

fn read_string(buf: &mut BytesMut) -> Result<String, &'static str> {
    let len = read_varint(buf)? as usize;
    if buf.len() < len {
        return Err("invalid string length");
    }
    let bytes = buf.split_to(len);
    String::from_utf8(bytes.to_vec()).map_err(|_| "invalid utf8")
}

fn write_string(buf: &mut BytesMut, s: &str) {
    let bytes = s.as_bytes();
    write_varint(buf, bytes.len() as i32);
    buf.extend_from_slice(bytes);
}

fn write_uuid(buf: &mut BytesMut, uuid: &str) {
    // Write UUID as 16 bytes (simplified - in production parse hex string)
    buf.extend_from_slice(uuid.as_bytes());
}

fn read_uuid(buf: &mut BytesMut) -> Result<String, &'static str> {
    if buf.len() < 16 {
        return Err("invalid uuid");
    }
    let bytes = buf.split_to(16);
    Ok(String::from_utf8_lossy(&bytes).to_string())
}
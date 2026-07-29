use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// 启动器配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LauncherConfig {
    /// .minecraft 目录路径
    pub minecraft_dir: PathBuf,
    /// 最大内存分配 (MB)
    pub max_memory: u32,
    /// 最小内存分配 (MB)
    pub min_memory: u32,
    /// 额外 JVM 参数
    pub jvm_args: Vec<String>,
    /// 游戏窗口宽度
    pub window_width: u32,
    /// 游戏窗口高度
    pub window_height: u32,
    /// Java 可执行文件路径
    pub java_path: Option<String>,
}

impl Default for LauncherConfig {
    fn default() -> Self {
        let minecraft_dir = dirs_minecraft_dir();
        Self {
            minecraft_dir,
            max_memory: 4096,
            min_memory: 512,
            jvm_args: vec![
                "-XX:+UseG1GC".to_string(),
                "-XX:-UseAdaptiveSizePolicy".to_string(),
                "-XX:-OmitStackTraceInFastThrow".to_string(),
            ],
            window_width: 854,
            window_height: 480,
            java_path: None,
        }
    }
}

fn dirs_minecraft_dir() -> PathBuf {
    if let Some(base) = directories::BaseDirs::new() {
        let data_dir = base.data_dir();
        data_dir.join(".minecraft")
    } else {
        std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(".minecraft")
    }
}

use std::fs;
use std::path::Path;

const CONFIG_FILENAME: &str = "launcher_config.json";

impl LauncherConfig {
    /// 从文件加载配置，不存在则返回默认值
    pub fn load(base_dir: &Path) -> Self {
        let path = base_dir.join(CONFIG_FILENAME);
        if path.exists() {
            fs::read_to_string(&path)
                .ok()
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default()
        } else {
            Self::default()
        }
    }

    /// 保存配置到文件
    pub fn save(&self, base_dir: &Path) -> Result<(), String> {
        let path = base_dir.join(CONFIG_FILENAME);
        let json = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::create_dir_all(base_dir).map_err(|e| e.to_string())?;
        fs::write(&path, json).map_err(|e| e.to_string())?;
        Ok(())
    }
}

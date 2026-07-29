use crate::config::LauncherConfig;
use crate::version_manager::VersionDetail;
use serde::{Deserialize, Serialize};

/// 启动结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LaunchResult {
    pub success: bool,
    pub message: String,
}

/// Minecraft 启动器
pub struct MinecraftLauncher;

impl MinecraftLauncher {
    /// 构建 JVM 参数
    pub fn build_jvm_args(
        config: &LauncherConfig,
        version_detail: &VersionDetail,
    ) -> Vec<String> {
        let mut args = Vec::new();

        // 内存分配
        args.push(format!("-Xmx{}M", config.max_memory));
        args.push(format!("-Xms{}M", config.min_memory));

        // 库路径
        let natives_dir = config
            .minecraft_dir
            .join("versions")
            .join(&version_detail.id)
            .join("natives");
        args.push(format!(
            "-Djava.library.path={}",
            natives_dir.to_string_lossy()
        ));

        // 游戏目录
        args.push(format!(
            "-Dminecraft.launcher.brand=minecraft-launcher"
        ));
        args.push(format!("-Dminecraft.launcher.version=0.1.0"));

        // 用户额外 JVM 参数
        args.extend(config.jvm_args.clone());

        // 从 version JSON 解析 JVM 参数
        if let Some(arguments) = &version_detail.arguments {
            for arg in &arguments.jvm {
                match arg {
                    serde_json::Value::String(s) => {
                        // 过滤掉一些不兼容的参数
                        if !s.starts_with("-XstartOnFirstThread")
                            && !s.contains("${library_directory}")
                        {
                            args.push(s.clone());
                        }
                    }
                    serde_json::Value::Object(obj) => {
                        // 处理带 rules 的参数
                        if let Some(rules) = obj.get("rules") {
                            if Self::should_include_arg(rules) {
                                if let Some(val) = obj.get("value") {
                                    match val {
                                        serde_json::Value::String(s) => args.push(s.clone()),
                                        serde_json::Value::Array(arr) => {
                                            for s in arr {
                                                if let Some(s) = s.as_str() {
                                                    args.push(s.to_string());
                                                }
                                            }
                                        }
                                        _ => {}
                                    }
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

        // 主类
        args.push(version_detail.main_class.clone());

        args
    }

    /// 构建游戏参数
    pub fn build_game_args(
        config: &LauncherConfig,
        version_detail: &VersionDetail,
        username: &str,
        uuid: &str,
        access_token: &str,
    ) -> Vec<String> {
        let mut args = Vec::new();

        // 从 version JSON 解析游戏参数
        if let Some(mc_args) = &version_detail.minecraft_arguments {
            // 旧版本格式：字符串模板
            let replaced = mc_args
                .replace("${auth_player_name}", username)
                .replace("${auth_uuid}", uuid)
                .replace("${auth_access_token}", access_token)
                .replace("${version_name}", &version_detail.id)
                .replace("${game_directory}", &config.minecraft_dir.to_string_lossy())
                .replace(
                    "${assets_root}",
                    &config.minecraft_dir.join("assets").to_string_lossy(),
                )
                .replace(
                    "${assets_index_name}",
                    &version_detail.asset_index.id,
                )
                .replace("${user_type}", "msa");
            args.extend(replaced.split(' ').map(|s| s.to_string()));
        } else if let Some(arguments) = &version_detail.arguments {
            for arg in &arguments.game {
                match arg {
                    serde_json::Value::String(s) => {
                        let replaced = s
                            .replace("${auth_player_name}", username)
                            .replace("${auth_uuid}", uuid)
                            .replace("${auth_access_token}", access_token)
                            .replace("${version_name}", &version_detail.id)
                            .replace(
                                "${game_directory}",
                                &config.minecraft_dir.to_string_lossy(),
                            )
                            .replace(
                                "${assets_root}",
                                &config.minecraft_dir.join("assets").to_string_lossy(),
                            )
                            .replace(
                                "${assets_index_name}",
                                &version_detail.asset_index.id,
                            )
                            .replace("${user_type}", "msa");
                        args.push(replaced);
                    }
                    serde_json::Value::Object(obj) => {
                        if let Some(rules) = obj.get("rules") {
                            if Self::should_include_arg(rules) {
                                if let Some(val) = obj.get("value") {
                                    match val {
                                        serde_json::Value::String(s) => args.push(s.clone()),
                                        serde_json::Value::Array(arr) => {
                                            for s in arr {
                                                if let Some(s) = s.as_str() {
                                                    args.push(s.to_string());
                                                }
                                            }
                                        }
                                        _ => {}
                                    }
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

        // 窗口大小
        args.push(format!("--width {}", config.window_width));
        args.push(format!("--height {}", config.window_height));

        args
    }

    /// 判断是否应包含带 rules 的参数
    fn should_include_arg(rules: &serde_json::Value) -> bool {
        // 简化处理：检查 rules 数组
        if let Some(rule_array) = rules.as_array() {
            let os = std::env::consts::OS;
            for rule in rule_array {
                let action = rule["action"].as_str().unwrap_or("allow");
                if let Some(os_rule) = rule.get("os") {
                    let os_name = os_rule["name"].as_str().unwrap_or("");
                    let matches = match os_name {
                        "windows" => os == "windows",
                        "linux" => os == "linux",
                        "osx" | "macos" => os == "macos",
                        _ => false,
                    };
                    if matches && action == "allow" {
                        return true;
                    }
                    if matches && action == "disallow" {
                        return false;
                    }
                } else {
                    // 没有 OS 限制，根据 action 判断
                    return action == "allow";
                }
            }
        }
        true
    }
}

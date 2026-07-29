mod auth;
mod config;
mod launcher;
mod version_manager;

use auth::{AuthManager, AuthState, DeviceAuthResponse};
use config::LauncherConfig;
use launcher::{LaunchResult, MinecraftLauncher};
use std::sync::Mutex;
use tauri::State;
use version_manager::{VersionInfo, VersionManager};

/// 应用状态
struct AppState {
    config: Mutex<LauncherConfig>,
    auth: Mutex<AuthState>,
}

// ============ 配置相关命令 ============

#[tauri::command]
fn get_config(state: State<AppState>) -> LauncherConfig {
    state.config.lock().unwrap().clone()
}

#[tauri::command]
fn update_config(state: State<AppState>, config: LauncherConfig) -> Result<(), String> {
    let mut cfg = state.config.lock().unwrap();
    *cfg = config.clone();
    // 保存到文件
    let base_dir = directories::BaseDirs::new()
        .map(|d| d.data_dir().join("minecraft-launcher"))
        .unwrap_or_else(|| std::path::PathBuf::from("."));
    config.save(&base_dir)
}

#[tauri::command]
fn get_minecraft_dir(state: State<AppState>) -> String {
    state
        .config
        .lock()
        .unwrap()
        .minecraft_dir
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
fn set_minecraft_dir(state: State<AppState>, dir: String) -> Result<(), String> {
    let path = std::path::PathBuf::from(&dir);
    if !path.exists() {
        std::fs::create_dir_all(&path).map_err(|e| format!("创建目录失败: {}", e))?;
    }
    state.config.lock().unwrap().minecraft_dir = path;
    Ok(())
}

// ============ 版本管理命令 ============

#[tauri::command]
async fn fetch_version_list(state: State<'_, AppState>) -> Result<Vec<VersionInfo>, String> {
    let minecraft_dir = state.config.lock().unwrap().minecraft_dir.clone();
    let vm = VersionManager::new(&minecraft_dir);
    let manifest = vm.fetch_version_manifest().await?;
    Ok(manifest.versions)
}

#[tauri::command]
async fn get_installed_versions(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let minecraft_dir = state.config.lock().unwrap().minecraft_dir.clone();
    let vm = VersionManager::new(&minecraft_dir);
    Ok(vm.get_installed_versions())
}

#[tauri::command]
async fn download_version(
    state: State<'_, AppState>,
    version_id: String,
    version_url: String,
) -> Result<String, String> {
    let minecraft_dir = state.config.lock().unwrap().minecraft_dir.clone();
    let vm = VersionManager::new(&minecraft_dir);

    // 获取版本详情
    let detail = vm.fetch_version_detail(&version_url).await?;

    // 下载 client.jar
    let jar_path = vm.download_client_jar(&version_id, &detail).await?;

    Ok(jar_path.to_string_lossy().to_string())
}

// ============ 认证命令 ============

#[tauri::command]
async fn start_device_auth() -> Result<DeviceAuthResponse, String> {
    let auth_mgr = AuthManager::new();
    auth_mgr.start_device_auth().await
}

#[tauri::command]
async fn poll_device_auth(
    state: State<'_, AppState>,
    device_code: String,
) -> Result<AuthState, String> {
    let auth_mgr = AuthManager::new();
    let auth_state = auth_mgr.poll_device_auth(&device_code).await?;
    *state.auth.lock().unwrap() = auth_state.clone();
    Ok(auth_state)
}

#[tauri::command]
fn get_auth_status(state: State<AppState>) -> AuthState {
    state.auth.lock().unwrap().clone()
}

// ============ 启动命令 ============

#[tauri::command]
async fn launch_minecraft(
    state: State<'_, AppState>,
    version_id: String,
    version_url: String,
) -> Result<LaunchResult, String> {
    let config = state.config.lock().unwrap().clone();
    let auth = state.auth.lock().unwrap().clone();

    if !auth.is_authenticated {
        return Err("请先登录 Microsoft 账号".to_string());
    }

    // 获取版本详情
    let vm = VersionManager::new(&config.minecraft_dir);
    let detail = vm.fetch_version_detail(&version_url).await?;

    // 确保 client.jar 已下载
    vm.download_client_jar(&version_id, &detail).await?;

    // 构建 JVM 参数和游戏参数
    let jvm_args = MinecraftLauncher::build_jvm_args(&config, &detail);
    let game_args = MinecraftLauncher::build_game_args(
        &config,
        &detail,
        &auth.username,
        &auth.uuid,
        &auth.access_token,
    );

    // 确定 Java 路径
    let java_bin = config
        .java_path
        .unwrap_or_else(|| "java".to_string());

    // 构建 classpath
    let jar_path = config
        .minecraft_dir
        .join("versions")
        .join(&version_id)
        .join(format!("{}.jar", version_id));
    let classpath = jar_path.to_string_lossy().to_string();

    // 合并所有参数
    let mut all_args: Vec<String> = Vec::new();
    all_args.extend(jvm_args);
    all_args.push(classpath);
    all_args.extend(game_args);

    // 启动 Minecraft 进程
    let mut child = std::process::Command::new(&java_bin)
        .args(&all_args)
        .current_dir(&config.minecraft_dir)
        .spawn()
        .map_err(|e| format!("启动 Minecraft 失败: {}\n请确认 Java 已安装并可执行", e))?;

    // 不等待进程结束，让它在后台运行
    // 保存进程 handle 以便后续管理（简化处理，直接返回成功）
    // 在真实启动器中应使用 child.id() 来跟踪进程
    let _pid = child.id();

    Ok(LaunchResult {
        success: true,
        message: format!("Minecraft {} 已启动 (PID: {})", version_id, _pid),
    })
}

/// 获取启动参数预览（不实际启动）
#[tauri::command]
async fn preview_launch_args(
    state: State<'_, AppState>,
    version_id: String,
    version_url: String,
) -> Result<Vec<String>, String> {
    let config = state.config.lock().unwrap().clone();
    let auth = state.auth.lock().unwrap().clone();

    let vm = VersionManager::new(&config.minecraft_dir);
    let detail = vm.fetch_version_detail(&version_url).await?;

    let jvm_args = MinecraftLauncher::build_jvm_args(&config, &detail);
    let game_args = MinecraftLauncher::build_game_args(
        &config,
        &detail,
        &auth.username,
        &auth.uuid,
        &auth.access_token,
    );

    let mut all_args = Vec::new();
    all_args.push("java".to_string());
    all_args.extend(jvm_args);
    all_args.push(
        config
            .minecraft_dir
            .join("versions")
            .join(&version_id)
            .join(format!("{}.jar", version_id))
            .to_string_lossy()
            .to_string(),
    );
    all_args.extend(game_args);

    Ok(all_args)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let base_dir = directories::BaseDirs::new()
        .map(|d| d.data_dir().join("minecraft-launcher"))
        .unwrap_or_else(|| std::path::PathBuf::from("."));

    let config = LauncherConfig::load(&base_dir);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            config: Mutex::new(config),
            auth: Mutex::new(AuthState::default()),
        })
        .invoke_handler(tauri::generate_handler![
            // 配置
            get_config,
            update_config,
            get_minecraft_dir,
            set_minecraft_dir,
            // 版本
            fetch_version_list,
            get_installed_versions,
            download_version,
            // 认证
            start_device_auth,
            poll_device_auth,
            get_auth_status,
            // 启动
            launch_minecraft,
            preview_launch_args,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


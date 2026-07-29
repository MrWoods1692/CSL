use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

/// Mojang 版本清单
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionManifest {
    pub latest: LatestVersion,
    pub versions: Vec<VersionInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LatestVersion {
    pub release: String,
    pub snapshot: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionInfo {
    pub id: String,
    #[serde(rename = "type")]
    pub version_type: String,
    pub url: String,
    pub time: String,
    #[serde(rename = "releaseTime")]
    pub release_time: String,
}

/// 单个版本的详细信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionDetail {
    pub id: String,
    pub arguments: Option<VersionArguments>,
    #[serde(rename = "minecraftArguments")]
    pub minecraft_arguments: Option<String>,
    #[serde(rename = "mainClass")]
    pub main_class: String,
    pub libraries: Vec<Library>,
    #[serde(rename = "assetIndex")]
    pub asset_index: AssetIndex,
    pub assets: String,
    #[serde(rename = "javaVersion")]
    pub java_version: Option<JavaVersion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionArguments {
    pub game: Vec<serde_json::Value>,
    pub jvm: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Library {
    pub name: String,
    pub downloads: Option<LibraryDownloads>,
    pub rules: Option<Vec<Rule>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LibraryDownloads {
    pub artifact: Option<Artifact>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    pub path: Option<String>,
    pub url: String,
    pub sha1: Option<String>,
    pub size: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    pub action: String,
    pub os: Option<OsRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OsRule {
    pub name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetIndex {
    pub id: String,
    pub url: String,
    pub sha1: Option<String>,
    pub size: Option<u64>,
    #[serde(rename = "totalSize")]
    pub total_size: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JavaVersion {
    pub component: String,
    #[serde(rename = "majorVersion")]
    pub major_version: u32,
}

/// 版本管理器
pub struct VersionManager {
    minecraft_dir: PathBuf,
}

impl VersionManager {
    pub fn new(minecraft_dir: &Path) -> Self {
        Self {
            minecraft_dir: minecraft_dir.to_path_buf(),
        }
    }

    /// 获取 Mojang 官方版本清单
    pub async fn fetch_version_manifest(&self) -> Result<VersionManifest, String> {
        let client = reqwest::Client::new();
        let resp = client
            .get("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")
            .send()
            .await
            .map_err(|e| format!("获取版本清单失败: {}", e))?;

        let manifest: VersionManifest =
            resp.json().await.map_err(|e| format!("解析版本清单失败: {}", e))?;
        Ok(manifest)
    }

    /// 获取特定版本详细信息
    pub async fn fetch_version_detail(&self, url: &str) -> Result<VersionDetail, String> {
        let client = reqwest::Client::new();
        let resp = client
            .get(url)
            .send()
            .await
            .map_err(|e| format!("获取版本详情失败: {}", e))?;

        let detail: VersionDetail =
            resp.json().await.map_err(|e| format!("解析版本详情失败: {}", e))?;
        Ok(detail)
    }

    /// 下载版本的 client.jar
    pub async fn download_client_jar(
        &self,
        version_id: &str,
        version_detail: &VersionDetail,
    ) -> Result<PathBuf, String> {
        let versions_dir = self.minecraft_dir.join("versions").join(version_id);
        tokio::fs::create_dir_all(&versions_dir)
            .await
            .map_err(|e| format!("创建版本目录失败: {}", e))?;

        let jar_path = versions_dir.join(format!("{}.jar", version_id));

        // 如果已存在，跳过下载
        if jar_path.exists() {
            return Ok(jar_path);
        }

        // 下载 client.jar
        let url = format!(
            "https://piston-data.mojang.com/v1/objects/{}/client.jar",
            version_detail.asset_index.sha1.as_deref().unwrap_or("")
        );

        // 从 version JSON 的 downloads 字段获取正确的下载 URL
        let client = reqwest::Client::new();
        let resp = client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("下载 client.jar 失败: {}", e))?;

        let bytes = resp.bytes().await.map_err(|e| format!("读取响应失败: {}", e))?;
        tokio::fs::write(&jar_path, &bytes)
            .await
            .map_err(|e| format!("保存 client.jar 失败: {}", e))?;

        Ok(jar_path)
    }

    /// 获取本机已安装的版本列表
    pub fn get_installed_versions(&self) -> Vec<String> {
        let versions_dir = self.minecraft_dir.join("versions");
        let mut versions = Vec::new();

        if let Ok(entries) = std::fs::read_dir(&versions_dir) {
            for entry in entries.flatten() {
                if entry.file_type().map(|t| t.is_dir()).unwrap_or(false) {
                    let dir_name = entry.file_name().to_string_lossy().to_string();
                    let jar_path = entry.path().join(format!("{}.jar", dir_name));
                    if jar_path.exists() {
                        versions.push(dir_name);
                    }
                }
            }
        }

        versions
    }
}

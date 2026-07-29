use serde::{Deserialize, Serialize};

/// 认证状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthState {
    pub is_authenticated: bool,
    pub username: String,
    pub uuid: String,
    pub access_token: String,
}

impl Default for AuthState {
    fn default() -> Self {
        Self {
            is_authenticated: false,
            username: String::new(),
            uuid: String::new(),
            access_token: String::new(),
        }
    }
}

/// Microsoft OAuth 认证管理器
pub struct AuthManager {
    client_id: String,
}

impl AuthManager {
    /// 创建认证管理器
    /// 使用 Microsoft 官方启动器的 client_id（公开信息）
    pub fn new() -> Self {
        Self {
            client_id: "00000000402b5328".to_string(),
        }
    }

    /// 获取 Microsoft OAuth 认证 URL（设备码方式）
    /// 返回 (device_code, user_code, verification_uri, expires_in)
    pub async fn start_device_auth(&self) -> Result<DeviceAuthResponse, String> {
        let client = reqwest::Client::new();
        let resp = client
            .post("https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode")
            .form(&[
                ("client_id", self.client_id.as_str()),
                ("scope", "XboxLive.signin offline_access"),
            ])
            .send()
            .await
            .map_err(|e| format!("网络请求失败: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("设备认证请求失败: {}", resp.status()));
        }

        let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
        Ok(DeviceAuthResponse {
            device_code: body["device_code"].as_str().unwrap_or("").to_string(),
            user_code: body["user_code"].as_str().unwrap_or("").to_string(),
            verification_uri: body["verification_uri"]
                .as_str()
                .unwrap_or("https://microsoft.com/link")
                .to_string(),
            expires_in: body["expires_in"].as_u64().unwrap_or(900),
            interval: body["interval"].as_u64().unwrap_or(5),
        })
    }

    /// 轮询等待用户完成认证
    pub async fn poll_device_auth(&self, device_code: &str) -> Result<AuthState, String> {
        let client = reqwest::Client::new();
        let resp = client
            .post("https://login.microsoftonline.com/consumers/oauth2/v2.0/token")
            .form(&[
                ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
                ("client_id", self.client_id.as_str()),
                ("device_code", device_code),
            ])
            .send()
            .await
            .map_err(|e| format!("网络请求失败: {}", e))?;

        if !resp.status().is_success() {
            let body: serde_json::Value = resp.json().await.unwrap_or_default();
            let error = body["error"]
                .as_str()
                .unwrap_or("unknown_error")
                .to_string();
            return Err(error);
        }

        let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
        let access_token = body["access_token"].as_str().unwrap_or("").to_string();

        // 用 Microsoft token 换取 Xbox Live token
        let xbl_token = self.auth_xbox_live(&access_token).await?;

        // 用 XBL token 换取 XSTS token
        let xsts_token = self.auth_xsts(&xbl_token).await?;

        // 用 XSTS token 换取 Minecraft token
        let mc_token = self.auth_minecraft(&xsts_token).await?;

        // 获取 Minecraft 用户信息
        let profile = self.get_minecraft_profile(&mc_token).await?;

        Ok(AuthState {
            is_authenticated: true,
            username: profile.name,
            uuid: profile.id,
            access_token: mc_token,
        })
    }

    /// Xbox Live 认证
    async fn auth_xbox_live(&self, ms_token: &str) -> Result<String, String> {
        let client = reqwest::Client::new();
        let resp = client
            .post("https://user.auth.xboxlive.com/user/authenticate")
            .json(&serde_json::json!({
                "Properties": {
                    "AuthMethod": "RPS",
                    "SiteName": "user.auth.xboxlive.com",
                    "RpsTicket": format!("d={}", ms_token)
                },
                "RelyingParty": "http://auth.xboxlive.com",
                "TokenType": "JWT"
            }))
            .send()
            .await
            .map_err(|e| format!("Xbox Live 认证失败: {}", e))?;

        let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
        body["Token"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| "Xbox Live 未返回 Token".to_string())
    }

    /// XSTS 认证
    async fn auth_xsts(&self, xbl_token: &str) -> Result<String, String> {
        let client = reqwest::Client::new();
        let resp = client
            .post("https://xsts.auth.xboxlive.com/xsts/authorize")
            .json(&serde_json::json!({
                "Properties": {
                    "SandboxId": "RETAIL",
                    "UserTokens": [xbl_token]
                },
                "RelyingParty": "rp://api.minecraftservices.com/",
                "TokenType": "JWT"
            }))
            .send()
            .await
            .map_err(|e| format!("XSTS 认证失败: {}", e))?;

        let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
        body["Token"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| {
                let err = body["XErr"].as_str().unwrap_or("unknown");
                format!("XSTS 认证失败: {}", err)
            })
    }

    /// Minecraft 认证
    async fn auth_minecraft(&self, xsts_token: &str) -> Result<String, String> {
        let client = reqwest::Client::new();
        let resp = client
            .post("https://api.minecraftservices.com/authentication/login_with_xbox")
            .json(&serde_json::json!({
                "identityToken": format!("XBL3.0 x={};{}", "", xsts_token)
            }))
            .send()
            .await
            .map_err(|e| format!("Minecraft 认证失败: {}", e))?;

        let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
        body["access_token"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| "Minecraft 未返回 access_token".to_string())
    }

    /// 获取 Minecraft 用户信息
    async fn get_minecraft_profile(&self, mc_token: &str) -> Result<MinecraftProfile, String> {
        let client = reqwest::Client::new();
        let resp = client
            .get("https://api.minecraftservices.com/minecraft/profile")
            .header("Authorization", format!("Bearer {}", mc_token))
            .send()
            .await
            .map_err(|e| format!("获取用户信息失败: {}", e))?;

        let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
        Ok(MinecraftProfile {
            id: body["id"].as_str().unwrap_or("").to_string(),
            name: body["name"].as_str().unwrap_or("").to_string(),
        })
    }
}

/// 设备码认证响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceAuthResponse {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub expires_in: u64,
    pub interval: u64,
}

/// Minecraft 用户信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MinecraftProfile {
    pub id: String,
    pub name: String,
}

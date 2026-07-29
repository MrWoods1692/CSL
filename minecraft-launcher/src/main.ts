import { invoke } from "@tauri-apps/api/core";

// ============ 类型定义 ============

interface VersionInfo {
  id: string;
  version_type: string;
  url: string;
  time: string;
  release_time: string;
}

interface LauncherConfig {
  minecraft_dir: string;
  max_memory: number;
  min_memory: number;
  jvm_args: string[];
  window_width: number;
  window_height: number;
  java_path: string | null;
}

interface AuthState {
  is_authenticated: boolean;
  username: string;
  uuid: string;
  access_token: string;
}

interface DeviceAuthResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

// ============ 全局状态 ============
let allVersions: VersionInfo[] = [];
let selectedVersionId: string | null = null;
let installedVersions: string[] = [];
let currentTab: "available" | "installed" = "available";
let authPollingTimer: number | null = null;

// ============ 初始化 ============
window.addEventListener("DOMContentLoaded", async () => {
  await loadConfig();
  await checkAuth();
  await loadVersions();
  setupEventListeners();
  setStatus("就绪");
});

// ============ 配置 ============
async function loadConfig() {
  try {
    const config: LauncherConfig = await invoke("get_config");
    (document.getElementById("max-memory") as HTMLInputElement).value = String(config.max_memory);
    (document.getElementById("min-memory") as HTMLInputElement).value = String(config.min_memory);
    (document.getElementById("window-width") as HTMLInputElement).value = String(config.window_width);
    (document.getElementById("window-height") as HTMLInputElement).value = String(config.window_height);
    (document.getElementById("minecraft-dir") as HTMLInputElement).value = config.minecraft_dir;
    (document.getElementById("java-path") as HTMLInputElement).value = config.java_path || "";
    (document.getElementById("extra-jvm-args") as HTMLTextAreaElement).value = config.jvm_args.join("\n");
  } catch (e) {
    console.error("加载配置失败:", e);
    setStatus("加载配置失败");
  }
}

async function saveConfig() {
  const config: LauncherConfig = {
    minecraft_dir: (document.getElementById("minecraft-dir") as HTMLInputElement).value,
    max_memory: parseInt((document.getElementById("max-memory") as HTMLInputElement).value),
    min_memory: parseInt((document.getElementById("min-memory") as HTMLInputElement).value),
    window_width: parseInt((document.getElementById("window-width") as HTMLInputElement).value),
    window_height: parseInt((document.getElementById("window-height") as HTMLInputElement).value),
    java_path: (document.getElementById("java-path") as HTMLInputElement).value || null,
    jvm_args: (document.getElementById("extra-jvm-args") as HTMLTextAreaElement)
      .value
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0),
  };

  try {
    await invoke("update_config", { config });
    setStatus("设置已保存");
  } catch (e) {
    setStatus(`保存失败: ${e}`);
  }
}

// ============ 认证 ============
async function checkAuth() {
  try {
    const auth: AuthState = await invoke("get_auth_status");
    updateAuthUI(auth);
  } catch (e) {
    console.error("检查认证状态失败:", e);
  }
}

function updateAuthUI(auth: AuthState) {
  const statusEl = document.getElementById("user-status")!;
  const loginBtn = document.getElementById("login-btn")!;
  const logoutBtn = document.getElementById("logout-btn")!;

  if (auth.is_authenticated) {
    statusEl.textContent = `👤 ${auth.username}`;
    statusEl.style.color = "var(--green)";
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    statusEl.textContent = "未登录";
    statusEl.style.color = "var(--text-secondary)";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

async function startLogin() {
  const modal = document.getElementById("login-modal")!;
  const step1 = document.getElementById("login-step-1")!;
  const step2 = document.getElementById("login-step-2")!;

  modal.style.display = "flex";
  step1.style.display = "block";
  step2.style.display = "none";

  try {
    const resp: DeviceAuthResponse = await invoke("start_device_auth");

    // 显示验证码
    document.getElementById("auth-user-code")!.textContent = resp.user_code;
    const uri = document.getElementById("auth-verification-uri") as HTMLAnchorElement;
    uri.href = resp.verification_uri;
    uri.textContent = resp.verification_uri;

    // 复制到剪贴板
    await navigator.clipboard.writeText(resp.user_code);

    // 打开验证链接
    window.open(resp.verification_uri, "_blank");

    // 切换到步骤2
    step1.style.display = "none";
    step2.style.display = "block";

    // 开始轮询
    pollAuth(resp.device_code, resp.interval);
  } catch (e) {
    document.getElementById("login-error")!.textContent = `认证失败: ${e}`;
    document.getElementById("login-error")!.style.display = "block";
  }
}

async function pollAuth(deviceCode: string, interval: number) {
  const poll = async () => {
    try {
      const auth: AuthState = await invoke("poll_device_auth", { deviceCode });
      updateAuthUI(auth);
      closeLoginModal();
      setStatus(`登录成功！欢迎 ${auth.username}`);
      updateLaunchSelect();
    } catch (e) {
      const errStr = String(e);
      if (errStr.includes("authorization_pending") || errStr.includes("slow_down")) {
        // 继续等待
        authPollingTimer = window.setTimeout(poll, interval * 1000);
      } else if (errStr.includes("expired")) {
        document.getElementById("login-error")!.textContent = "验证码已过期，请重新登录";
        document.getElementById("login-error")!.style.display = "block";
      } else {
        document.getElementById("login-error")!.textContent = `认证错误: ${errStr}`;
        document.getElementById("login-error")!.style.display = "block";
      }
    }
  };

  authPollingTimer = window.setTimeout(poll, interval * 1000);
}

function closeLoginModal() {
  if (authPollingTimer) {
    clearTimeout(authPollingTimer);
    authPollingTimer = null;
  }
  document.getElementById("login-modal")!.style.display = "none";
}

function cancelLogin() {
  closeLoginModal();
}

async function logout() {
  // 简化处理：清除 UI 状态
  const statusEl = document.getElementById("user-status")!;
  const loginBtn = document.getElementById("login-btn")!;
  const logoutBtn = document.getElementById("logout-btn")!;
  statusEl.textContent = "未登录";
  statusEl.style.color = "var(--text-secondary)";
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
  setStatus("已退出登录");
}

// ============ 版本管理 ============
async function loadVersions() {
  try {
    // 并行加载可用版本和已安装版本
    const [versions, installed] = await Promise.all([
      invoke<VersionInfo[]>("fetch_version_list"),
      invoke<string[]>("get_installed_versions"),
    ]);

    allVersions = versions;
    installedVersions = installed;
    renderVersionList();
    updateLaunchSelect();
  } catch (e) {
    console.error("加载版本失败:", e);
    document.getElementById("version-list")!.innerHTML =
      `<div class="loading">加载失败: ${e}</div>`;
    setStatus(`加载版本列表失败: ${e}`);
  }
}

function renderVersionList() {
  const container = document.getElementById("version-list")!;
  const searchTerm = (document.getElementById("version-search") as HTMLInputElement)
    .value
    .toLowerCase();
  const typeFilter = (document.getElementById("version-type-filter") as HTMLSelectElement).value;

  let filteredVersions: VersionInfo[];

  if (currentTab === "installed") {
    // 只显示已安装的版本
    filteredVersions = allVersions.filter(v => installedVersions.includes(v.id));
  } else {
    filteredVersions = allVersions;
  }

  // 应用搜索过滤
  if (searchTerm) {
    filteredVersions = filteredVersions.filter(v =>
      v.id.toLowerCase().includes(searchTerm)
    );
  }

  // 应用类型过滤
  if (typeFilter !== "all") {
    filteredVersions = filteredVersions.filter(v => v.version_type === typeFilter);
  }

  // 限制显示数量，提升性能
  const displayVersions = filteredVersions.slice(0, 200);

  if (displayVersions.length === 0) {
    container.innerHTML = '<div class="loading">没有找到匹配的版本</div>';
    return;
  }

  container.innerHTML = displayVersions
    .map(v => {
      const isInstalled = installedVersions.includes(v.id);
      const isSelected = v.id === selectedVersionId;
      const typeLabel = v.version_type.replace("old_", "").replace("_", " ");
      return `
        <div class="version-item ${isSelected ? "selected" : ""}"
             data-version-id="${v.id}"
             data-version-url="${v.url}">
          <div class="version-info">
            <span class="version-id">${v.id}</span>
            <span class="version-type">${typeLabel}</span>
          </div>
          <span class="version-status ${isInstalled ? "status-installed" : "status-available"}">
            ${isInstalled ? "✓ 已安装" : "⬇ 可安装"}
          </span>
        </div>
      `;
    })
    .join("");

  // 绑定点击事件
  container.querySelectorAll(".version-item").forEach(item => {
    item.addEventListener("click", () => {
      const id = (item as HTMLElement).dataset.versionId!;
      selectVersion(id);
    });
  });

  updateInstallButton();
}

function selectVersion(versionId: string) {
  selectedVersionId = versionId;
  renderVersionList();

  // 自动更新启动版本选择
  (document.getElementById("launch-version-select") as HTMLSelectElement).value = versionId;

  // 更新启动按钮状态
  updateLaunchButton();
  updateInstallButton();
}

function updateInstallButton() {
  const btn = document.getElementById("install-btn") as HTMLButtonElement;
  if (!selectedVersionId) {
    btn.disabled = true;
    return;
  }
  btn.disabled = installedVersions.includes(selectedVersionId);
}

function updateLaunchSelect() {
  const select = document.getElementById("launch-version-select") as HTMLSelectElement;
  const currentVal = select.value;

  select.innerHTML = '<option value="">-- 选择版本 --</option>';

  // 显示已安装的版本
  const installedVersionInfos = allVersions.filter(v => installedVersions.includes(v.id));
  installedVersionInfos.forEach(v => {
    const option = document.createElement("option");
    option.value = v.id;
    option.textContent = `${v.id} (${v.version_type.replace("old_", "").replace("_", " ")})`;
    option.dataset.url = v.url;
    select.appendChild(option);
  });

  // 恢复选择
  if (currentVal && installedVersions.includes(currentVal)) {
    select.value = currentVal;
  }
}

function updateLaunchButton() {
  const btn = document.getElementById("launch-btn") as HTMLButtonElement;
  const select = document.getElementById("launch-version-select") as HTMLSelectElement;
  btn.disabled = !select.value;
}

async function installVersion() {
  if (!selectedVersionId) return;

  const version = allVersions.find(v => v.id === selectedVersionId);
  if (!version) return;

  const btn = document.getElementById("install-btn") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "⏳ 正在下载...";
  setStatus(`正在下载 Minecraft ${selectedVersionId}...`);

  try {
    await invoke("download_version", {
      versionId: selectedVersionId,
      versionUrl: version.url,
    });

    installedVersions.push(selectedVersionId);
    renderVersionList();
    updateLaunchSelect();
    btn.textContent = "⬇ 安装选中版本";
    setStatus(`Minecraft ${selectedVersionId} 安装完成！`);
  } catch (e) {
    btn.disabled = false;
    btn.textContent = "⬇ 安装选中版本";
    setStatus(`下载失败: ${e}`);
  }
}

// ============ 启动游戏 ============
async function launchGame() {
  const select = document.getElementById("launch-version-select") as HTMLSelectElement;
  const versionId = select.value;
  if (!versionId) return;

  const selectedOption = select.options[select.selectedIndex];
  const versionUrl = selectedOption.dataset.url || "";
  if (!versionUrl) {
    setStatus("无法获取版本信息");
    return;
  }

  const btn = document.getElementById("launch-btn") as HTMLButtonElement;
  const statusEl = document.getElementById("launch-status")!;

  btn.disabled = true;
  btn.textContent = "⏳ 正在启动...";
  statusEl.textContent = "正在准备启动参数...";
  setStatus(`正在启动 Minecraft ${versionId}...`);

  try {
    const result: { success: boolean; message: string } = await invoke("launch_minecraft", {
      versionId,
      versionUrl,
    });

    btn.textContent = "▶ 启动 Minecraft";
    btn.disabled = false;
    statusEl.textContent = result.message;
    setStatus(result.message);
  } catch (e) {
    btn.textContent = "▶ 启动 Minecraft";
    btn.disabled = false;
    statusEl.textContent = `启动失败: ${e}`;
    statusEl.style.color = "var(--accent)";
    setStatus(`启动失败: ${e}`);
  }
}

async function showLaunchArgsPreview() {
  const select = document.getElementById("launch-version-select") as HTMLSelectElement;
  const versionId = select.value;
  if (!versionId) return;

  const selectedOption = select.options[select.selectedIndex];
  const versionUrl = selectedOption.dataset.url || "";
  if (!versionUrl) return;

  try {
    const args: string[] = await invoke("preview_launch_args", { versionId, versionUrl });
    const preview = document.getElementById("launch-args-preview")!;
    const content = document.getElementById("args-content")!;
    preview.style.display = "block";
    content.textContent = args.join(" \\\n  ");
  } catch (e) {
    console.error("获取启动参数失败:", e);
  }
}

// ============ 事件监听 ============
function setupEventListeners() {
  // 登录
  document.getElementById("login-btn")!.addEventListener("click", startLogin);
  document.getElementById("logout-btn")!.addEventListener("click", logout);
  document.getElementById("cancel-login-btn")!.addEventListener("click", cancelLogin);

  // 标签切换
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = (tab as HTMLElement).dataset.tab as "available" | "installed";
      selectedVersionId = null;
      renderVersionList();
      updateInstallButton();
    });
  });

  // 搜索
  document.getElementById("version-search")!.addEventListener("input", renderVersionList);
  document.getElementById("version-type-filter")!.addEventListener("change", renderVersionList);

  // 安装
  document.getElementById("install-btn")!.addEventListener("click", installVersion);

  // 启动版本选择
  document.getElementById("launch-version-select")!.addEventListener("change", () => {
    updateLaunchButton();
    showLaunchArgsPreview();
  });

  // 启动按钮
  document.getElementById("launch-btn")!.addEventListener("click", launchGame);

  // 保存设置
  document.getElementById("save-settings-btn")!.addEventListener("click", saveConfig);

  // 点击模态框外部关闭
  document.getElementById("login-modal")!.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "login-modal") {
      cancelLogin();
    }
  });
}

// ============ 工具函数 ============
function setStatus(msg: string) {
  document.getElementById("status-message")!.textContent = msg;
}


/**
 * CSL 联机核心的传输层抽象。
 *
 * 浏览器无法直接启动 frpc 或访问任意 TCP 端口，因此这里把连接分为：
 * - P2P：WebRTC DataChannel，使用一个轻量 WebSocket 信令服务交换 SDP/ICE；
 * - FRP：解析并校验 frpc INI，交给桌面端/本地桥接器启动内置 frpc；
 * - Relay：通过 WebSocket 中继连接浏览器可访问的 Minecraft 网关。
 */

export type MultiplayerMode = 'p2p' | 'frp' | 'relay';

export interface FrpConfig {
  serverAddr: string;
  serverPort: number;
  tlsEnable: boolean;
  user: string;
  token: string;
  localIp: string;
  localPort: number;
  remotePort: number;
}

export interface MultiplayerConfig {
  mode: MultiplayerMode;
  serverAddress?: string;
  signalingUrl?: string;
  relayUrl?: string;
  frp?: FrpConfig;
}

export interface ParsedServerAddress {
  host: string;
  port: number;
}

export function parseServerAddress(value: string, defaultPort = 25565): ParsedServerAddress {
  const address = value.trim();
  if (!address) throw new Error('服务器地址不能为空');

  if (address.startsWith('[')) {
    const end = address.indexOf(']');
    if (end < 0) throw new Error('IPv6 地址格式无效');
    const host = address.slice(1, end);
    const suffix = address.slice(end + 1);
    if (!suffix) return { host, port: defaultPort };
    if (!suffix.startsWith(':')) throw new Error('IPv6 端口格式无效');
    return { host, port: parsePort(suffix.slice(1)) };
  }

  const separator = address.lastIndexOf(':');
  if (separator > 0 && address.indexOf(':') === separator) {
    return { host: address.slice(0, separator), port: parsePort(address.slice(separator + 1)) };
  }
  return { host: address, port: defaultPort };
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('端口必须是 1-65535');
  return port;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
}

/** 解析 frpc.ini 中的 [common] 和 [mc] 段，不执行任何外部程序。 */
export function parseFrpIni(ini: string): FrpConfig {
  const sections: Record<string, Record<string, string>> = {};
  let section = '';
  for (const rawLine of ini.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) continue;
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      section = header[1].trim().toLowerCase();
      sections[section] ||= {};
      continue;
    }
    const equal = line.indexOf('=');
    if (section && equal > 0) {
      sections[section][line.slice(0, equal).trim().toLowerCase()] = line.slice(equal + 1).trim();
    }
  }

  const common = sections.common;
  const mc = sections.mc;
  if (!common || !mc) throw new Error('配置必须包含 [common] 和 [mc] 段');
  if ((mc.type || '').toLowerCase() !== 'tcp') throw new Error('[mc] type 必须是 tcp');

  const required = (obj: Record<string, string>, key: string, label: string) => {
    const value = obj[key];
    if (!value) throw new Error(`${label} 不能为空`);
    return value;
  };

  return {
    serverAddr: required(common, 'server_addr', 'server_addr'),
    serverPort: parsePort(required(common, 'server_port', 'server_port')),
    tlsEnable: parseBoolean(common.tls_enable),
    user: required(common, 'user', 'user'),
    token: required(common, 'token', 'token'),
    localIp: mc.local_ip || '127.0.0.1',
    localPort: parsePort(mc.local_port || '25565'),
    remotePort: parsePort(required(mc, 'remote_port', 'remote_port')),
  };
}

export function frpConfigToIni(config: FrpConfig): string {
  return `[common]\nserver_addr = ${config.serverAddr}\nserver_port = ${config.serverPort}\ntls_enable = ${config.tlsEnable}\nuser = ${config.user}\ntoken = ${config.token}\n\n[mc]\ntype = tcp\nlocal_ip = ${config.localIp}\nlocal_port = ${config.localPort}\nremote_port = ${config.remotePort}\n`;
}

/** 创建连接策略。具体游戏协议只依赖这个稳定的传输配置，不再依赖旧联机核心。 */
export class MultiplayerCore {
  readonly config: MultiplayerConfig;

  constructor(config: MultiplayerConfig) {
    this.config = config;
  }

  resolveGameAddress(): ParsedServerAddress | undefined {
    if (this.config.mode === 'frp' && this.config.frp) {
      return { host: this.config.frp.serverAddr, port: this.config.frp.remotePort };
    }
    if (this.config.serverAddress) return parseServerAddress(this.config.serverAddress);
    return undefined;
  }

  getUserGuide(): string {
    if (this.config.mode === 'p2p') return 'P2P 模式需要双方都在线，并允许浏览器使用 WebRTC；失败时请切换到 FRP。';
    if (this.config.mode === 'frp') return '房主启动本地 Minecraft 后启动内置 frpc，访客使用显示的远程地址加入。';
    return 'Relay 模式适用于浏览器无法进行 P2P 的网络环境。';
  }
}

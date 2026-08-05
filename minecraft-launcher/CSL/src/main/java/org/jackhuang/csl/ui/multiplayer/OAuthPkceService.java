package org.jackhuang.csl.ui.multiplayer;

import org.jackhuang.csl.Metadata;

import java.awt.Desktop;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

final class OAuthPkceService {
    private static final String AUTHORIZATION_ENDPOINT = "https://account-api.qzhua.net/oauth2/authorize";
    private static final String TOKEN_ENDPOINT = "https://account-api.qzhua.net/oauth2/token";
    private static final String USERINFO_ENDPOINT = "https://account-api.qzhua.net/oauth2/userinfo";
    private static final String REDIRECT_URI = "http://127.0.0.1:11451/callback";
    private static final String LOGGED_OUT_URI = "http://127.0.0.1:11451/logged-out";
    private static final Path CONFIG = Metadata.CSL_LOCAL_HOME.resolve("config/oauth-pkce.properties");
    private static final Path TOKEN_FILE = Metadata.CSL_LOCAL_HOME.resolve("private/oauth-token.json");
    private final SecureRandom random = new SecureRandom();

    String startLogin() throws IOException {
        Map<String, String> config = loadConfig();
        String clientId = config.getOrDefault("client_id", "").trim();
        String scope = config.getOrDefault("scope", "").trim();
        if (clientId.isBlank() || scope.isBlank()) {
            throw new IOException("OAuth 配置未完成，请在 " + CONFIG + " 中填写 client_id 和 scope。\nredirect_uri=" + REDIRECT_URI);
        }

        String verifier = randomString(64);
        String state = UUID.randomUUID().toString();
        String nonce = UUID.randomUUID().toString();
        byte[] digest;
        try {
            digest = MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IOException("系统不支持 SHA-256", exception);
        }
        String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        String url = AUTHORIZATION_ENDPOINT + "?response_type=code&client_id=" + encode(clientId)
                + "&redirect_uri=" + encode(REDIRECT_URI) + "&scope=" + encode(scope)
                + "&state=" + encode(state) + "&nonce=" + encode(nonce)
                + "&code_challenge=" + encode(challenge) + "&code_challenge_method=S256";
        String code = awaitCallback(state, url);
        String tokenJson = exchangeCode(clientId, code, verifier);
        Files.createDirectories(TOKEN_FILE.getParent());
        Files.writeString(TOKEN_FILE, tokenJson, StandardCharsets.UTF_8);
        return "授权完成";
    }

    String finishLogout() throws IOException {
        Files.createDirectories(TOKEN_FILE.getParent());
        Files.writeString(TOKEN_FILE, "{}", StandardCharsets.UTF_8);
        return openBrowserAndWait(LOGGED_OUT_URI, "/logged-out");
    }

    String refreshToken() throws IOException {
        Map<String, String> config = loadConfig();
        String clientId = config.getOrDefault("client_id", "").trim();
        String tokenJson = readTokenJson();
        String refreshToken = extractJsonValue(tokenJson, "refresh_token");
        if (clientId.isBlank() || refreshToken.isBlank()) {
            throw new IOException("未找到可刷新的令牌。");
        }
        String form = "grant_type=refresh_token&client_id=" + encode(clientId)
                + "&refresh_token=" + encode(refreshToken);
        HttpRequest request = HttpRequest.newBuilder(URI.create(TOKEN_ENDPOINT))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();
        try {
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) throw new IOException("OAuth 刷新失败：HTTP " + response.statusCode());
            Files.writeString(TOKEN_FILE, response.body(), StandardCharsets.UTF_8);
            return response.body();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IOException("OAuth 刷新被中断", exception);
        }
    }

    String loadUserInfo() throws IOException {
        String accessToken = extractJsonValue(readTokenJson(), "access_token");
        if (accessToken.isBlank()) throw new IOException("未登录，无法获取用户信息。");
        HttpRequest request = HttpRequest.newBuilder(URI.create(USERINFO_ENDPOINT))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();
        try {
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) throw new IOException("userinfo 请求失败：HTTP " + response.statusCode());
            return response.body();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IOException("userinfo 请求被中断", exception);
        }
    }

    private String awaitCallback(String expectedState, String url) throws IOException {
        try (java.net.ServerSocket server = new java.net.ServerSocket()) {
            server.bind(new InetSocketAddress("127.0.0.1", 11451));
            server.setSoTimeout(180000);
            openBrowser(url);
            try (var socket = server.accept()) {
                String request = new String(socket.getInputStream().readNBytes(8192), StandardCharsets.ISO_8859_1);
                int start = request.indexOf("GET ") + 4;
                int end = request.indexOf(' ', start);
                if (start < 4 || end < 0) throw new IOException("OAuth 回调格式无效");
                String path = request.substring(start, end);
                if (!path.startsWith("/callback")) throw new IOException("OAuth 回调路径无效");
                Map<String, String> query = parseQuery(path);
                if (!expectedState.equals(query.get("state"))) throw new IOException("OAuth state 校验失败");
                String code = query.get("code");
                if (code == null || code.isBlank()) throw new IOException("OAuth 回调未返回授权码");
                reply(socket, "授权完成，请返回启动器。");
                return code;
            }
        }
    }

    private String openBrowserAndWait(String url, String expectedPath) throws IOException {
        try (java.net.ServerSocket server = new java.net.ServerSocket()) {
            server.bind(new InetSocketAddress("127.0.0.1", 11451));
            server.setSoTimeout(180000);
            openBrowser(url);
            try (var socket = server.accept()) {
                String request = new String(socket.getInputStream().readNBytes(4096), StandardCharsets.ISO_8859_1);
                int start = request.indexOf("GET ") + 4;
                int end = request.indexOf(' ', start);
                if (start < 4 || end < 0) throw new IOException("登出回调格式无效");
                String path = request.substring(start, end);
                if (!path.startsWith(expectedPath)) throw new IOException("登出回调路径无效");
                reply(socket, "已完成登出。");
                return "已完成登出";
            }
        }
    }

    private void reply(java.net.Socket socket, String body) throws IOException {
        OutputStream output = socket.getOutputStream();
        output.write(("HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: "
                + body.getBytes(StandardCharsets.UTF_8).length + "\r\nConnection: close\r\n\r\n" + body)
                .getBytes(StandardCharsets.UTF_8));
        output.flush();
    }

    private String exchangeCode(String clientId, String code, String verifier) throws IOException {
        String form = "grant_type=authorization_code&client_id=" + encode(clientId)
                + "&code=" + encode(code) + "&redirect_uri=" + encode(REDIRECT_URI)
                + "&code_verifier=" + encode(verifier);
        HttpRequest request = HttpRequest.newBuilder(URI.create(TOKEN_ENDPOINT))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();
        try {
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) throw new IOException("OAuth token 请求失败：HTTP " + response.statusCode());
            return response.body();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IOException("OAuth token 请求被中断", exception);
        }
    }

    private Map<String, String> loadConfig() throws IOException {
        Files.createDirectories(CONFIG.getParent());
        if (!Files.exists(CONFIG)) Files.writeString(CONFIG,
                "client_id=\nscope=\nredirect_uri=" + REDIRECT_URI + "\nlogout_redirect_uri=" + LOGGED_OUT_URI + "\n",
                StandardCharsets.UTF_8);
        return Files.readAllLines(CONFIG, StandardCharsets.UTF_8).stream()
                .filter(line -> !line.isBlank() && !line.startsWith("#") && line.contains("="))
                .map(line -> line.split("=", 2))
                .collect(java.util.stream.Collectors.toMap(item -> item[0].trim(), item -> item[1].trim(), (a, b) -> b));
    }

    private String readTokenJson() throws IOException {
        if (!Files.exists(TOKEN_FILE)) return "{}";
        return Files.readString(TOKEN_FILE, StandardCharsets.UTF_8);
    }

    private static String extractJsonValue(String json, String key) {
        int index = json.indexOf('"' + key + '"');
        if (index < 0) return "";
        index = json.indexOf(':', index);
        if (index < 0) return "";
        int start = json.indexOf('"', index + 1);
        int end = json.indexOf('"', start + 1);
        if (start < 0 || end < 0) return "";
        return json.substring(start + 1, end);
    }

    private static Map<String, String> parseQuery(String target) {
        int queryStart = target.indexOf('?');
        if (queryStart < 0) return Map.of();
        return java.util.Arrays.stream(target.substring(queryStart + 1).split("&"))
                .map(value -> value.split("=", 2))
                .filter(value -> value.length == 2)
                .collect(java.util.stream.Collectors.toMap(value -> decode(value[0]), value -> decode(value[1]), (a, b) -> b));
    }

    private static String randomString(int length) {
        byte[] bytes = new byte[length];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes).substring(0, length);
    }

    private static String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
    private static String decode(String value) { return URLDecoder.decode(value, StandardCharsets.UTF_8); }

    private static void openBrowser(String url) throws IOException {
        if (!Desktop.isDesktopSupported()) throw new IOException("系统不支持打开浏览器");
        Desktop.getDesktop().browse(URI.create(url));
    }
}

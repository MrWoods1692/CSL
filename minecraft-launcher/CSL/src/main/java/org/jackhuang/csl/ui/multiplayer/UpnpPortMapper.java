/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.ui.multiplayer;

import org.jetbrains.annotations.Nullable;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

/// Simple UPnP IGD port mapping — no external dependencies.
final class UpnpPortMapper {

    private static final int DISCOVERY_TIMEOUT_MS = 2000;
    private static final String SSDP_ADDRESS = "239.255.255.250";
    private static final int SSDP_PORT = 1900;
    private static final String SSDP_MSG =
            "M-SEARCH * HTTP/1.1\r\n" +
            "HOST: 239.255.255.250:1900\r\n" +
            "MAN: \"ssdp:discover\"\r\n" +
            "MX: 2\r\n" +
            "ST: urn:schemas-upnp-org:device:InternetGatewayDevice:1\r\n" +
            "\r\n";

    @Nullable
    private static volatile String cachedControlUrl;
    private static volatile long cachedControlTime;

    private UpnpPortMapper() {}

    @Nullable
    private static String discoverControl() {
        long now = System.currentTimeMillis();
        if (cachedControlUrl != null && now - cachedControlTime < 120_000L) return cachedControlUrl;
        String url = discoverGateway();
        if (url != null) {
            cachedControlUrl = url;
            cachedControlTime = now;
        }
        return url;
    }
    @Nullable
    static String discoverGateway() {
        try (DatagramSocket sock = new DatagramSocket()) {
            sock.setSoTimeout(DISCOVERY_TIMEOUT_MS);
            byte[] data = SSDP_MSG.getBytes(StandardCharsets.UTF_8);
            DatagramPacket pkt = new DatagramPacket(data, data.length,
                    InetAddress.getByName(SSDP_ADDRESS), SSDP_PORT);
            sock.send(pkt);
            byte[] buf = new byte[2048];
            DatagramPacket resp = new DatagramPacket(buf, buf.length);
            long deadline = System.currentTimeMillis() + DISCOVERY_TIMEOUT_MS;
            while (System.currentTimeMillis() < deadline) {
                try { sock.receive(resp); }
                catch (SocketTimeoutException e) { return null; }
                String body = new String(resp.getData(), 0, resp.getLength(), StandardCharsets.UTF_8);
                String location = extractHeader(body, "LOCATION");
                if (location != null) return fetchControlUrl(location);
            }
        } catch (Exception ignored) {}
        return null;
    }

    /// Asynchronously try to map (externalPort → internalPort) on localAddress via UPnP.
    /// @param protocol "TCP" or "UDP"
    static CompletableFuture<Boolean> mapPort(String localAddress, int externalPort,
                                               int internalPort, String protocol, String description) {
        return CompletableFuture.supplyAsync(() -> {
            String controlUrl = discoverControl();
            if (controlUrl == null) return false;
            return sendSoap(controlUrl, "AddPortMapping", buildMappingArgs(
                    externalPort, internalPort, localAddress, protocol, description));
        });
    }

    static CompletableFuture<Boolean> unmapPort(int externalPort, String protocol) {
        return CompletableFuture.supplyAsync(() -> {
            String controlUrl = discoverControl();
            if (controlUrl == null) return false;
            return sendSoap(controlUrl, "DeletePortMapping",
                    "<NewRemoteHost></NewRemoteHost><NewExternalPort>"
                            + externalPort + "</NewExternalPort><NewProtocol>" + protocol + "</NewProtocol>");
        });
    }

    // ---- helpers ----

    @Nullable
    private static String fetchControlUrl(String location) {
        try {
            URI uri = URI.create(location);
            URL url = uri.toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder xml = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) xml.append(line);
            reader.close();
            String text = xml.toString();
            int base = text.indexOf("<controlURL>");
            int end = text.indexOf("</controlURL>", base);
            if (base < 0 || end < 0) return null;
            String controlPath = text.substring(base + 12, end);
            return uri.resolve(controlPath).toString();
        } catch (Exception e) {
            return null;
        }
    }

    @Nullable
    private static String extractHeader(String response, String key) {
        String search = key.toUpperCase() + ":";
        for (String line : response.split("\\R")) {
            if (line.toUpperCase().startsWith(search)) {
                return line.substring(search.length()).trim();
            }
        }
        return null;
    }

    private static boolean sendSoap(String controlUrl, String action, String body) {
        try {
            URI u = URI.create(controlUrl);
            String soapBody = "<?xml version=\"1.0\"?>\r\n"
                    + "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" "
                    + "s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">\r\n"
                    + "<s:Body>\r\n"
                    + "<u:" + action + " xmlns:u=\"urn:schemas-upnp-org:service:WANIPConnection:1\">\r\n"
                    + body
                    + "</u:" + action + ">\r\n"
                    + "</s:Body>\r\n"
                    + "</s:Envelope>\r\n";
            byte[] bytes = soapBody.getBytes(StandardCharsets.UTF_8);
            URL url = u.toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "text/xml; charset=\"utf-8\"");
            conn.setRequestProperty("SOAPAction", "\"urn:utility-upnp-org:service:WANIPConnection:1#" + action + "\"");
            conn.setRequestProperty("Content-Length", Integer.toString(bytes.length));
            try (OutputStream out = conn.getOutputStream()) {
                out.write(bytes);
                out.flush();
            }
            int code = conn.getResponseCode();
            return code == 200;
        } catch (Exception e) {
            return false;
        }
    }

    private static String buildMappingArgs(int extPort, int intPort, String localIp, String protocol, String desc) {
        return "<NewRemoteHost></NewRemoteHost>"
                + "<NewExternalPort>" + extPort + "</NewExternalPort>"
                + "<NewProtocol>" + protocol + "</NewProtocol>"
                + "<NewInternalPort>" + intPort + "</NewInternalPort>"
                + "<NewInternalClient>" + localIp + "</NewInternalClient>"
                + "<NewEnabled>1</NewEnabled>"
                + "<NewPortMappingDescription>" + (desc != null ? desc : "CSL") + "</NewPortMappingDescription>"
                + "<NewLeaseDuration>0</NewLeaseDuration>";
    }
}
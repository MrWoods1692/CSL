/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.ui.multiplayer;

import org.jetbrains.annotations.Nullable;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.net.SocketTimeoutException;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

/// Handles UDP hole punching between host and guest using STUN-mapped addresses.
final class P2pHolePuncher {

    static final String HELLO_PREFIX = "CSLP2P_HELLO_";
    static final String ACK_PREFIX   = "CSLP2P_ACK_";

    record Result(boolean ok, @Nullable String error, @Nullable InetSocketAddress peer) {}

    /// Host creates an invitation code for the guest.
    static String buildInvite(String publicIp, int publicPort, String token) {
        return "p2p:" + publicIp + ":" + publicPort + ":" + token;
    }

    @Nullable
    static String[] parseInvite(String raw) {
        if (raw == null || !raw.startsWith("p2p:")) return null;
        String[] parts = raw.substring("p2p:".length()).split(":");
        if (parts.length != 3) return null;
        try { Integer.parseInt(parts[1]); } catch (NumberFormatException e) { return null; }
        return parts; // ip, port, token
    }

    /** Host listens for guest handshake on the provided socket; finishes after first correct match or timeout. */
    static CompletableFuture<Result> listenForGuest(DatagramSocket sock, String token,
                                                     Consumer<String> onProgress) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                sock.setSoTimeout(1000);
                String expect = HELLO_PREFIX + token;
                long deadline = System.currentTimeMillis() + 30_000L;
                byte[] buf = new byte[256];
                while (System.currentTimeMillis() < deadline) {
                    DatagramPacket pkt = new DatagramPacket(buf, buf.length);
                    try { sock.receive(pkt); }
                    catch (SocketTimeoutException e) { continue; }
                    String msg = new String(pkt.getData(), 0, pkt.getLength());
                    if (msg.equals(expect)) {
                        byte[] ack = (ACK_PREFIX + token).getBytes();
                        sock.send(new DatagramPacket(ack, ack.length, pkt.getSocketAddress()));
                        onProgress.accept("P2P 打洞成功：房主侧确认");
                        return new Result(true, null,
                                new InetSocketAddress(pkt.getAddress(), pkt.getPort()));
                    }
                }
                return new Result(false, "P2P 房主等待超时 (30s)", null);
            } catch (Exception e) {
                return new Result(false, rootText(e), null);
            }
        });
    }

    /** Guest sends hello loops towards the host using the provided socket. */
    static CompletableFuture<Result> knockAsGuest(DatagramSocket sock, String hostIp, int hostPort,
                                                  String token, Consumer<String> onProgress) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                sock.setSoTimeout(1000);
                InetSocketAddress target = new InetSocketAddress(hostIp, hostPort);
                byte[] hello = (HELLO_PREFIX + token).getBytes();
                long deadline = System.currentTimeMillis() + 30_000L;
                byte[] buf = new byte[256];
                while (System.currentTimeMillis() < deadline) {
                    sock.send(new DatagramPacket(hello, hello.length, target));
                    onProgress.accept("P2P 访客已发送握手");
                    DatagramPacket pkt = new DatagramPacket(buf, buf.length);
                    try { sock.receive(pkt); }
                    catch (SocketTimeoutException e) { continue; }
                    String msg = new String(pkt.getData(), 0, pkt.getLength());
                    if (msg.startsWith(ACK_PREFIX + token)) {
                        onProgress.accept("P2P 打洞成功：访客侧收到确认");
                        return new Result(true, null,
                                new InetSocketAddress(pkt.getAddress(), pkt.getPort()));
                    }
                }
                return new Result(false, "P2P 访客会话超时 (30s)", null);
            } catch (Exception e) {
                return new Result(false, rootText(e), null);
            }
        });
    }

    /// Run both STUN discovery and hole punching on the same socket for consistent port mapping.
    /// Returns (publicIp, publicPort, token) if successful, or throws on failure.
    static CompletableFuture<Result> runHolePunch(int localPort, boolean isHost, String hostIp, int hostPort,
                                                   Consumer<String> onProgress) {
        return CompletableFuture.supplyAsync(() -> {
            try (DatagramSocket sock = new DatagramSocket(null)) {
                sock.setReuseAddress(true);
                sock.bind(new InetSocketAddress(localPort));

                // Use same socket for STUN query to get consistent public mapping
                StunClient.Result stun = null;
                for (InetSocketAddress server : StunClient.STUN_SERVERS) {
                    try {
                        sock.setSoTimeout(5000);
                        byte[] request = StunClient.buildRequest();
                        sock.send(new DatagramPacket(request, request.length, server));
                        byte[] buf = new byte[1024];
                        DatagramPacket resp = new DatagramPacket(buf, buf.length);
                        sock.receive(resp);
                        StunClient.Result r = StunClient.parse(buf, resp.getLength());
                        if (r != null) { stun = r; break; }
                    } catch (Exception ignored) {}
                }
                if (stun == null) {
                    return new Result(false, "STUN查询失败：无法获取公网地址映射", null);
                }

                String token = java.util.UUID.randomUUID().toString().substring(0, 8);

                if (isHost) {
                    onProgress.accept("状态：等待访客握手…");
                    return listenForGuest(sock, token, onProgress).join();
                } else {
                    return knockAsGuest(sock, hostIp, hostPort, token, onProgress).join();
                }
            } catch (Exception e) {
                return new Result(false, rootText(e), null);
            }
        });
    }

    private static String rootText(Throwable t) {
        while (t.getCause() != null) t = t.getCause();
        String m = t.getMessage();
        return m != null ? m : t.getClass().getSimpleName();
    }
}
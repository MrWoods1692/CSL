/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.ui.multiplayer;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.jetbrains.annotations.Nullable;

/// STUN Binding Request (RFC 5389) — discovers the publicly mapped IP and port.
final class StunClient {

    static final InetSocketAddress GOOGLE = new InetSocketAddress("stun.l.google.com", 19302);
    private static final int MAGIC_COOKIE = 0x2112A442;

    private StunClient() {}

    record Result(String publicIp, int publicPort) {}

    static CompletableFuture<@Nullable Result> query(InetSocketAddress server) {
        return CompletableFuture.supplyAsync(() -> {
            try (DatagramSocket socket = new DatagramSocket()) {
                socket.setSoTimeout(5000);
                byte[] request = buildRequest();
                socket.send(new DatagramPacket(request, request.length, server));
                byte[] buf = new byte[1024];
                DatagramPacket resp = new DatagramPacket(buf, buf.length);
                socket.receive(resp);
                return parse(buf, resp.getLength());
            } catch (Exception ignored) {
                return null;
            }
        });
    }

    static CompletableFuture<@Nullable Result> lookup() {
        return query(GOOGLE);
    }

    @Nullable
    static Result queryOrNull(long timeoutMs) {
        try {
            return lookup().get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (Exception ignored) {
            return null;
        }
    }

    // ---- wire format ----

    private static byte[] buildRequest() {
        byte[] msg = new byte[20];
        msg[0] = 0x00;
        msg[1] = 0x01; // Binding Request
        int mc = MAGIC_COOKIE;
        msg[4] = (byte) (mc >>> 24);
        msg[5] = (byte) (mc >>> 16);
        msg[6] = (byte) (mc >>> 8);
        msg[7] = (byte) mc;
        Random rand = new Random();
        for (int i = 8; i < 20; i++) msg[i] = (byte) rand.nextInt(256);
        return msg;
    }

    private static @Nullable Result parse(byte[] data, int length) {
        if (length < 20) return null;
        int type = ((data[0] & 0xFF) << 8) | (data[1] & 0xFF);
        if (type != 0x0101) return null; // Binding Success
        int msgLen = ((data[2] & 0xFF) << 8) | (data[3] & 0xFF);
        int pos = 20;
        while (pos + 4 <= 20 + msgLen && pos + 4 <= length) {
            int attrType = ((data[pos] & 0xFF) << 8) | (data[pos + 1] & 0xFF);
            int attrLen = ((data[pos + 2] & 0xFF) << 8) | (data[pos + 3] & 0xFF);
            pos += 4;
            if (pos + attrLen > length) break;
            if (attrType == 0x0020) { // XOR-MAPPED-ADDRESS
                return parseXor(data, pos, attrLen);
            }
            if (attrType == 0x0001) { // MAPPED-ADDRESS
                return parseMapped(data, pos, attrLen);
            }
            pos += attrLen;
            int pad = (4 - (attrLen % 4)) % 4;
            pos += pad;
        }
        return null;
    }

    private static Result parseMapped(byte[] data, int offset, int len) {
        if (len < 8) return null;
        int family = data[offset + 1] & 0xFF;
        if (family != 0x01) return null;
        int port = ((data[offset + 2] & 0xFF) << 8) | (data[offset + 3] & 0xFF);
        String ip = (data[offset + 4] & 0xFF) + "." + (data[offset + 5] & 0xFF) + "."
                  + (data[offset + 6] & 0xFF) + "." + (data[offset + 7] & 0xFF);
        return new Result(ip, port);
    }

    private static Result parseXor(byte[] data, int offset, int len) {
        if (len < 8) return null;
        if ((data[offset + 1] & 0xFF) != 0x01) return null;
        int cookie = MAGIC_COOKIE;
        int rawPort = ((data[offset + 2] & 0xFF) << 8) | (data[offset + 3] & 0xFF);
        int port = rawPort ^ (cookie >>> 16);
        int rawIp = ((data[offset + 4] & 0xFF) << 24) | ((data[offset + 5] & 0xFF) << 16)
                  | ((data[offset + 6] & 0xFF) << 8) | (data[offset + 7] & 0xFF);
        int ipInt = rawIp ^ cookie;
        String ip = ((ipInt >>> 24) & 0xFF) + "." + ((ipInt >>> 16) & 0xFF) + "."
                  + ((ipInt >>> 8) & 0xFF) + "." + (ipInt & 0xFF);
        return new Result(ip, port);
    }
}
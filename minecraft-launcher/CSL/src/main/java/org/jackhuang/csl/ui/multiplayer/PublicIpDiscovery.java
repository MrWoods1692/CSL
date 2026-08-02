/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.ui.multiplayer;

import org.jetbrains.annotations.NotNullByDefault;

import java.net.HttpURLConnection;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/// Discovers public IPv4 addresses without requiring manual entry.
@NotNullByDefault
final class PublicIpDiscovery {
    private static final List<String> SERVICES = List.of(
            "https://api.ipify.org",
            "https://checkip.amazonaws.com",
            "https://ifconfig.me/ip");

    private PublicIpDiscovery() {
    }

    /// Queries multiple providers and returns distinct valid public IPv4 addresses.
    static List<String> discover() {
        List<String> result = new ArrayList<>();
        for (String service : SERVICES) {
            try {
                String address = request(service);
                if (isPublicIpv4(address) && !result.contains(address)) result.add(address);
            } catch (Exception ignored) {
                // Continue with another provider; public IP discovery is optional.
            }
        }
        return result;
    }

    private static String request(String service) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) URI.create(service).toURL().openConnection();
        connection.setConnectTimeout(3000);
        connection.setReadTimeout(3000);
        connection.setRequestProperty("User-Agent", "CSL-Multiplayer");
        try (var input = connection.getInputStream()) {
            return new String(input.readAllBytes()).trim();
        } finally {
            connection.disconnect();
        }
    }

    static boolean isPublicIpv4(String address) {
        String[] parts = address.split("\\.");
        if (parts.length != 4) return false;
        try {
            int first = Integer.parseInt(parts[0]);
            int second = Integer.parseInt(parts[1]);
            for (String part : parts) if (part.length() > 3 || Integer.parseInt(part) < 0
                    || Integer.parseInt(part) > 255) return false;
            return first != 10 && first != 127 && !(first == 192 && second == 168)
                    && !(first == 172 && second >= 16 && second <= 31)
                    && !(first == 169 && second == 254)
                    && !(first == 100 && second >= 64 && second <= 127);
        } catch (NumberFormatException ignored) {
            return false;
        }
    }
}

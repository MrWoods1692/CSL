/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.ui.multiplayer;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import org.jackhuang.csl.Metadata;
import org.jackhuang.csl.network.MultiplayerMode;
import org.jetbrains.annotations.NotNullByDefault;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/// Persists named multiplayer connection profiles in the launcher local data directory.
@NotNullByDefault
public final class MultiplayerProfileStore {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private static final TypeToken<List<Profile>> PROFILE_LIST = new TypeToken<>() {};
    private final Path file = Metadata.CSL_LOCAL_HOME.resolve("config/multiplayer-profiles.json");

    /// Loads all saved profiles, returning an empty list when no valid file exists.
    public List<Profile> load() {
        try {
            if (!Files.isRegularFile(file)) return new ArrayList<>();
            List<Profile> profiles = GSON.fromJson(Files.readString(file), PROFILE_LIST.getType());
            return profiles == null ? new ArrayList<>() : new ArrayList<>(profiles);
        } catch (IOException | RuntimeException ignored) {
            return new ArrayList<>();
        }
    }

    /// Saves all profiles atomically enough for launcher configuration use.
    public void save(List<Profile> profiles) throws IOException {
        Files.createDirectories(file.getParent());
        Path temporary = file.resolveSibling(file.getFileName() + ".tmp");
        Files.writeString(temporary, GSON.toJson(profiles, PROFILE_LIST.getType()));
        Files.move(temporary, file, java.nio.file.StandardCopyOption.REPLACE_EXISTING,
                java.nio.file.StandardCopyOption.ATOMIC_MOVE);
    }

    /// A named connection profile; FRP credentials remain inside the pasted configuration.
    public record Profile(String name, MultiplayerMode mode, String host, int port, String configuration) {
    }
}

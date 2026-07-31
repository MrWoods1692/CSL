/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 huangyuhui <huanghongxun2008@126.com> and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package org.jackhuang.csl.modpack.server;

import com.google.gson.JsonParseException;
import org.jackhuang.csl.download.DefaultDependencyManager;
import org.jackhuang.csl.download.GameBuilder;
import org.jackhuang.csl.game.DefaultGameRepository;
import org.jackhuang.csl.game.GameInstanceID;
import org.jackhuang.csl.modpack.MinecraftInstanceTask;
import org.jackhuang.csl.modpack.Modpack;
import org.jackhuang.csl.modpack.ModpackConfiguration;
import org.jackhuang.csl.modpack.ModpackInstallTask;
import org.jackhuang.csl.task.Task;
import org.jackhuang.csl.util.gson.JsonUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ServerModpackLocalInstallTask extends Task<Void> {

    private final Path zipFile;
    private final Modpack modpack;
    private final ServerModpackManifest manifest;
    private final GameInstanceID instanceId;
    private final DefaultGameRepository repository;
    private final List<Task<?>> dependencies = new ArrayList<>();
    private final List<Task<?>> dependents = new ArrayList<>(4);

    public ServerModpackLocalInstallTask(DefaultDependencyManager dependencyManager, Path zipFile, Modpack modpack, ServerModpackManifest manifest, GameInstanceID instanceId) {
        this.zipFile = zipFile;
        this.modpack = modpack;
        this.manifest = manifest;
        this.instanceId = instanceId;
        this.repository = dependencyManager.getGameRepository();
        Path run = repository.getRunDirectory(instanceId);

        Path json = repository.getModpackConfiguration(instanceId);
        if (repository.hasInstance(instanceId) && Files.notExists(json))
            throw new IllegalArgumentException("Instance " + instanceId + " already exists.");

        GameBuilder builder = dependencyManager.newGameBuilder().name(instanceId);
        for (ServerModpackManifest.Addon addon : manifest.getAddons()) {
            builder.version(addon.getId(), addon.getVersion());
        }

        dependents.add(builder.buildAsync());
        onDone().register(event -> {
            if (event.isFailed())
                repository.removeInstanceFromDisk(instanceId);
        });

        ModpackConfiguration<ServerModpackManifest> config = null;
        try {
            if (Files.exists(json)) {
                config = JsonUtils.fromJsonFile(json, ModpackConfiguration.typeOf(ServerModpackManifest.class));

                if (!ServerModpackProvider.INSTANCE.getName().equals(config.getType()))
                    throw new IllegalArgumentException("Instance " + instanceId + " is not a Server modpack. Cannot update this instance.");
            }
        } catch (JsonParseException | IOException ignore) {
        }
        dependents.add(new ModpackInstallTask<>(zipFile, run, modpack.getEncoding(), Collections.singletonList("/overrides"), any -> true, config).withStage("csl.modpack"));
        dependents.add(new MinecraftInstanceTask<>(zipFile, modpack.getEncoding(), Collections.singletonList("/overrides"), manifest, ServerModpackProvider.INSTANCE, modpack.getName(), modpack.getVersion(), repository.getModpackConfiguration(instanceId)).withStage("csl.modpack"));
    }

    @Override
    public List<Task<?>> getDependents() {
        return dependents;
    }

    @Override
    public List<Task<?>> getDependencies() {
        return dependencies;
    }

    @Override
    public void execute() throws Exception {
    }
}

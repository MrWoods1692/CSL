/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2020  huangyuhui <huanghongxun2008@126.com> and contributors
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
package org.jackhuang.csl.game;

import com.google.gson.JsonParseException;
import kala.compress.archivers.zip.ZipArchiveReader;
import org.jackhuang.csl.Metadata;
import org.jackhuang.csl.modpack.*;
import org.jackhuang.csl.modpack.curse.CurseModpackProvider;
import org.jackhuang.csl.modpack.mcbbs.McbbsModpackManifest;
import org.jackhuang.csl.modpack.mcbbs.McbbsModpackProvider;
import org.jackhuang.csl.modpack.modrinth.ModrinthModpackProvider;
import org.jackhuang.csl.modpack.multimc.MultiMCComponents;
import org.jackhuang.csl.modpack.multimc.MultiMCInstanceConfiguration;
import org.jackhuang.csl.modpack.multimc.MultiMCModpackProvider;
import org.jackhuang.csl.modpack.server.ServerModpackManifest;
import org.jackhuang.csl.modpack.server.ServerModpackProvider;
import org.jackhuang.csl.modpack.server.ServerModpackRemoteInstallTask;
import org.jackhuang.csl.setting.GameSettings;
import org.jackhuang.csl.setting.GameWindowType;
import org.jackhuang.csl.setting.JavaVersionType;
import org.jackhuang.csl.setting.GameDirectory;
import org.jackhuang.csl.setting.GameDirectoryManager;
import org.jackhuang.csl.task.Schedulers;
import org.jackhuang.csl.task.Task;
import org.jackhuang.csl.util.Lang;
import org.jackhuang.csl.util.PortablePath;
import org.jackhuang.csl.util.function.ExceptionalConsumer;
import org.jackhuang.csl.util.function.ExceptionalRunnable;
import org.jackhuang.csl.util.gson.JsonUtils;
import org.jackhuang.csl.util.i18n.LocalizedText;
import org.jackhuang.csl.util.io.CompressingUtils;
import org.jackhuang.csl.util.io.FileUtils;
import org.jetbrains.annotations.NotNullByDefault;
import org.jetbrains.annotations.Nullable;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.FileSystem;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

import static org.jackhuang.csl.util.Lang.mapOf;
import static org.jackhuang.csl.util.Lang.toIterable;
import static org.jackhuang.csl.util.Pair.pair;

/// Utilities for reading, installing, and applying modpack-specific game settings.
@NotNullByDefault
public final class ModpackHelper {
    private ModpackHelper() {
    }

    private static final Map<String, ModpackProvider> providers = mapOf(
            pair(CurseModpackProvider.INSTANCE.getName(), CurseModpackProvider.INSTANCE),
            pair(McbbsModpackProvider.INSTANCE.getName(), McbbsModpackProvider.INSTANCE),
            pair(ModrinthModpackProvider.INSTANCE.getName(), ModrinthModpackProvider.INSTANCE),
            pair(MultiMCModpackProvider.INSTANCE.getName(), MultiMCModpackProvider.INSTANCE),
            pair(ServerModpackProvider.INSTANCE.getName(), ServerModpackProvider.INSTANCE),
            pair(CSLModpackProvider.INSTANCE.getName(), CSLModpackProvider.INSTANCE)
    );

    static {
        MultiMCComponents.setImplementation(Metadata.FULL_TITLE);
    }

    @Nullable
    public static ModpackProvider getProviderByType(String type) {
        return providers.get(type);
    }

    public static boolean isFileModpackByExtension(Path file) {
        String ext = FileUtils.getExtension(file);
        return "zip".equals(ext) || "mrpack".equals(ext);
    }

    public static Modpack readModpackManifest(Path file, Charset charset) throws UnsupportedModpackException, ManuallyCreatedModpackException {
        try (ZipArchiveReader zipFile = CompressingUtils.openZipFile(file, charset)) {
            // Order for trying detecting manifest is necessary here.
            // Do not change to iterating providers.
            for (ModpackProvider provider : new ModpackProvider[]{
                    McbbsModpackProvider.INSTANCE,
                    CurseModpackProvider.INSTANCE,
                    ModrinthModpackProvider.INSTANCE,
                    CSLModpackProvider.INSTANCE,
                    MultiMCModpackProvider.INSTANCE,
                    ServerModpackProvider.INSTANCE}) {
                try {
                    return provider.readManifest(zipFile, file, charset);
                } catch (Exception ignored) {
                }
            }
        } catch (IOException ignored) {
        }

        try (FileSystem fs = CompressingUtils.createReadOnlyZipFileSystem(file, charset)) {
            findMinecraftDirectoryInManuallyCreatedModpack(file.toString(), fs);
            throw new ManuallyCreatedModpackException(file);
        } catch (IOException e) {
            // ignore it
        }

        throw new UnsupportedModpackException(file.toString());
    }

    public static Path findMinecraftDirectoryInManuallyCreatedModpack(String modpackName, FileSystem fs) throws IOException, UnsupportedModpackException {
        Path root = fs.getPath("/");
        if (isMinecraftDirectory(root)) return root;
        try (Stream<Path> firstLayer = Files.list(root)) {
            for (Path dir : toIterable(firstLayer)) {
                if (isMinecraftDirectory(dir)) return dir;

                try (Stream<Path> secondLayer = Files.list(dir)) {
                    for (Path subdir : toIterable(secondLayer)) {
                        if (isMinecraftDirectory(subdir)) return subdir;
                    }
                } catch (IOException ignored) {
                }
            }
        } catch (IOException ignored) {
        }
        throw new UnsupportedModpackException(modpackName);
    }

    private static boolean isMinecraftDirectory(Path path) {
        return Files.isDirectory(path.resolve("versions")) &&
                (path.getFileName() == null || ".minecraft".equals(FileUtils.getName(path)));
    }

    public static ModpackConfiguration<?> readModpackConfiguration(Path file) throws IOException {
        try {
            return JsonUtils.fromJsonFile(file, ModpackConfiguration.class);
        } catch (JsonParseException e) {
            throw new IOException("Malformed modpack configuration");
        }
    }

    public static Task<?> getInstallTask(CSLGameRepository repository, ServerModpackManifest manifest, GameInstanceID instanceId, Modpack modpack) {
        repository.markInstanceAsModpack(instanceId);

        ExceptionalRunnable<?> success = () -> {
            repository.refresh();
            GameSettings.Instance setting = repository.getInstanceGameSettingsOrCreate(instanceId);
            repository.undoMark(instanceId);
            if (setting != null) {
                setting.getOverrideProperties().add(GameSettings.PROPERTY_RUNNING_DIRECTORY);
            }
        };

        ExceptionalConsumer<Exception, ?> failure = ex -> {
            if (ex instanceof ModpackCompletionException && !(ex.getCause() instanceof FileNotFoundException)) {
                success.run();
                // This is tolerable and we will not delete the game
            }
        };

        return new ServerModpackRemoteInstallTask(repository.getDependency(), manifest, instanceId)
                .whenComplete(Schedulers.defaultScheduler(), success, failure)
                .withStagesHints(new Task.StagesHint("csl.modpack"), new Task.StagesHint("csl.modpack.download", List.of("csl.install.assets", "csl.install.libraries")));
    }

    public static boolean isExternalGameNameConflicts(String name) {
        return Files.exists(Paths.get("externalgames").resolve(name));
    }

    public static Task<?> getInstallManuallyCreatedModpackTask(Path zipFile, String name, Charset charset) {
        if (isExternalGameNameConflicts(name)) {
            throw new IllegalArgumentException("name existing");
        }

        return new ManuallyCreatedModpackInstallTask(zipFile, charset, name)
                .thenAcceptAsync(Schedulers.javafx(), location -> {
                    GameDirectory newGameDirectory = new GameDirectory(
                            GameDirectoryManager.newGameDirectoryId(),
                            LocalizedText.plain(name),
                            PortablePath.fromPath(location));
                    GameDirectoryManager.addLocalGameDirectory(newGameDirectory);
                    GameDirectoryManager.setSelectedGameDirectory(newGameDirectory);
                });
    }

    public static Task<?> getInstallTask(CSLGameRepository repository, Path zipFile, GameInstanceID instanceId, Modpack modpack, String iconUrl) {
        repository.markInstanceAsModpack(instanceId);

        ExceptionalRunnable<?> success = () -> {
            repository.refresh();
            GameSettings.Instance setting = repository.getInstanceGameSettingsOrCreate(instanceId);
            repository.undoMark(instanceId);
            if (setting != null) {
                setting.getOverrideProperties().add(GameSettings.PROPERTY_RUNNING_DIRECTORY);
            }
        };

        ExceptionalConsumer<Exception, ?> failure = ex -> {
            if (ex instanceof ModpackCompletionException && !(ex.getCause() instanceof FileNotFoundException)) {
                success.run();
                // This is tolerable and we will not delete the game
            }
        };

        if (modpack.getManifest() instanceof MultiMCInstanceConfiguration)
            return modpack.getInstallTask(repository.getDependency(), zipFile, instanceId, iconUrl)
                    .whenComplete(Schedulers.defaultScheduler(), success, failure)
                    .thenComposeAsync(createMultiMCPostInstallTask(repository, (MultiMCInstanceConfiguration) modpack.getManifest(), instanceId))
                    .withStagesHints(new Task.StagesHint("csl.modpack"), new Task.StagesHint("csl.modpack.download", List.of("csl.install.assets", "csl.install.libraries")));
        else if (modpack.getManifest() instanceof McbbsModpackManifest)
            return modpack.getInstallTask(repository.getDependency(), zipFile, instanceId, iconUrl)
                    .whenComplete(Schedulers.defaultScheduler(), success, failure)
                    .thenComposeAsync(createMcbbsPostInstallTask(repository, (McbbsModpackManifest) modpack.getManifest(), instanceId))
                    .withStagesHints(new Task.StagesHint("csl.modpack"), new Task.StagesHint("csl.modpack.download", List.of("csl.install.assets", "csl.install.libraries")));
        else
            return modpack.getInstallTask(repository.getDependency(), zipFile, instanceId, iconUrl)
                    .whenComplete(Schedulers.defaultScheduler(), success, failure)
                    .withStagesHints(new Task.StagesHint("csl.modpack"), new Task.StagesHint("csl.modpack.download", List.of("csl.install.assets", "csl.install.libraries")));
    }

    public static Task<Void> getUpdateTask(CSLGameRepository repository, ServerModpackManifest manifest, Charset charset, GameInstanceID instanceId, ModpackConfiguration<?> configuration) throws UnsupportedModpackException {
        switch (configuration.getType()) {
            case ServerModpackRemoteInstallTask.MODPACK_TYPE:
                return new ModpackUpdateTask(repository, instanceId, new ServerModpackRemoteInstallTask(repository.getDependency(), manifest, instanceId))
                        .thenComposeAsync(repository.refreshAsync())
                        .withStagesHints(new Task.StagesHint("csl.modpack"), new Task.StagesHint("csl.modpack.download", List.of("csl.install.assets", "csl.install.libraries")));
            default:
                throw new UnsupportedModpackException();
        }
    }

    public static Task<?> getUpdateTask(CSLGameRepository repository, Path zipFile, Charset charset, GameInstanceID instanceId, ModpackConfiguration<?> configuration) throws UnsupportedModpackException, ManuallyCreatedModpackException, MismatchedModpackTypeException {
        Modpack modpack = ModpackHelper.readModpackManifest(zipFile, charset);
        ModpackProvider provider = getProviderByType(configuration.getType());
        if (provider == null) {
            throw new UnsupportedModpackException();
        }
        if (modpack.getManifest() instanceof MultiMCInstanceConfiguration)
            return provider.createUpdateTask(repository.getDependency(), instanceId, zipFile, modpack)
                    .thenComposeAsync(() -> createMultiMCPostUpdateTask(repository, (MultiMCInstanceConfiguration) modpack.getManifest(), instanceId))
                    .thenComposeAsync(repository.refreshAsync());
        else
            return provider.createUpdateTask(repository.getDependency(), instanceId, zipFile, modpack)
                    .thenComposeAsync(repository.refreshAsync());
    }

    public static void toGameSettings(MultiMCInstanceConfiguration c, GameSettings.Instance setting) {
        setting.getOverrideProperties().add(GameSettings.PROPERTY_RUNNING_DIRECTORY);

        if (c.isOverrideJavaLocation()) {
            setting.getOverrideProperties().add(GameSettings.PROPERTY_JAVA_TYPE);
            setting.getOverrideProperties().add(GameSettings.PROPERTY_CUSTOM_JAVA_PATH);
            setting.javaTypeProperty().setValue(JavaVersionType.CUSTOM);
            setting.customJavaPathProperty().setValue(Objects.requireNonNullElse(c.getJavaPath(), ""));
        }

        if (c.isOverrideMemory()) {
            setting.getOverrideProperties().addAll(List.of(
                    GameSettings.PROPERTY_AUTO_MEMORY,
                    GameSettings.PROPERTY_PERM_SIZE,
                    GameSettings.PROPERTY_MAX_MEMORY,
                    GameSettings.PROPERTY_MIN_MEMORY
            ));
            setting.permSizeProperty().setValue(Optional.ofNullable(c.getPermGen()).map(Object::toString).orElse(""));
            if (c.getMaxMemory() != null)
                setting.maxMemoryProperty().setValue(c.getMaxMemory());
            setting.minMemoryProperty().setValue(c.getMinMemory());
        }

        if (c.isOverrideCommands()) {
            setting.getOverrideProperties().addAll(List.of(
                    GameSettings.PROPERTY_COMMAND_WRAPPER,
                    GameSettings.PROPERTY_PRE_LAUNCH_COMMAND
            ));
            setting.commandWrapperProperty().setValue(Objects.requireNonNullElse(c.getWrapperCommand(), ""));
            setting.preLaunchCommandProperty().setValue(Objects.requireNonNullElse(c.getPreLaunchCommand(), ""));
        }

        if (c.isOverrideJavaArgs()) {
            setting.getOverrideProperties().add(GameSettings.PROPERTY_JVM_OPTIONS);
            setting.jvmOptionsProperty().setValue(Objects.requireNonNullElse(c.getJvmArgs(), ""));
        }

        if (c.isOverrideConsole()) {
            setting.getOverrideProperties().add(GameSettings.PROPERTY_SHOW_LOGS);
            setting.showLogsProperty().setValue(c.isShowConsole());
        }

        if (c.isOverrideWindow()) {
            setting.getOverrideProperties().addAll(List.of(
                    GameSettings.PROPERTY_WINDOW_TYPE,
                    GameSettings.PROPERTY_WIDTH,
                    GameSettings.PROPERTY_HEIGHT
            ));
            setting.windowTypeProperty().setValue(c.isFullscreen() ? GameWindowType.FULLSCREEN : GameWindowType.WINDOWED);
            if (c.getWidth() != null)
                setting.widthProperty().setValue(c.getWidth().doubleValue());
            if (c.getHeight() != null)
                setting.heightProperty().setValue(c.getHeight().doubleValue());
        }
    }

    private static void applyCommandAndJvmSettings(MultiMCInstanceConfiguration c, GameSettings.Instance setting) {
        if (c.isOverrideCommands()) {
            setting.getOverrideProperties().addAll(List.of(
                    GameSettings.PROPERTY_COMMAND_WRAPPER,
                    GameSettings.PROPERTY_PRE_LAUNCH_COMMAND
            ));
            setting.commandWrapperProperty().setValue(Lang.nonNull(c.getWrapperCommand(), ""));
            setting.preLaunchCommandProperty().setValue(Lang.nonNull(c.getPreLaunchCommand(), ""));
        }

        if (c.isOverrideJavaArgs()) {
            setting.getOverrideProperties().add(GameSettings.PROPERTY_JVM_OPTIONS);
            setting.jvmOptionsProperty().setValue(Lang.nonNull(c.getJvmArgs(), ""));
        }
    }

    private static Task<Void> createMultiMCPostUpdateTask(CSLGameRepository repository, MultiMCInstanceConfiguration manifest, GameInstanceID instanceId) {
        return Task.runAsync(Schedulers.javafx(), () -> {
            GameSettings.Instance setting = Objects.requireNonNull(repository.getInstanceGameSettingsOrCreate(instanceId));
            ModpackHelper.applyCommandAndJvmSettings(manifest, setting);
        });
    }

    private static Task<Void> createMultiMCPostInstallTask(CSLGameRepository repository, MultiMCInstanceConfiguration manifest, GameInstanceID instanceId) {
        return Task.runAsync(Schedulers.javafx(), () -> {
            GameSettings.Instance setting = Objects.requireNonNull(repository.getInstanceGameSettingsOrCreate(instanceId));
            ModpackHelper.toGameSettings(manifest, setting);
        });
    }

    private static Task<Void> createMcbbsPostInstallTask(CSLGameRepository repository, McbbsModpackManifest manifest, GameInstanceID instanceId) {
        return Task.runAsync(Schedulers.javafx(), () -> {
            GameSettings.Effective effective = repository.getEffectiveGameSettings(instanceId);
            if (manifest.getLaunchInfo().getMinMemory() > effective.getMaxMemory()) {
                GameSettings.Instance setting = Objects.requireNonNull(repository.getInstanceGameSettingsOrCreate(instanceId));
                setting.getOverrideProperties().addAll(List.of(
                        GameSettings.PROPERTY_AUTO_MEMORY,
                        GameSettings.PROPERTY_MIN_MEMORY,
                        GameSettings.PROPERTY_MAX_MEMORY,
                        GameSettings.PROPERTY_PERM_SIZE
                ));
                setting.autoMemoryProperty().setValue(effective.getInheritable(GameSettings::autoMemoryProperty));
                setting.minMemoryProperty().setValue(effective.getInheritable(GameSettings::minMemoryProperty));
                setting.maxMemoryProperty().setValue(manifest.getLaunchInfo().getMinMemory());
                setting.permSizeProperty().setValue(effective.getInheritable(GameSettings::permSizeProperty));
            }
        });
    }
}

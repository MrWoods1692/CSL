/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2021  huangyuhui <huanghongxun2008@126.com> and contributors
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
package org.jackhuang.csl.ui.instances;

import com.jfoenix.controls.JFXButton;
import javafx.application.Platform;
import javafx.stage.FileChooser;
import org.jackhuang.csl.addon.RemoteAddon;
import org.jackhuang.csl.auth.Account;
import org.jackhuang.csl.download.DefaultDependencyManager;
import org.jackhuang.csl.download.DownloadProvider;
import org.jackhuang.csl.download.game.GameAssetDownloadTask;
import org.jackhuang.csl.download.game.GameDownloadTask;
import org.jackhuang.csl.download.game.GameLibrariesTask;
import org.jackhuang.csl.game.GameInstanceID;
import org.jackhuang.csl.game.GameInstanceManifest;
import org.jackhuang.csl.game.CSLGameRepository;
import org.jackhuang.csl.game.LauncherHelper;
import org.jackhuang.csl.game.QuickPlayOption;
import org.jackhuang.csl.setting.*;
import org.jackhuang.csl.task.FileDownloadTask;
import org.jackhuang.csl.task.Schedulers;
import org.jackhuang.csl.task.Task;
import org.jackhuang.csl.task.TaskExecutor;
import org.jackhuang.csl.ui.Controllers;
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.ui.account.CreateAccountPane;
import org.jackhuang.csl.ui.construct.DialogCloseEvent;
import org.jackhuang.csl.ui.construct.MessageDialogPane;
import org.jackhuang.csl.ui.construct.PromptDialogPane;
import org.jackhuang.csl.ui.construct.Validator;
import org.jackhuang.csl.ui.download.ModpackInstallWizardProvider;
import org.jackhuang.csl.ui.export.ExportWizardProvider;
import org.jackhuang.csl.util.StringUtils;
import org.jackhuang.csl.util.TaskCancellationAction;
import org.jackhuang.csl.util.gson.JsonUtils;
import org.jackhuang.csl.util.io.FileUtils;
import org.jackhuang.csl.util.platform.OperatingSystem;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.CancellationException;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

import static org.jackhuang.csl.util.i18n.I18n.i18n;
import static org.jackhuang.csl.util.logging.Logger.LOG;

public final class Instances {
    private Instances() {
    }

    public static void addNewGame() {
        Controllers.getDownloadPage().showGameDownloads();
        Controllers.navigate(Controllers.getDownloadPage());
    }

    public static void importModpack() {
        CSLGameRepository repository = GameDirectoryManager.getSelectedRepository();
        if (repository.isLoaded()) {
            Controllers.getDecorator().startWizard(new ModpackInstallWizardProvider(repository), i18n("install.modpack"));
        }
    }

    public static void downloadModpackImpl(DownloadProvider downloadProvider, CSLGameRepository repository, GameInstanceID instanceId, RemoteAddon mod, RemoteAddon.Version file) {
        Path modpack;
        List<URI> downloadURLs;
        try {
            downloadURLs = downloadProvider.injectURLWithCandidates(file.file().url());
            modpack = Files.createTempFile("modpack", ".zip");
        } catch (IOException | IllegalArgumentException e) {
            Controllers.dialog(
                    i18n("install.failed.downloading.detail", file.file().url()) + "\n" + StringUtils.getStackTrace(e),
                    i18n("download.failed.no_code"), MessageDialogPane.MessageType.ERROR);
            return;
        }
        Controllers.taskDialog(
                new FileDownloadTask(downloadURLs, modpack)
                        .setName(file.name())
                        .whenComplete(Schedulers.javafx(), e -> {
                            if (e == null) {
                                ModpackInstallWizardProvider installWizardProvider;
                                if (instanceId != null)
                                    installWizardProvider = new ModpackInstallWizardProvider(repository, modpack, instanceId);
                                else
                                    installWizardProvider = new ModpackInstallWizardProvider(repository, modpack);
                                if (StringUtils.isNotBlank(mod.iconUrl()))
                                    installWizardProvider.setIconUrl(mod.iconUrl());
                                Controllers.getDecorator().startWizard(installWizardProvider);
                            } else if (e instanceof CancellationException) {
                                Controllers.showToast(i18n("message.cancelled"));
                            } else {
                                Controllers.dialog(
                                        i18n("install.failed.downloading.detail", file.file().url()) + "\n" + StringUtils.getStackTrace(e),
                                        i18n("download.failed.no_code"), MessageDialogPane.MessageType.ERROR);
                            }
                        }),
                i18n("message.downloading"),
                TaskCancellationAction.NORMAL
        );
    }

    public static void deleteInstance(CSLGameRepository repository, GameInstanceID instanceId) {
        boolean isIndependent = repository.getRunDirectory(instanceId).toAbsolutePath().normalize()
                .equals(repository.getInstanceRoot(instanceId).toAbsolutePath().normalize());
        String message = isIndependent ? i18n("instance.manage.remove.confirm.independent", instanceId) :
                i18n("instance.manage.remove.confirm.trash", instanceId, instanceId + "_removed");

        JFXButton deleteButton = new JFXButton(i18n("button.delete"));
        deleteButton.getStyleClass().add("dialog-error");
        deleteButton.setOnAction(e -> {
            Task.supplyAsync(Schedulers.io(), () -> repository.removeInstanceFromDisk(instanceId))
                    .whenComplete(Schedulers.javafx(), (result, exception) -> {
                        if (exception != null || !Boolean.TRUE.equals(result)) {
                            Controllers.dialog(i18n("instance.manage.remove.failed"), i18n("message.error"), MessageDialogPane.MessageType.ERROR);
                        }
                    }).start();
        });

        Controllers.confirmAction(message, i18n("message.warning"), MessageDialogPane.MessageType.WARNING, deleteButton);
    }

    public static CompletableFuture<String> renameInstance(CSLGameRepository repository, GameInstanceID instanceId) {
        return Controllers.prompt(i18n("instance.manage.rename.message"), (newName, handler) -> {
            if (newName.equals(instanceId.toString())) {
                handler.resolve();
                return;
            }
            GameInstanceID oldInstanceId = instanceId;
            GameInstanceID newInstanceId = new GameInstanceID(newName);
            if (repository.renameInstance(oldInstanceId, newInstanceId)) {
                handler.resolve();
                repository.refreshAsync()
                        .thenRunAsync(Schedulers.javafx(), () -> {
                            if (repository.hasInstance(newInstanceId)) {
                                repository.setSelectedInstance(newInstanceId);
                            }
                        }).start();
            } else {
                handler.reject(i18n("instance.manage.rename.fail"));
            }
        }, instanceId.toString(),
            new Validator(i18n("install.new_game.malformed"), CSLGameRepository::isValidInstanceId),
            new Validator(i18n("install.new_game.already_exists"), newVersionName -> !repository.instanceIdConflicts(newVersionName) || newVersionName.equals(instanceId.toString())));
    }

    public static void exportInstance(CSLGameRepository repository, GameInstanceID instanceId) {
        Controllers.getDecorator().startWizard(new ExportWizardProvider(repository, instanceId), i18n("modpack.wizard"));
    }

    public static void openFolder(CSLGameRepository repository, GameInstanceID instanceId) {
        FXUtils.openFolder(repository.getRunDirectory(instanceId));
    }

    public static void installFromJson(CSLGameRepository repository, Path file) {
        GameInstanceManifest manifest;
        try {
            manifest = JsonUtils.fromJsonFile(file, GameInstanceManifest.class);
            if (manifest == null) {
                throw new IllegalArgumentException("Missing game manifest");
            }
        } catch (Exception e) {
            Controllers.dialog(i18n("install.new_game.malformed_json"), i18n("message.error"), MessageDialogPane.MessageType.ERROR);
            return;
        }

        Controllers.prompt(i18n("instance.manage.duplicate.prompt"), (result, handler) -> {
            handler.resolve();

            GameInstanceID instanceId = new GameInstanceID(result);

            DefaultDependencyManager dependencyManager = repository.getDependency();
            GameInstanceManifest newVersion = manifest.withId(instanceId).withJar(instanceId);

            Controllers.taskDialog(
                    Task.allOf(new GameDownloadTask(dependencyManager, null, newVersion),
                                    Task.allOf(
                                            new GameAssetDownloadTask(dependencyManager, newVersion, GameAssetDownloadTask.DOWNLOAD_INDEX_FORCIBLY, true),
                                            new GameLibrariesTask(dependencyManager, newVersion, true)
                                    ).withRunAsync(() -> {
                                        // ignore failure
                                    }))
                            .thenComposeAsync(repository.saveAsync(newVersion))
                            .thenRunAsync(repository::refresh)
                            .whenComplete(Schedulers.javafx(), (exception) -> {
                                if (exception == null) {
                                    repository.setSelectedInstance(new GameInstanceID(result));
                                } else {
                                    Controllers.dialog(
                                            DownloadProviders.localizeErrorMessage(exception), i18n("install.failed"), MessageDialogPane.MessageType.ERROR);
                                }
                            }), i18n("install.new_game"), TaskCancellationAction.NORMAL);
        }, FileUtils.getNameWithoutExtension(file), new Validator(i18n("install.new_game.malformed"), CSLGameRepository::isValidInstanceId), new Validator(i18n("install.new_game.already_exists"), newVersionName -> !repository.instanceIdConflicts(newVersionName)));
    }

    public static void duplicateInstance(CSLGameRepository repository, GameInstanceID instanceId) {
        Controllers.prompt(
                new PromptDialogPane.Builder(i18n("instance.manage.duplicate.prompt"), (res, handler) -> {
                    String newInstanceName = ((PromptDialogPane.Builder.StringQuestion) res.get(1)).getValue();
                    GameInstanceID newInstanceId = new GameInstanceID(newInstanceName);
                    boolean copySaves = ((PromptDialogPane.Builder.BooleanQuestion) res.get(2)).getValue();
                    Task.runAsync(() -> repository.duplicateInstance(instanceId, newInstanceId, copySaves))
                            .thenComposeAsync(repository.refreshAsync())
                            .whenComplete(Schedulers.javafx(), (result, exception) -> {
                                if (exception == null) {
                                    handler.resolve();
                                } else {
                                    handler.reject(StringUtils.getStackTrace(exception));
                                    if (!repository.instanceIdConflicts(newInstanceId)) {
                                        repository.removeInstanceFromDisk(newInstanceId);
                                    }
                                }
                            }).start();
                })
                        .addQuestion(new PromptDialogPane.Builder.HintQuestion(i18n("instance.manage.duplicate.confirm")))
                        .addQuestion(new PromptDialogPane.Builder.StringQuestion(null, instanceId.toString(),
                                new Validator(i18n("install.new_game.malformed"), CSLGameRepository::isValidInstanceId),
                                new Validator(i18n("install.new_game.already_exists"), newVersionName -> !repository.instanceIdConflicts(newVersionName))))
                        .addQuestion(new PromptDialogPane.Builder.BooleanQuestion(i18n("instance.manage.duplicate.duplicate_save"), false)));
    }

    public static void updateInstance(CSLGameRepository repository, GameInstanceID instanceId) {
        Controllers.getDecorator().startWizard(new ModpackInstallWizardProvider(repository, instanceId));
    }

    public static void updateGameAssets(CSLGameRepository repository, GameInstanceID instanceId) {
        TaskExecutor executor = new GameAssetDownloadTask(repository.getDependency(), repository.getInstanceManifest(instanceId), GameAssetDownloadTask.DOWNLOAD_INDEX_FORCIBLY, true)
                .executor();
        Controllers.taskDialog(executor, i18n("instance.manage.redownload_assets_index"), TaskCancellationAction.NO_CANCEL);
        executor.start();
    }

    public static void cleanInstance(CSLGameRepository repository, GameInstanceID instanceId) {
        try {
            repository.clean(instanceId);
        } catch (IOException e) {
            LOG.warning("Unable to clean game directory", e);
        }
    }

    @SafeVarargs
    public static void generateLaunchScript(CSLGameRepository repository, GameInstanceID instanceId, Consumer<LauncherHelper>... injecters) {
        if (!checkVersionForLaunching(repository, instanceId))
            return;
        ensureSelectedAccount(account -> {
            FileChooser chooser = new FileChooser();
            if (Files.isDirectory(repository.getRunDirectory(instanceId)))
                chooser.setInitialDirectory(repository.getRunDirectory(instanceId).toFile());
            chooser.setTitle(i18n("instance.launch_script.save"));
            if (OperatingSystem.CURRENT_OS == OperatingSystem.MACOS) {
                chooser.getExtensionFilters().add(
                        new FileChooser.ExtensionFilter(i18n("extension.command"), "*.command")
                );
            }
            chooser.getExtensionFilters().add(OperatingSystem.CURRENT_OS == OperatingSystem.WINDOWS
                    ? new FileChooser.ExtensionFilter(i18n("extension.bat"), "*.bat")
                    : new FileChooser.ExtensionFilter(i18n("extension.sh"), "*.sh"));
            chooser.getExtensionFilters().add(new FileChooser.ExtensionFilter(i18n("extension.ps1"), "*.ps1"));
            Path file = Controllers.showSaveDialog(chooser);
            if (file != null) {
                if (!isValidScriptExtension(FileUtils.getExtension(file))) {
                    String defaultExt = getDefaultScriptExtension();
                    file = file.resolveSibling(file.getFileName().toString() + "." + defaultExt);
                }

                LauncherHelper launcherHelper = new LauncherHelper(repository, account, instanceId);
                for (Consumer<LauncherHelper> injecter : injecters) {
                    injecter.accept(launcherHelper);
                }
                launcherHelper.makeLaunchScript(file);
            }
        });
    }

    private static boolean isValidScriptExtension(String ext) {
        if (OperatingSystem.CURRENT_OS == OperatingSystem.WINDOWS) {
            return ext.equalsIgnoreCase("bat") || ext.equalsIgnoreCase("ps1");
        }
        return ext.equalsIgnoreCase("sh") || ext.equalsIgnoreCase("bash") || ext.equalsIgnoreCase("command") || ext.equalsIgnoreCase("ps1");
    }

    private static String getDefaultScriptExtension() {
        return switch (OperatingSystem.CURRENT_OS) {
            case WINDOWS -> "bat";
            case MACOS -> "command";
            default -> "sh";
        };
    }

    @SafeVarargs
    public static void launch(CSLGameRepository repository, GameInstanceID instanceId, Consumer<LauncherHelper>... injecters) {
        if (!checkVersionForLaunching(repository, instanceId))
            return;
        ensureSelectedAccount(account -> {
            LauncherHelper launcherHelper = new LauncherHelper(repository, account, instanceId);
            for (Consumer<LauncherHelper> injecter : injecters) {
                injecter.accept(launcherHelper);
            }
            launcherHelper.launch();
        });
    }

    public static void testGame(CSLGameRepository repository, GameInstanceID instanceId) {
        launch(repository, instanceId, LauncherHelper::setTestMode);
    }

    public static void launchAndEnterWorld(CSLGameRepository repository, GameInstanceID instanceId, String worldFolderName) {
        launch(repository, instanceId, launcherHelper ->
                launcherHelper.setQuickPlayOption(new QuickPlayOption.SinglePlayer(worldFolderName)));
    }

    public static void generateLaunchScriptForQuickEnterWorld(CSLGameRepository repository, GameInstanceID instanceId, String worldFolderName) {
        generateLaunchScript(repository, instanceId, launcherHelper ->
                launcherHelper.setQuickPlayOption(new QuickPlayOption.SinglePlayer(worldFolderName)));
    }

    private static boolean checkVersionForLaunching(CSLGameRepository repository, GameInstanceID instanceId) {
        boolean unavailable;
        if (instanceId == null || !repository.isLoaded()) {
            unavailable = true;
        } else {
            unavailable = !repository.hasInstance(instanceId);
        }

        if (unavailable) {
            JFXButton gotoDownload = new JFXButton(i18n("instance.empty.launch.goto_download"));
            gotoDownload.getStyleClass().add("dialog-accept");
            gotoDownload.setOnAction(e -> Controllers.navigate(Controllers.getDownloadPage()));

            Controllers.confirmAction(i18n("instance.empty.launch"), i18n("launch.failed"),
                    MessageDialogPane.MessageType.ERROR,
                    gotoDownload,
                    null);
            return false;
        } else {
            return true;
        }
    }

    private static void ensureSelectedAccount(Consumer<Account> action) {
        Account account = Accounts.getSelectedAccount();
        if (account == null) {
            CreateAccountPane dialog = new CreateAccountPane();
            dialog.addEventHandler(DialogCloseEvent.CLOSE, e -> {
                Account newAccount = Accounts.getSelectedAccount();
                if (newAccount == null) {
                    // user cancelled operation
                } else {
                    Platform.runLater(() -> action.accept(newAccount));
                }
            });
            Controllers.dialog(dialog);
        } else {
            action.accept(account);
        }
    }

    public static void modifyGlobalSettings(CSLGameRepository repository) {
        Controllers.getSettingsPage().showGameSettings(repository);
        Controllers.navigate(Controllers.getSettingsPage());
    }

    public static void modifyGameSettings(CSLGameRepository repository, GameInstanceID instanceId) {
        Controllers.getGameInstancePage().setInstance(instanceId, repository);
        Controllers.getGameInstancePage().showInstanceSettings();
        // VersionPage.loadVersion will be invoked after navigation
        Controllers.navigate(Controllers.getGameInstancePage());
    }
}

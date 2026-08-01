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
package org.jackhuang.csl.ui.main;

import javafx.beans.property.ReadOnlyObjectProperty;
import org.jackhuang.csl.Metadata;
import org.jackhuang.csl.event.EventBus;
import org.jackhuang.csl.event.RefreshedGameInstancesEvent;
import org.jackhuang.csl.game.GameInstanceID;
import org.jackhuang.csl.game.GameInstanceManifest;
import org.jackhuang.csl.game.CSLGameRepository;
import org.jackhuang.csl.game.ModpackHelper;
import org.jackhuang.csl.setting.GameDirectory;
import org.jackhuang.csl.setting.GameDirectoryManager;
import org.jackhuang.csl.task.Schedulers;
import org.jackhuang.csl.task.Task;
import org.jackhuang.csl.ui.Controllers;
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.ui.construct.MessageDialogPane;
import org.jackhuang.csl.ui.decorator.DecoratorAnimatedPage;
import org.jackhuang.csl.ui.decorator.DecoratorPage;
import org.jackhuang.csl.ui.download.ModpackInstallWizardProvider;
import org.jackhuang.csl.ui.nbt.NBTEditorPage;
import org.jackhuang.csl.ui.nbt.NBTFileType;
import org.jackhuang.csl.ui.instances.Instances;
import org.jackhuang.csl.upgrade.UpdateChecker;
import org.jackhuang.csl.util.Lang;
import org.jackhuang.csl.util.StringUtils;
import org.jackhuang.csl.util.TaskCancellationAction;
import org.jackhuang.csl.util.io.CompressingUtils;
import org.jackhuang.csl.util.io.FileUtils;
import org.jackhuang.csl.util.versioning.VersionNumber;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import static org.jackhuang.csl.ui.FXUtils.runInFX;
import static org.jackhuang.csl.util.i18n.I18n.i18n;
import static org.jackhuang.csl.util.logging.Logger.LOG;

public class RootPage extends DecoratorAnimatedPage implements DecoratorPage {
    private MainPage mainPage = null;

    public RootPage() {
        EventBus.EVENT_BUS.channel(RefreshedGameInstancesEvent.class)
                .register(event -> onRefreshedVersions((CSLGameRepository) event.getSource()));

        CSLGameRepository repository = GameDirectoryManager.getSelectedRepository();
        if (repository.isLoaded())
            onRefreshedVersions(GameDirectoryManager.getSelectedRepository());

        getStyleClass().remove("gray-background");
    }

    @Override
    public ReadOnlyObjectProperty<State> stateProperty() {
        return getMainPage().stateProperty();
    }

    @Override
    protected Skin createDefaultSkin() {
        return new Skin(this);
    }

    public MainPage getMainPage() {
        if (mainPage == null) {
            MainPage mainPage = new MainPage();
            FXUtils.applyDragListener(mainPage,
                    file -> ModpackHelper.isFileModpackByExtension(file) || NBTFileType.isNBTFileByExtension(file) || "json".equalsIgnoreCase(FileUtils.getExtension(file)),
                    modpacks -> {
                        Path file = modpacks.get(0);
                        if (ModpackHelper.isFileModpackByExtension(file)) {
                            Controllers.getDecorator().startWizard(
                                    new ModpackInstallWizardProvider(GameDirectoryManager.getSelectedRepository(), file),
                                    i18n("install.modpack"));
                        } else if (NBTFileType.isNBTFileByExtension(file)) {
                            try {
                                Controllers.navigate(new NBTEditorPage(file));
                            } catch (Throwable e) {
                                LOG.warning("Fail to open nbt file", e);
                                Controllers.dialog(i18n("nbt.open.failed") + "\n\n" + StringUtils.getStackTrace(e),
                                        i18n("message.error"), MessageDialogPane.MessageType.ERROR);
                            }
                        } else if ("json".equalsIgnoreCase(FileUtils.getExtension(file))) {
                            Instances.installFromJson(GameDirectoryManager.getSelectedRepository(), file);
                        }
                    });

            FXUtils.onChangeAndOperate(GameDirectoryManager.selectedInstanceProperty(), mainPage::setCurrentGame);
            mainPage.latestVersionProperty().bind(UpdateChecker.latestVersionProperty());

            GameDirectoryManager.registerVersionsListener(repository -> {
                GameDirectory gameDirectory = repository.getGameDirectory();
                List<GameInstanceManifest> children = repository.getInstanceManifests().parallelStream()
                        .filter(version -> !version.isHidden())
                        .sorted(Comparator
                                .comparing((GameInstanceManifest manifest) -> Lang.requireNonNullElse(manifest.releaseTime(), Instant.EPOCH))
                                .thenComparing(manifest -> VersionNumber.asVersion(repository.getGameVersion(manifest).orElse(manifest.id().toString()))))
                        .collect(Collectors.toList());
                runInFX(() -> {
                    if (gameDirectory == GameDirectoryManager.getSelectedGameDirectory())
                        mainPage.initVersions(repository, children);
                });
            });
            this.mainPage = mainPage;
        }
        return mainPage;
    }

    private static class Skin extends DecoratorAnimatedPageSkin<RootPage> {

        protected Skin(RootPage control) {
            super(control);

            // The global sidebar is now managed by the Decorator; the root page
            // only shows the main page content in its center.
            setCenter(getSkinnable().getMainPage());
        }
    }

    private boolean checkedModpack = false;

    private void onRefreshedVersions(CSLGameRepository repository) {
        runInFX(() -> {
            if (!checkedModpack) {
                checkedModpack = true;

                if (repository.getInstanceCount() == 0) {
                    Path zipModpack = Metadata.CURRENT_DIRECTORY.resolve("modpack.zip");
                    Path mrpackModpack = Metadata.CURRENT_DIRECTORY.resolve("modpack.mrpack");

                    Path modpackFile;
                    if (Files.exists(zipModpack)) {
                        modpackFile = zipModpack;
                    } else if (Files.exists(mrpackModpack)) {
                        modpackFile = mrpackModpack;
                    } else {
                        modpackFile = null;
                    }

                    if (modpackFile != null) {
                        Task.supplyAsync(() -> CompressingUtils.findSuitableEncoding(modpackFile))
                                .thenApplyAsync(encoding -> ModpackHelper.readModpackManifest(modpackFile, encoding))
                                .thenApplyAsync(modpack -> ModpackHelper
                                        .getInstallTask(repository, modpackFile, new GameInstanceID(modpack.getName()), modpack, null)
                                        .executor())
                                .thenAcceptAsync(Schedulers.javafx(), executor -> {
                                    Controllers.taskDialog(executor, i18n("modpack.installing"), TaskCancellationAction.NO_CANCEL);
                                    executor.start();
                                }).start();
                    }
                }
            }
        });
    }
}

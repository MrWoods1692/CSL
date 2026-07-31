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

import com.jfoenix.controls.JFXButton;
import com.jfoenix.controls.JFXPopup;
import javafx.animation.Interpolator;
import javafx.animation.KeyFrame;
import javafx.animation.KeyValue;
import javafx.animation.Timeline;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.ReadOnlyObjectProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.geometry.Pos;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.scene.shape.SVGPath;
import javafx.util.Duration;
import org.jackhuang.csl.Metadata;
import org.jackhuang.csl.event.EventBus;
import org.jackhuang.csl.event.RefreshedGameInstancesEvent;
import org.jackhuang.csl.game.GameInstanceID;
import org.jackhuang.csl.game.GameInstanceManifest;
import org.jackhuang.csl.game.CSLGameRepository;
import org.jackhuang.csl.game.ModpackHelper;
import org.jackhuang.csl.setting.Accounts;
import org.jackhuang.csl.setting.GameDirectory;
import org.jackhuang.csl.setting.GameDirectoryManager;
import org.jackhuang.csl.task.Schedulers;
import org.jackhuang.csl.task.Task;
import org.jackhuang.csl.terracotta.TerracottaMetadata;
import org.jackhuang.csl.theme.Themes;
import org.jackhuang.csl.ui.Controllers;
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.ui.SVG;
import org.jackhuang.csl.ui.account.AccountAdvancedListItem;
import org.jackhuang.csl.ui.account.AccountListPopupMenu;
import org.jackhuang.csl.ui.animation.AnimationUtils;
import org.jackhuang.csl.ui.construct.AdvancedListBox;
import org.jackhuang.csl.ui.construct.AdvancedListItem;
import org.jackhuang.csl.ui.construct.MessageDialogPane;
import org.jackhuang.csl.ui.decorator.DecoratorAnimatedPage;
import org.jackhuang.csl.ui.decorator.DecoratorPage;
import org.jackhuang.csl.ui.download.ModpackInstallWizardProvider;
import org.jackhuang.csl.ui.nbt.NBTEditorPage;
import org.jackhuang.csl.ui.nbt.NBTFileType;
import org.jackhuang.csl.ui.instances.GameAdvancedListItem;
import org.jackhuang.csl.ui.instances.GameListPopupMenu;
import org.jackhuang.csl.ui.instances.Instances;
import org.jackhuang.csl.upgrade.UpdateChecker;
import org.jackhuang.csl.util.Lang;
import org.jackhuang.csl.util.StringUtils;
import org.jackhuang.csl.util.TaskCancellationAction;
import org.jackhuang.csl.util.io.CompressingUtils;
import org.jackhuang.csl.util.io.FileUtils;
import org.jackhuang.csl.util.platform.*;
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
        getLeft().getStyleClass().add("gray-background");
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

            // first item in left sidebar
            AccountAdvancedListItem accountListItem = new AccountAdvancedListItem();
            accountListItem.setOnAction(e -> Controllers.navigate(Controllers.getAccountListPage()));
            FXUtils.onSecondaryButtonClicked(accountListItem, () -> AccountListPopupMenu.show(accountListItem, JFXPopup.PopupVPosition.TOP, JFXPopup.PopupHPosition.LEFT, accountListItem.getWidth(), 0));
            accountListItem.accountProperty().bind(Accounts.selectedAccountProperty());

            // second item in left sidebar
            GameAdvancedListItem gameListItem = new GameAdvancedListItem();
            gameListItem.setOnAction(e -> {
                GameInstanceID instanceId = GameDirectoryManager.getSelectedRepository().getSelectedInstance();
                if (instanceId == null) {
                    Controllers.navigate(Controllers.getGameListPage());
                } else {
                    Instances.modifyGameSettings(GameDirectoryManager.getSelectedRepository(), instanceId);
                }
            });
            FXUtils.onScroll(gameListItem, getSkinnable().getMainPage().getVersions(), list -> {
                GameInstanceID currentId = getSkinnable().getMainPage().getCurrentGame();
                return Lang.indexWhere(list, instance -> instance.id().equals(currentId));
            }, it -> getSkinnable().getMainPage().getRepository().setSelectedInstance(it.id()));
            if (AnimationUtils.isAnimationEnabled()) {
                FXUtils.prepareOnMouseEnter(gameListItem, Controllers::prepareGameInstancePage);
            }
            FXUtils.onSecondaryButtonClicked(gameListItem, () -> showGameListPopupMenu(gameListItem));

            // third item in left sidebar
            AdvancedListItem gameItem = new AdvancedListItem();
            gameItem.setLeftIcon(SVG.INSTANCES);
            gameItem.setTitle(i18n("instance.manage"));
            gameItem.setOnAction(e -> Controllers.navigate(Controllers.getGameListPage()));
            FXUtils.onSecondaryButtonClicked(gameItem, () -> showGameListPopupMenu(gameItem));

            // forth item in left sidebar
            AdvancedListItem downloadItem = new AdvancedListItem();
            downloadItem.setLeftIcon(SVG.DOWNLOAD);
            downloadItem.setTitle(i18n("download"));
            downloadItem.setOnAction(e -> {
                Controllers.getDownloadPage().showGameDownloads();
                Controllers.navigate(Controllers.getDownloadPage());
            });
            if (AnimationUtils.isAnimationEnabled()) {
                FXUtils.prepareOnMouseEnter(downloadItem, Controllers::prepareDownloadPage);
            }

            // fifth item in left sidebar
            AdvancedListItem launcherSettingsItem = new AdvancedListItem();
            launcherSettingsItem.setLeftIcon(SVG.SETTINGS);
            launcherSettingsItem.setTitle(i18n("settings"));
            launcherSettingsItem.setOnAction(e -> {
                Controllers.getSettingsPage().showGameSettings(GameDirectoryManager.getSelectedRepository());
                Controllers.navigate(Controllers.getSettingsPage());
            });
            if (AnimationUtils.isAnimationEnabled()) {
                FXUtils.prepareOnMouseEnter(launcherSettingsItem, Controllers::prepareSettingsPage);
            }

            // sixth item in left sidebar
            AdvancedListItem terracottaItem = new AdvancedListItem();
            terracottaItem.setLeftIcon(SVG.GRAPH2);
            terracottaItem.setTitle(i18n("terracotta"));
            terracottaItem.setOnAction(e -> {
                if (TerracottaMetadata.PROVIDER != null) {
                    Controllers.navigate(Controllers.getTerracottaPage());
                } else {
                    String message;
                    if (Architecture.SYSTEM_ARCH.getBits() == Bits.BIT_32)
                        message = i18n("terracotta.unsupported.arch.32bit");
                    else if (OperatingSystem.CURRENT_OS == OperatingSystem.WINDOWS
                            && !OperatingSystem.SYSTEM_VERSION.isAtLeast(OSVersion.WINDOWS_10))
                        message = i18n("terracotta.unsupported.os.windows.old");
                    else if (Platform.SYSTEM_PLATFORM.equals(OperatingSystem.LINUX, Architecture.LOONGARCH64_OW))
                        message = i18n("terracotta.unsupported.arch.loongarch64_ow");
                    else
                        message = i18n("terracotta.unsupported");

                    Controllers.dialog(message, null, MessageDialogPane.MessageType.WARNING);
                }
            });

            // the left sidebar; "collapsed" is true when the sidebar is narrow
            BooleanProperty sidebarCollapsed = new SimpleBooleanProperty(true); // collapsed by default

            AdvancedListBox sideBar = new AdvancedListBox()
                    .add(accountListItem)
                    .add(gameListItem)
                    .add(gameItem)
                    .add(downloadItem)
                    .add(launcherSettingsItem)
                    .add(terracottaItem)
                    .addNavigationDrawerItem(i18n("contact.chat"), SVG.CHAT, () -> {
                        Controllers.getSettingsPage().showFeedback();
                        Controllers.navigate(Controllers.getSettingsPage());
                    })
                    .bindSidebarCollapsed(sidebarCollapsed);

            // toggle button at the bottom of the sidebar; the icon is a single
            // SVGPath that only swaps its path data (never the node), and the
            // button is left-aligned, so the icon stays pinned at the same
            // position - expanding only reveals a text label next to it.
            JFXButton sidebarToggleButton = new JFXButton();
            sidebarToggleButton.setFocusTraversable(false);
            sidebarToggleButton.getStyleClass().add("sidebar-toggle-button");
            sidebarToggleButton.setAlignment(Pos.CENTER_LEFT);
            SVGPath sidebarToggleIcon = new SVGPath();
            sidebarToggleIcon.getStyleClass().add("svg");
            sidebarToggleIcon.fillProperty().bind(Themes.titleFillProperty());
            sidebarToggleButton.setGraphic(sidebarToggleIcon);
            sidebarToggleButton.setOnAction(e -> sidebarCollapsed.set(!sidebarCollapsed.get()));
            FXUtils.onChangeAndOperate(sidebarCollapsed, collapsed -> {
                sidebarToggleIcon.setContent((collapsed ? SVG.SIDEBAR_EXPAND : SVG.SIDEBAR_COLLAPSE).getPath());
                sidebarToggleButton.setText(collapsed ? null : i18n("sidebar.collapse"));
            });

            // the root page, with the sidebar in left, navigator in center.
            setLeft(sideBar, sidebarToggleButton);
            VBox.setVgrow(sideBar, Priority.ALWAYS);
            setCenter(getSkinnable().getMainPage());

            // narrow sidebar by default, animate the width when toggled
            VBox left = getSkinnable().getLeft();
            left.setMaxWidth(200);
            left.setMinWidth(0);
            left.setPrefWidth(60);
            FXUtils.onChangeAndOperate(sidebarCollapsed, collapsed -> {
                double targetWidth = collapsed ? 60 : 200;
                if (AnimationUtils.isAnimationEnabled()) {
                    Timeline timeline = new Timeline(
                            new KeyFrame(Duration.millis(150),
                                    new KeyValue(left.prefWidthProperty(), targetWidth, Interpolator.EASE_BOTH)));
                    timeline.play();
                } else {
                    left.setPrefWidth(targetWidth);
                }
            });
        }

        public void showGameListPopupMenu(Region gameListItem) {
            GameListPopupMenu.show(gameListItem,
                    JFXPopup.PopupVPosition.TOP,
                    JFXPopup.PopupHPosition.LEFT,
                    gameListItem.getWidth(),
                    0,
                    getSkinnable().getMainPage().getRepository(),
                    getSkinnable().getMainPage().getVersions());
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

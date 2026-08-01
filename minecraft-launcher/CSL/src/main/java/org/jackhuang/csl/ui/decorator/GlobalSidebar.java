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
package org.jackhuang.csl.ui.decorator;

import com.jfoenix.controls.JFXButton;
import com.jfoenix.controls.JFXPopup;
import javafx.animation.KeyFrame;
import javafx.animation.KeyValue;
import javafx.animation.Timeline;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.geometry.Pos;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.scene.shape.SVGPath;
import javafx.util.Duration;
import org.jackhuang.csl.terracotta.TerracottaMetadata;
import org.jackhuang.csl.theme.Themes;
import org.jackhuang.csl.ui.Controllers;
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.ui.SVG;
import org.jackhuang.csl.ui.account.AccountAdvancedListItem;
import org.jackhuang.csl.ui.account.AccountListPopupMenu;
import org.jackhuang.csl.ui.animation.AnimationUtils;
import org.jackhuang.csl.ui.animation.Motion;
import org.jackhuang.csl.ui.construct.AdvancedListBox;
import org.jackhuang.csl.ui.construct.AdvancedListItem;
import org.jackhuang.csl.ui.construct.MessageDialogPane;
import org.jackhuang.csl.ui.instances.GameAdvancedListItem;
import org.jackhuang.csl.ui.instances.GameListPopupMenu;
import org.jackhuang.csl.ui.instances.Instances;
import org.jackhuang.csl.ui.main.RootPage;
import org.jackhuang.csl.game.CSLGameRepository;
import org.jackhuang.csl.game.GameInstanceID;
import org.jackhuang.csl.setting.Accounts;
import org.jackhuang.csl.setting.GameDirectoryManager;
import org.jackhuang.csl.util.Lang;
import org.jackhuang.csl.util.platform.Architecture;
import org.jackhuang.csl.util.platform.Bits;
import org.jackhuang.csl.util.platform.OperatingSystem;
import org.jackhuang.csl.util.platform.OSVersion;
import org.jackhuang.csl.util.platform.Platform;
import org.jetbrains.annotations.NotNullByDefault;

import static org.jackhuang.csl.util.i18n.I18n.i18n;

/// The persistent global sidebar shown on the left side of the decorator.
///
/// It contains a "Home" button that returns to the root page, plus the main
/// navigation items (account, game, download, settings, terracotta, chat).
/// This sidebar is always visible regardless of which page is currently shown.
@NotNullByDefault
public final class GlobalSidebar extends VBox {

    /// The collapsed state of the sidebar; {@code true} means narrow (icon-only).
    final BooleanProperty sidebarCollapsed = new SimpleBooleanProperty(true);

    private final RootPage rootPage;

    /// @param rootPage the root page, used to access the game repository and versions for popup menus
    public GlobalSidebar(RootPage rootPage) {
        this.rootPage = rootPage;
        getStyleClass().add("global-sidebar");
        setPadding(new javafx.geometry.Insets(8, 0, 8, 0));

        // Home button at the top
        AdvancedListItem homeItem = new AdvancedListItem();
        homeItem.getStyleClass().add("navigation-drawer-item");
        homeItem.setLeftIcon(SVG.HOME);
        homeItem.setTitle(i18n("main_page"));
        homeItem.setOnAction(e -> Controllers.getDecorator().goHome());

        // Account item
        AccountAdvancedListItem accountListItem = new AccountAdvancedListItem();
        accountListItem.setOnAction(e -> Controllers.navigate(Controllers.getAccountListPage()));
        FXUtils.onSecondaryButtonClicked(accountListItem, () ->
                AccountListPopupMenu.show(accountListItem, JFXPopup.PopupVPosition.TOP, JFXPopup.PopupHPosition.LEFT,
                        accountListItem.getWidth(), 0));
        accountListItem.accountProperty().bind(Accounts.selectedAccountProperty());

        // Game instance item
        GameAdvancedListItem gameListItem = new GameAdvancedListItem();
        gameListItem.setOnAction(e -> {
            GameInstanceID instanceId = GameDirectoryManager.getSelectedRepository().getSelectedInstance();
            if (instanceId == null) {
                Controllers.navigate(Controllers.getGameListPage());
            } else {
                Instances.modifyGameSettings(GameDirectoryManager.getSelectedRepository(), instanceId);
            }
        });
        FXUtils.onScroll(gameListItem, rootPage.getMainPage().getVersions(), list -> {
            GameInstanceID currentId = rootPage.getMainPage().getCurrentGame();
            return Lang.indexWhere(list, instance -> instance.id().equals(currentId));
        }, it -> rootPage.getMainPage().getRepository().setSelectedInstance(it.id()));
        if (AnimationUtils.isAnimationEnabled()) {
            FXUtils.prepareOnMouseEnter(gameListItem, Controllers::prepareGameInstancePage);
        }
        FXUtils.onSecondaryButtonClicked(gameListItem, () -> showGameListPopupMenu(gameListItem));

        // Game list item
        AdvancedListItem gameItem = new AdvancedListItem();
        gameItem.setLeftIcon(SVG.INSTANCES);
        gameItem.setTitle(i18n("instance.manage"));
        gameItem.setOnAction(e -> Controllers.navigate(Controllers.getGameListPage()));
        FXUtils.onSecondaryButtonClicked(gameItem, () -> showGameListPopupMenu(gameItem));

        // Download item
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

        // Settings item
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

        // Terracotta item
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

        // System status item
        AdvancedListItem statusItem = new AdvancedListItem();
        statusItem.setLeftIcon(SVG.SYSTEM_MONITOR);
        statusItem.setTitle(i18n("status"));
        statusItem.setOnAction(e -> Controllers.navigate(Controllers.getStatusPage()));

        // Chat / feedback item
        AdvancedListBox sideBar = new AdvancedListBox()
                .add(homeItem)
                .add(accountListItem)
                .add(gameListItem)
                .add(gameItem)
                .add(downloadItem)
                .add(launcherSettingsItem)
                .add(terracottaItem)
                .add(statusItem)
                .addNavigationDrawerItem(i18n("contact.chat"), SVG.CHAT, () -> {
                    Controllers.getSettingsPage().showFeedback();
                    Controllers.navigate(Controllers.getSettingsPage());
                })
                .bindSidebarCollapsed(sidebarCollapsed);

        // Toggle button at the bottom of the sidebar
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

        getChildren().setAll(sideBar, sidebarToggleButton);
        VBox.setVgrow(sideBar, Priority.ALWAYS);

        // Narrow sidebar by default, animate the width when toggled
        setMaxWidth(200);
        setMinWidth(0);
        setPrefWidth(60);
        FXUtils.onChangeAndOperate(sidebarCollapsed, collapsed -> {
            double targetWidth = collapsed ? 60 : 200;
            if (AnimationUtils.isAnimationEnabled()) {
                Timeline timeline = new Timeline(
                        new KeyFrame(Duration.millis(250),
                                new KeyValue(prefWidthProperty(), targetWidth, Motion.STANDARD)));
                timeline.play();
            } else {
                setPrefWidth(targetWidth);
            }
        });
    }

    private void showGameListPopupMenu(Region gameListItem) {
        GameListPopupMenu.show(gameListItem,
                JFXPopup.PopupVPosition.TOP,
                JFXPopup.PopupHPosition.LEFT,
                gameListItem.getWidth(),
                0,
                rootPage.getMainPage().getRepository(),
                rootPage.getMainPage().getVersions());
    }
}

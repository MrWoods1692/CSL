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
import javafx.animation.KeyFrame;
import javafx.animation.KeyValue;
import javafx.animation.RotateTransition;
import javafx.animation.Timeline;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.EventHandler;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Cursor;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.control.Tooltip;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.util.Duration;
import org.jackhuang.csl.Metadata;
import org.jackhuang.csl.download.DefaultDependencyManager;
import org.jackhuang.csl.download.DownloadProvider;
import org.jackhuang.csl.download.VersionList;
import org.jackhuang.csl.game.GameInstanceID;
import org.jackhuang.csl.game.GameInstanceManifest;
import org.jackhuang.csl.game.CSLGameRepository;
import org.jackhuang.csl.setting.DownloadProviders;
import org.jackhuang.csl.setting.GameDirectory;
import org.jackhuang.csl.setting.GameDirectoryManager;
import org.jackhuang.csl.task.Schedulers;
import org.jackhuang.csl.task.Task;
import org.jackhuang.csl.theme.Themes;
import org.jackhuang.csl.ui.Controllers;
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.ui.SVG;
import org.jackhuang.csl.ui.animation.AnimationUtils;
import org.jackhuang.csl.ui.construct.MessageDialogPane;
import org.jackhuang.csl.ui.construct.TwoLineListItem;
import org.jackhuang.csl.ui.decorator.DecoratorPage;
import org.jackhuang.csl.ui.instances.GameListPopupMenu;
import org.jackhuang.csl.ui.instances.Instances;
import org.jackhuang.csl.upgrade.RemoteVersion;
import org.jackhuang.csl.upgrade.UpdateChecker;
import org.jackhuang.csl.upgrade.UpdateHandler;
import org.jackhuang.csl.util.*;
import org.jackhuang.csl.util.i18n.I18n;
import org.jackhuang.csl.util.javafx.BindingMapping;
import org.jackhuang.csl.util.platform.OperatingSystem;
import org.jackhuang.csl.util.platform.Platform;
import org.jackhuang.csl.util.versioning.GameVersionNumber;
import org.jetbrains.annotations.Nullable;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CancellationException;
import java.util.function.Consumer;

import static org.jackhuang.csl.download.RemoteVersion.Type.RELEASE;
import static org.jackhuang.csl.setting.SettingsManager.state;
import static org.jackhuang.csl.ui.FXUtils.SINE;
import static org.jackhuang.csl.util.i18n.I18n.i18n;
import static org.jackhuang.csl.util.logging.Logger.LOG;

public final class MainPage extends StackPane implements DecoratorPage {
    private final ReadOnlyObjectWrapper<State> state = new ReadOnlyObjectWrapper<>();

    private final ObjectProperty<@Nullable GameInstanceID> currentGame = new SimpleObjectProperty<>(this, "currentGame");
    private final BooleanProperty showUpdate = new SimpleBooleanProperty(this, "showUpdate");
    private final BooleanProperty showUpdateDialog = new SimpleBooleanProperty(this, "showUpdateDialog");
    private final ObjectProperty<RemoteVersion> latestVersion = new SimpleObjectProperty<>(this, "latestVersion");
    private final ObservableList<GameInstanceManifest> versions = FXCollections.observableArrayList();
    private CSLGameRepository repository;

    private final StackPane updatePane;
    private final JFXButton menuButton;

    private RemoteVersion lastShownVersion;

    {
        Label titleLabel = new Label(Metadata.FULL_TITLE);
        if (I18n.isUpsideDown()) {
            titleLabel.setRotate(180);
        }
        titleLabel.getStyleClass().add("jfx-decorator-title");
        titleLabel.textFillProperty().bind(Themes.titleFillProperty());

        state.setValue(new State(null, titleLabel, false, false, true));

        setPadding(new Insets(20));

        updatePane = new StackPane();
        updatePane.setVisible(false);
        updatePane.getStyleClass().add("bubble");
        FXUtils.setLimitWidth(updatePane, 230);
        FXUtils.setLimitHeight(updatePane, 55);
        FXUtils.onClicked(updatePane, this::onUpgrade);
        updatePane.setCursor(Cursor.HAND);
        FXUtils.onChange(showUpdateProperty(), this::doAnimation);
        FXUtils.onChange(showUpdateDialogProperty(), this::showUpdateDialog);

        {
            HBox hBox = new HBox();
            hBox.setSpacing(12);
            hBox.setAlignment(Pos.CENTER_LEFT);
            StackPane.setAlignment(hBox, Pos.CENTER_LEFT);
            StackPane.setMargin(hBox, new Insets(9, 12, 9, 16));
            {
                TwoLineListItem prompt = new TwoLineListItem();
                prompt.setSubtitle(i18n("update.bubble.subtitle"));
                prompt.setPickOnBounds(false);
                prompt.titleProperty().bind(BindingMapping.of(latestVersionProperty()).map(latestVersion ->
                        latestVersion == null ? "" : i18n("update.bubble.title", latestVersion.version())));

                hBox.getChildren().setAll(SVG.UPDATE.createIcon(20), prompt);
            }

            JFXButton closeUpdateButton = new JFXButton();
            closeUpdateButton.setGraphic(SVG.CLOSE.createIcon(10));
            StackPane.setAlignment(closeUpdateButton, Pos.TOP_RIGHT);
            closeUpdateButton.getStyleClass().add("toggle-icon-tiny");
            StackPane.setMargin(closeUpdateButton, new Insets(5));
            closeUpdateButton.setOnAction(e -> closeUpdateBubble());

            updatePane.getChildren().setAll(hBox, closeUpdateButton);
        }

        HBox topRightPane = new HBox(8);
        topRightPane.setAlignment(Pos.TOP_RIGHT);
        StackPane.setAlignment(topRightPane, Pos.TOP_RIGHT);
        topRightPane.getChildren().setAll(updatePane);

        HBox launchPane = new HBox();
        launchPane.getStyleClass().add("launch-pane");
        launchPane.setEffect(new javafx.scene.effect.DropShadow(8, 2, 2, javafx.scene.paint.Color.rgb(0, 0, 0, 0.15)));
        FXUtils.onScroll(launchPane, versions, list -> {
            GameInstanceID currentId = getCurrentGame();
            return Lang.indexWhere(list, instance -> instance.id().equals(currentId));
        }, it -> repository.setSelectedInstance(it.id()));

        StackPane.setAlignment(launchPane, Pos.BOTTOM_RIGHT);
        {
            JFXButton launchButton = new JFXButton();
            launchButton.getStyleClass().add("launch-button");
            launchButton.setDefaultButton(true);
            {
                HBox graphic = new HBox(10);
                graphic.setAlignment(Pos.CENTER);
                var launchIcon = SVG.LAUNCH_GAME.createIcon(22);
                VBox launchTexts = new VBox();
                launchTexts.setAlignment(Pos.CENTER);
                graphic.getChildren().setAll(launchIcon, launchTexts);
                Label launchLabel = new Label();
                launchLabel.setStyle("-fx-font-size: 16px;");
                Label currentLabel = new Label();
                currentLabel.setStyle("-fx-font-size: 12px;");

                FXUtils.onChangeAndOperate(currentGameProperty(), new Consumer<>() {
                    private Tooltip tooltip;

                    @Override
                    public void accept(@Nullable GameInstanceID currentGame) {
                        if (currentGame == null) {
                            launchLabel.setText(i18n("instance.launch.empty"));
                            currentLabel.setText(null);
                            launchTexts.getChildren().setAll(launchLabel);
                            FXUtils.setOnActionWithCooldown(launchButton, MainPage.this::launchNoGame);
                            if (tooltip == null)
                                tooltip = new Tooltip(i18n("instance.launch.empty.tooltip"));
                            FXUtils.installFastTooltip(launchButton, tooltip);
                        } else {
                            launchLabel.setText(i18n("instance.launch"));
                            currentLabel.setText(currentGame.toString());
                            launchTexts.getChildren().setAll(launchLabel, currentLabel);
                            FXUtils.setOnActionWithCooldown(launchButton, MainPage.this::launch);
                            if (tooltip != null)
                                Tooltip.uninstall(launchButton, tooltip);
                        }
                    }
                });

                launchButton.setGraphic(graphic);
            }

            menuButton = new JFXButton();
            menuButton.getStyleClass().add("menu-button");
            menuButton.setOnAction(e -> {
                JFXPopup popup = GameListPopupMenu.showAndGetPopup(
                        menuButton,
                        JFXPopup.PopupVPosition.BOTTOM,
                        JFXPopup.PopupHPosition.RIGHT,
                        0,
                        -menuButton.getHeight(),
                        repository, versions
                );

                Node graphic = menuButton.getGraphic();
                if (graphic != null) {
                    if (AnimationUtils.isAnimationEnabled()) {
                        Duration duration = Duration.millis(200);
                        RotateTransition rotateOpen = new RotateTransition(duration, graphic);
                        rotateOpen.setToAngle(-180);
                        FXUtils.playAnimation(graphic, "arrow-rotation", rotateOpen);

                        popup.setOnHidden(windowEvent -> {
                            RotateTransition rotateClose = new RotateTransition(duration, graphic);
                            rotateClose.setToAngle(0);
                            FXUtils.playAnimation(graphic, "arrow-rotation", rotateClose);
                        });
                    } else {
                        graphic.setRotate(-180);
                        popup.setOnHidden(windowEvent -> graphic.setRotate(0));
                    }
                }
            });
            FXUtils.installFastTooltip(menuButton, i18n("instance.switch"));
            menuButton.setGraphic(SVG.ARROW_DROP_UP.createIcon(30));

            EventHandler<MouseEvent> secondaryClickHandle = event -> {
                if (event.getButton() == MouseButton.SECONDARY && event.getClickCount() == 1) {
                    menuButton.fire();
                    event.consume();
                }
            };
            launchButton.addEventHandler(MouseEvent.MOUSE_CLICKED, secondaryClickHandle);
            menuButton.addEventHandler(MouseEvent.MOUSE_CLICKED, secondaryClickHandle);

            launchPane.getChildren().setAll(launchButton, menuButton);
        }

        getChildren().addAll(topRightPane, launchPane);
    }

    private void showUpdateDialog(boolean show) {
        if (show && getLatestVersion() != null && !Objects.equals(getLatestVersion(), lastShownVersion)
                && !Objects.equals(state().getPromptedVersion(), getLatestVersion().version())
        ) {
            lastShownVersion = getLatestVersion();
            Controllers.dialogLater(new MessageDialogPane.Builder("", i18n("update.bubble.title", getLatestVersion().version()), MessageDialogPane.MessageType.INFO)
                    .addAction(i18n("button.view"), () -> {
                        state().setPromptedVersion(getLatestVersion().version());
                        onUpgrade();
                    })
                    .addCancel(null)
                    .build());
        }
    }

    private void doAnimation(boolean show) {
        if (AnimationUtils.isAnimationEnabled()) {
            Duration duration = Duration.millis(320);
            Timeline nowAnimation = new Timeline();
            nowAnimation.getKeyFrames().addAll(
                    new KeyFrame(Duration.ZERO,
                            new KeyValue(updatePane.translateXProperty(), show ? 260 : 0, SINE)),
                    new KeyFrame(duration,
                            new KeyValue(updatePane.translateXProperty(), show ? 0 : 260, SINE)));
            if (show) nowAnimation.getKeyFrames().add(
                    new KeyFrame(Duration.ZERO, e -> updatePane.setVisible(true)));
            else nowAnimation.getKeyFrames().add(
                    new KeyFrame(duration, e -> updatePane.setVisible(false)));
            nowAnimation.play();
        } else {
            updatePane.setVisible(show);
        }
    }

    private void launch() {
        CSLGameRepository repository = GameDirectoryManager.getSelectedRepository();
        Instances.launch(repository, repository.getSelectedInstance());
    }

    private void launchNoGame() {
        DownloadProvider downloadProvider = DownloadProviders.getDownloadProvider();
        VersionList<?> versionList = downloadProvider.getVersionListById("game");

        Holder<GameInstanceID> instanceHolder = new Holder<>();
        Task<?> task = versionList.refreshAsync("")
                .thenSupplyAsync(() -> versionList.getVersions("").stream()
                        .filter(it -> it.getVersionType() == RELEASE)
                        .filter(it -> NativePatcher.checkSupportedStatus(GameVersionNumber.asGameVersion(it.getGameVersion()), Platform.SYSTEM_PLATFORM, OperatingSystem.SYSTEM_VERSION) != NativePatcher.SupportStatus.UNSUPPORTED)
                        .sorted()
                        .findFirst()
                        .orElseThrow(() -> new IOException("No versions found")))
                .thenComposeAsync(version -> {
                    CSLGameRepository repository = GameDirectoryManager.getSelectedRepository();
                    DefaultDependencyManager dependency = repository.getDependency();

                    String gameVersion = version.getGameVersion();
                    GameInstanceID instanceId = new GameInstanceID(gameVersion);

                    instanceHolder.value = instanceId;

                    return dependency.newGameBuilder()
                            .name(instanceId)
                            .gameVersion(gameVersion)
                            .buildAsync();
                })
                .whenComplete(any -> GameDirectoryManager.getSelectedRepository().refresh())
                .whenComplete(Schedulers.javafx(), (result, exception) -> {
                    if (exception == null) {
                        GameDirectoryManager.getSelectedRepository().setSelectedInstance(instanceHolder.value);
                        launch();
                    } else if (exception instanceof CancellationException) {
                        Controllers.showToast(i18n("message.cancelled"));
                    } else {
                        LOG.warning("Failed to install game", exception);
                        Controllers.dialog(StringUtils.getStackTrace(exception),
                                i18n("install.failed"),
                                MessageDialogPane.MessageType.WARNING);
                    }
                });
        Controllers.taskDialog(task, i18n("instance.launch.empty.installing"), TaskCancellationAction.NORMAL);
    }

    private void onUpgrade() {
        RemoteVersion target = UpdateChecker.getLatestVersion();
        if (target == null) {
            return;
        }
        UpdateHandler.updateFrom(target);
    }

    private void closeUpdateBubble() {
        showUpdate.unbind();
        showUpdate.set(false);
    }

    @Override
    public ReadOnlyObjectWrapper<State> stateProperty() {
        return state;
    }

    public GameDirectory getGameDirectory() {
        return repository.getGameDirectory();
    }

    public CSLGameRepository getRepository() {
        return repository;
    }

    public GameInstanceID getCurrentGame() {
        return currentGame.get();
    }

    public ObjectProperty<@Nullable GameInstanceID> currentGameProperty() {
        return currentGame;
    }

    public void setCurrentGame(@Nullable GameInstanceID currentGame) {
        this.currentGame.set(currentGame);
    }

    public ObservableList<GameInstanceManifest> getVersions() {
        return versions;
    }

    public boolean isShowUpdate() {
        return showUpdate.get();
    }

    public BooleanProperty showUpdateProperty() {
        return showUpdate;
    }

    public void setShowUpdate(boolean showUpdate) {
        this.showUpdate.set(showUpdate);
    }

    public boolean isShowUpdateDialog() {
        return showUpdateDialog.get();
    }

    public BooleanProperty showUpdateDialogProperty() {
        return showUpdateDialog;
    }

    public void setShowUpdateDialog(boolean showUpdateDialog) {
        this.showUpdateDialog.set(showUpdateDialog);
    }

    public RemoteVersion getLatestVersion() {
        return latestVersion.get();
    }

    public ObjectProperty<RemoteVersion> latestVersionProperty() {
        return latestVersion;
    }

    public void setLatestVersion(RemoteVersion latestVersion) {
        this.latestVersion.set(latestVersion);
    }

    public void initVersions(CSLGameRepository repository, List<GameInstanceManifest> versions) {
        FXUtils.checkFxUserThread();
        this.repository = repository;
        this.versions.setAll(versions);
    }
}

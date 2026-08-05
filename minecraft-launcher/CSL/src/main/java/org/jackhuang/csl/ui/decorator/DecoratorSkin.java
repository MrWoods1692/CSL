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

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

import com.jfoenix.controls.JFXButton;
import javafx.animation.Interpolator;
import javafx.animation.KeyFrame;
import javafx.animation.KeyValue;
import javafx.animation.Timeline;
import javafx.beans.InvalidationListener;
import javafx.beans.WeakInvalidationListener;
import javafx.beans.binding.Bindings;
import javafx.beans.binding.DoubleBinding;
import javafx.collections.ListChangeListener;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Bounds;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Cursor;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.control.SkinBase;
import javafx.scene.effect.BlurType;
import javafx.scene.effect.DropShadow;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.paint.Color;
import javafx.scene.shape.SVGPath;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;

import javafx.util.Duration;
import org.glavo.monetfx.ColorRole;
import org.jackhuang.csl.Metadata;
import org.jackhuang.csl.theme.Themes;
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.ui.SVG;
import org.jackhuang.csl.ui.animation.ContainerAnimations;
import org.jackhuang.csl.ui.animation.Motion;
import org.jackhuang.csl.ui.animation.TransitionPane;
import org.jackhuang.csl.ui.wizard.Navigation;
import org.jackhuang.csl.util.platform.OperatingSystem;
import org.jetbrains.annotations.Nullable;

import static org.jackhuang.csl.util.logging.Logger.LOG;

public class DecoratorSkin extends SkinBase<Decorator> {
    private final StackPane root, parent;
    private final StackPane titleContainer;
    private final Stage primaryStage;
    private final TransitionPane navBarPane;

    @SuppressWarnings("FieldCanBeLocal")
    private final InvalidationListener onWindowsStatusChange;
    private final EventHandler<MouseEvent> onTitleBarDoubleClick;

    private double mouseInitX, mouseInitY, stageInitX, stageInitY, stageInitWidth, stageInitHeight;

    /**
     * Constructor for all SkinBase instances.
     *
     * @param control The control for which this Skin should attach to.
     */
    public DecoratorSkin(Decorator control) {
        super(control);

        primaryStage = control.getPrimaryStage();

        Decorator skinnable = getSkinnable();
        root = new StackPane();
        root.getStyleClass().add("window");

        StackPane shadowContainer = new StackPane();
        shadowContainer.getStyleClass().add("body");
        shadowContainer.setEffect(new DropShadow(BlurType.ONE_PASS_BOX, Color.rgb(0, 0, 0, 0.4), 10, 0.3, 0.0, 0.0));

        parent = new StackPane();
        Rectangle clip = new Rectangle();
        clip.widthProperty().bind(parent.widthProperty());
        clip.heightProperty().bind(parent.heightProperty());
        clip.setArcWidth(8);
        clip.setArcHeight(8);
        parent.setClip(clip);

        skinnable.getSnackbar().registerSnackbarContainer(parent);

        EventHandler<MouseEvent> onMouseReleased = this::onMouseReleased;
        EventHandler<MouseEvent> onMouseDragged = this::onMouseDragged;
        EventHandler<MouseEvent> onMouseMoved = this::onMouseMoved;

        // https://github.com/MrWoods1692/CSL/issues/4290
        if (OperatingSystem.CURRENT_OS != OperatingSystem.MACOS) {
            onWindowsStatusChange = observable -> {
                if (primaryStage.isIconified() || primaryStage.isFullScreen() || primaryStage.isMaximized()) {
                    root.removeEventFilter(MouseEvent.MOUSE_RELEASED, onMouseReleased);
                    root.removeEventFilter(MouseEvent.MOUSE_DRAGGED, onMouseDragged);
                    root.removeEventFilter(MouseEvent.MOUSE_MOVED, onMouseMoved);
                } else {
                    root.addEventFilter(MouseEvent.MOUSE_RELEASED, onMouseReleased);
                    root.addEventFilter(MouseEvent.MOUSE_DRAGGED, onMouseDragged);
                    root.addEventFilter(MouseEvent.MOUSE_MOVED, onMouseMoved);
                }
            };
            onTitleBarDoubleClick = event -> {
                if (event.getButton() == MouseButton.PRIMARY && event.getClickCount() == 2) {
                    primaryStage.setMaximized(!primaryStage.isMaximized());
                    event.consume();
                }
            };
            WeakInvalidationListener weakOnWindowsStatusChange = new WeakInvalidationListener(onWindowsStatusChange);
            primaryStage.iconifiedProperty().addListener(weakOnWindowsStatusChange);
            primaryStage.maximizedProperty().addListener(weakOnWindowsStatusChange);
            primaryStage.fullScreenProperty().addListener(weakOnWindowsStatusChange);
            onWindowsStatusChange.invalidated(null);
        } else {
            onWindowsStatusChange = null;
            onTitleBarDoubleClick = null;
            root.addEventFilter(MouseEvent.MOUSE_RELEASED, onMouseReleased);
            root.addEventFilter(MouseEvent.MOUSE_DRAGGED, onMouseDragged);
            root.addEventFilter(MouseEvent.MOUSE_MOVED, onMouseMoved);
        }

        shadowContainer.getChildren().setAll(parent);
        root.getChildren().setAll(shadowContainer);

        StackPane wrapper = new StackPane();
        wrapper.backgroundProperty().bind(Bindings.createObjectBinding(
                () -> Themes.windowTransparentProperty().get()
                        ? null
                        : new Background(new BackgroundFill(
                                Themes.getColorScheme().getColor(ColorRole.SURFACE_CONTAINER),
                                CornerRadii.EMPTY,
                                Insets.EMPTY)),
                Themes.windowTransparentProperty(),
                Themes.colorSchemeProperty()));

        Region backgroundNode = new Region();
        backgroundNode.setMouseTransparent(true);
        backgroundNode.backgroundProperty().bind(Bindings.createObjectBinding(
            () -> Themes.windowTransparentProperty().get()
                || skinnable.getContentBackground() == null
                        ? null
                        : skinnable.getContentBackground().background(),
            skinnable.contentBackgroundProperty(),
            Themes.windowTransparentProperty()));
        backgroundNode.opacityProperty().bind(Bindings.createDoubleBinding(
            () -> Themes.windowTransparentProperty().get()
                ? 0.0
                : skinnable.getContentBackground() == null
                        ? 1.0
                        : skinnable.getContentBackground().opacity(),
            skinnable.contentBackgroundProperty(),
            Themes.windowTransparentProperty()));
        StackPane.setAlignment(backgroundNode, Pos.BOTTOM_CENTER);

        ImageView backgroundVideo = createBackgroundGif(wrapper);
        if (backgroundVideo != null) {
            backgroundVideo.opacityProperty().bind(backgroundNode.opacityProperty());
        }

        BorderPane frame = new BorderPane();
        frame.getStyleClass().addAll("jfx-decorator");
        wrapper.getChildren().setAll(backgroundNode, frame);
        if (backgroundVideo != null) {
            wrapper.getChildren().add(1, backgroundVideo);
        }
        skinnable.setDrawerWrapper(wrapper);

        parent.getChildren().add(wrapper);

        // center node with an animation layer at bottom, a container layer at middle and a "welcome" layer at top.
        StackPane container = new StackPane();
        FXUtils.setOverflowHidden(container);

        // content layer at middle
        {
            StackPane contentPlaceHolder = new StackPane();
            contentPlaceHolder.getStyleClass().add("jfx-decorator-content-container");
            Bindings.bindContent(contentPlaceHolder.getChildren(), skinnable.contentProperty());

            container.getChildren().add(contentPlaceHolder);
        }

        // welcome and hint layer at top
        {
            StackPane floatLayer = new StackPane();
            Bindings.bindContent(floatLayer.getChildren(), skinnable.containerProperty());
            ListChangeListener<Node> listener = c -> {
                if (skinnable.getContainer().isEmpty()) {
                    floatLayer.setMouseTransparent(true);
                    floatLayer.setVisible(false);
                } else {
                    floatLayer.setMouseTransparent(false);
                    floatLayer.setVisible(true);
                }
            };
            skinnable.containerProperty().addListener(listener);
            listener.onChanged(null);

            container.getChildren().add(floatLayer);
        }

        frame.setCenter(container);

        // Persistent global sidebar on the left, shown when the decorator has one set.
        {
            FXUtils.onChangeAndOperate(skinnable.sidebarProperty(), sidebarNode -> {
                if (sidebarNode != null) {
                    sidebarNode.getStyleClass().add("global-sidebar-container");
                    sidebarNode.opacityProperty().bind(Themes.sidebarOpacityProperty());
                    frame.setLeft(sidebarNode);
                } else {
                    frame.setLeft(null);
                }
            });
        }

        titleContainer = new StackPane();
        titleContainer.setPickOnBounds(false);
        titleContainer.getStyleClass().addAll("jfx-tool-bar");
        backgroundNode.maxHeightProperty().bind(Bindings.createDoubleBinding(
                () -> Math.max(0.0, wrapper.getHeight()
                        - (skinnable.isTitleTransparent() ? 0.0 : titleContainer.getHeight())),
                wrapper.heightProperty(),
                skinnable.titleTransparentProperty(),
                titleContainer.heightProperty()));

        // Maybe, we can automatically identify whether the top part of the picture is light-coloured or dark when the title is transparent,
        // and decide whether the whole top bar should be rendered in white or black. TODO
        FXUtils.onChangeAndOperate(skinnable.titleTransparentProperty(), titleTransparent -> {
            if (titleTransparent) {
                titleContainer.getStyleClass().remove("background");
                titleContainer.getStyleClass().add("gray-background");
            } else {
                titleContainer.getStyleClass().add("background");
                titleContainer.getStyleClass().remove("gray-background");
            }
        });

        control.capableDraggingWindow(titleContainer);

        BorderPane titleBar = new BorderPane();
        titleContainer.getChildren().add(titleBar);

        {
            navBarPane = new TransitionPane();
            navBarPane.setId("decoratorTitleTransitionPane");
            FXUtils.onChangeAndOperate(skinnable.stateProperty(), s -> {
                if (s == null) return;
                Node node = createNavBar(skinnable, s.leftPaneWidth(), s.backable(), skinnable.canCloseProperty().get(), skinnable.showCloseAsHomeProperty().get(), s.refreshable(), s.title(), s.titleNode());
                if (s.animate()) {
                    TransitionPane.AnimationProducer animation = switch (skinnable.getNavigationDirection()) {
                        case NEXT -> NavBarAnimations.NEXT;
                        case PREVIOUS -> NavBarAnimations.PREVIOUS;
                        default -> ContainerAnimations.FADE;
                    };
                    skinnable.setNavigationDirection(Navigation.NavigationDirection.START);
                    navBarPane.setContent(node, animation, Motion.SHORT4);
                } else {
                    navBarPane.getChildren().setAll(node);
                }
            });
            titleBar.setCenter(navBarPane);
            ImageView titleIconView = new ImageView(FXUtils.newBuiltinImage("/assets/img/icon.png"));
            titleIconView.setFitWidth(26);
            titleIconView.setFitHeight(26);
            titleIconView.setPreserveRatio(true);
            HBox titleRight = new HBox(titleIconView);
            titleRight.setAlignment(Pos.CENTER_RIGHT);
            titleRight.setPadding(new Insets(0, 10, 0, 0));
            titleBar.setRight(titleRight);
        }
        frame.setTop(titleContainer);

        {
            HBox buttonsContainer = new HBox(8);
            buttonsContainer.setAlignment(Pos.CENTER_LEFT);
            buttonsContainer.setPadding(new Insets(0, 0, 0, 8));
            buttonsContainer.setMaxHeight(42);

            JFXButton btnClose = createWindowControlButton(SVG.CLOSE, "window-control-close", e -> skinnable.close());
            JFXButton btnMin = createWindowControlButton(SVG.MINIMIZE_CENTER, "window-control-min", e -> skinnable.minimize());
            JFXButton btnMax = createWindowControlButton(SVG.MAXIMIZE, "window-control-max", e -> primaryStage.setMaximized(!primaryStage.isMaximized()));
            primaryStage.maximizedProperty().addListener((obs, wasMax, isMax) ->
                    btnMax.setGraphic(createWindowControlGlyph(isMax ? SVG.RESTORE_WINDOW : SVG.MAXIMIZE, btnMax)));
            buttonsContainer.getChildren().setAll(btnClose, btnMin, btnMax);

            titleBar.setLeft(buttonsContainer);
        }

        getChildren().add(root);
    }

    private JFXButton createWindowControlButton(SVG icon, String colorClass, EventHandler<ActionEvent> action) {
        JFXButton btn = new JFXButton();
        btn.setFocusTraversable(false);
        btn.setGraphic(createWindowControlGlyph(icon, btn));
        btn.getStyleClass().addAll("window-control-button", colorClass);
        btn.setOnAction(action);
        return btn;
    }

    private SVGPath createWindowControlGlyph(SVG icon, JFXButton owner) {
        SVGPath glyph = icon.createIcon();
        glyph.setFill(Color.rgb(0, 0, 0, 0.55));
        glyph.setScaleX(0.55);
        glyph.setScaleY(0.55);
        glyph.setVisible(false);
        glyph.visibleProperty().bind(owner.hoverProperty());
        return glyph;
    }

    private Node createNavBar(Decorator skinnable, double leftPaneWidth, boolean canBack, boolean canClose, boolean showCloseAsHome, boolean canRefresh, String title, Node titleNode) {
        BorderPane navBar = new BorderPane();
        navBar.getStyleClass().add("navigation-bar");

        {
            BorderPane center = new BorderPane();
            if (title != null) {
                Label titleLabel = new Label();
                titleLabel.textFillProperty().bind(Themes.titleFillProperty());
                BorderPane.setAlignment(titleLabel, Pos.CENTER_LEFT);
                titleLabel.getStyleClass().add("jfx-decorator-title");
                titleLabel.maxWidthProperty().bind(Bindings.createDoubleBinding(
                        () -> skinnable.getWidth() - 150,
                        skinnable.widthProperty()));
                titleLabel.setText(title);
                center.setCenter(titleLabel);
                BorderPane.setAlignment(titleLabel, Pos.CENTER);
            }
            if (titleNode != null) {
                center.setCenter(titleNode);
                BorderPane.setAlignment(titleNode, Pos.CENTER);
            }
            if (onTitleBarDoubleClick != null)
                center.setOnMouseClicked(onTitleBarDoubleClick);
            center.setOnMouseDragged(mouseEvent -> {
                if (!getSkinnable().isDragging() && primaryStage.isMaximized()) {
                    getSkinnable().setDragging(true);
                    mouseInitX = mouseEvent.getScreenX();
                    mouseInitY = mouseEvent.getScreenY();
                    primaryStage.setMaximized(false);
                    stageInitWidth = primaryStage.getWidth();
                    stageInitHeight = primaryStage.getHeight();
                    primaryStage.setY(stageInitY = 0);
                    primaryStage.setX(stageInitX = mouseInitX - stageInitWidth / 2);
                }
            });
            navBar.setCenter(center);

            if (canRefresh) {
                HBox navRight = new HBox();
                navRight.setAlignment(Pos.CENTER_RIGHT);
                JFXButton refreshNavButton = new JFXButton();
                refreshNavButton.setGraphic(SVG.REFRESH.createIcon(Themes.titleFillProperty()));
                refreshNavButton.getStyleClass().add("jfx-decorator-button");
                refreshNavButton.onActionProperty().bind(skinnable.onRefreshNavButtonActionProperty());
                skinnable.forbidDraggingWindow(refreshNavButton);

                navRight.getChildren().setAll(refreshNavButton);
                navBar.setRight(navRight);
            }
        }
        return navBar;
    }

    private boolean isRightEdge(double x, double y, Bounds boundsInParent) {
        return x < root.getWidth() && x >= root.getWidth() - root.snappedLeftInset();
    }

    private boolean isTopEdge(double x, double y, Bounds boundsInParent) {
        return y >= 0 && y <= root.snappedTopInset();
    }

    private boolean isBottomEdge(double x, double y, Bounds boundsInParent) {
        return y < root.getHeight() && y >= root.getHeight() - root.snappedLeftInset();
    }

    private boolean isLeftEdge(double x, double y, Bounds boundsInParent) {
        return x >= 0 && x <= root.snappedLeftInset();
    }

    private void resizeStage(double newWidth, double newHeight) {
        if (newWidth < 0)
            newWidth = primaryStage.getWidth();
        if (newWidth < primaryStage.getMinWidth())
            newWidth = primaryStage.getMinWidth();
        if (newWidth < titleContainer.getMinWidth())
            newWidth = titleContainer.getMinWidth();

        if (newHeight < 0)
            newHeight = primaryStage.getHeight();
        if (newHeight < primaryStage.getMinHeight())
            newHeight = primaryStage.getMinHeight();
        if (newHeight < titleContainer.getMinHeight())
            newHeight = titleContainer.getMinHeight();

        // Width and height must be set simultaneously to avoid JDK-8344372 (https://github.com/openjdk/jfx/pull/1654)
        primaryStage.setWidth(newWidth);
        primaryStage.setHeight(newHeight);
    }

    private void onMouseMoved(MouseEvent mouseEvent) {
        if (!primaryStage.isFullScreen() && primaryStage.isResizable()) {
            double x = mouseEvent.getX(), y = mouseEvent.getY();
            Bounds boundsInParent = root.getBoundsInParent();
            double diagonalSize = root.snappedLeftInset() + 10;
            if (this.isRightEdge(x, y, boundsInParent)) {
                if (y < diagonalSize) {
                    root.setCursor(Cursor.NE_RESIZE);
                } else if (y > root.getHeight() - diagonalSize) {
                    root.setCursor(Cursor.SE_RESIZE);
                } else {
                    root.setCursor(Cursor.E_RESIZE);
                }
            } else if (this.isLeftEdge(x, y, boundsInParent)) {
                if (y < diagonalSize) {
                    root.setCursor(Cursor.NW_RESIZE);
                } else if (y > root.getHeight() - diagonalSize) {
                    root.setCursor(Cursor.SW_RESIZE);
                } else {
                    root.setCursor(Cursor.W_RESIZE);
                }
            } else if (this.isTopEdge(x, y, boundsInParent)) {
                if (x < diagonalSize) {
                    root.setCursor(Cursor.NW_RESIZE);
                } else if (x > root.getWidth() - diagonalSize) {
                    root.setCursor(Cursor.NE_RESIZE);
                } else {
                    root.setCursor(Cursor.N_RESIZE);
                }
            } else if (this.isBottomEdge(x, y, boundsInParent)) {
                if (x < diagonalSize) {
                    root.setCursor(Cursor.SW_RESIZE);
                } else if (x > root.getWidth() - diagonalSize) {
                    root.setCursor(Cursor.SE_RESIZE);
                } else {
                    root.setCursor(Cursor.S_RESIZE);
                }
            } else {
                // Use null instead of Cursor.DEFAULT so the Scene-level custom cursor
                // (set by CursorManager) can take effect when not on a resize edge.
                root.setCursor(null);
            }
        } else {
            root.setCursor(null);
        }
    }

    private void onMouseReleased(MouseEvent mouseEvent) {
        getSkinnable().setDragging(false);
    }

    private void onMouseDragged(MouseEvent mouseEvent) {
        if (!getSkinnable().isDragging()) {
            getSkinnable().setDragging(true);
            mouseInitX = mouseEvent.getScreenX();
            mouseInitY = mouseEvent.getScreenY();
            stageInitX = primaryStage.getX();
            stageInitY = primaryStage.getY();
            stageInitWidth = primaryStage.getWidth();
            stageInitHeight = primaryStage.getHeight();
        }

        if (primaryStage.isFullScreen() || !mouseEvent.isPrimaryButtonDown() || mouseEvent.isStillSincePress())
            return;

        double dx = mouseEvent.getScreenX() - mouseInitX;
        double dy = mouseEvent.getScreenY() - mouseInitY;

        Cursor cursor = root.getCursor();
        if (getSkinnable().isAllowMove()) {
            if (cursor == Cursor.DEFAULT || cursor == null) {
                primaryStage.setX(stageInitX + dx);
                primaryStage.setY(stageInitY + dy);
                mouseEvent.consume();
            }
        }

        if (getSkinnable().isResizable()) {
            if (cursor == Cursor.E_RESIZE) {
                resizeStage(stageInitWidth + dx, -1);
                mouseEvent.consume();

            } else if (cursor == Cursor.S_RESIZE) {
                resizeStage(-1, stageInitHeight + dy);
                mouseEvent.consume();

            } else if (cursor == Cursor.W_RESIZE) {
                resizeStage(stageInitWidth - dx, -1);
                primaryStage.setX(stageInitX + stageInitWidth - primaryStage.getWidth());
                mouseEvent.consume();

            } else if (cursor == Cursor.N_RESIZE) {
                resizeStage(-1, stageInitHeight - dy);
                primaryStage.setY(stageInitY + stageInitHeight - primaryStage.getHeight());
                mouseEvent.consume();

            } else if (cursor == Cursor.SE_RESIZE) {
                resizeStage(stageInitWidth + dx, stageInitHeight + dy);
                mouseEvent.consume();

            } else if (cursor == Cursor.SW_RESIZE) {
                resizeStage(stageInitWidth - dx, stageInitHeight + dy);
                primaryStage.setX(stageInitX + stageInitWidth - primaryStage.getWidth());
                mouseEvent.consume();

            } else if (cursor == Cursor.NW_RESIZE) {
                resizeStage(stageInitWidth - dx, stageInitHeight - dy);
                primaryStage.setX(stageInitX + stageInitWidth - primaryStage.getWidth());
                primaryStage.setY(stageInitY + stageInitHeight - primaryStage.getHeight());
                mouseEvent.consume();

            } else if (cursor == Cursor.NE_RESIZE) {
                resizeStage(stageInitWidth + dx, stageInitHeight - dy);
                primaryStage.setY(stageInitY + stageInitHeight - primaryStage.getHeight());
                mouseEvent.consume();
            }
        }
    }

    /// Creates the looping GIF background layer covering the whole window.
    private static @Nullable ImageView createBackgroundGif(StackPane wrapper) {
        Image image = new Image(DecoratorSkin.class.getResource("/assets/bj.gif").toExternalForm(), true);
        ImageView view = new ImageView(image);
        view.setMouseTransparent(true);
        view.setPreserveRatio(true);
        view.setManaged(false);
        view.fitWidthProperty().bind(wrapper.widthProperty());
        view.fitHeightProperty().bind(wrapper.heightProperty());
        return view;
    }

    enum NavBarAnimations implements TransitionPane.AnimationProducer {
        NEXT {
            @Override
            public void init(TransitionPane container, Node previousNode, Node nextNode) {
                super.init(container, previousNode, nextNode);
                nextNode.setTranslateX(container.getWidth());
            }

            @Override
            public Timeline animate(
                    Pane container, Node previousNode, Node nextNode,
                    Duration duration, Interpolator interpolator) {
                return new Timeline(
                        new KeyFrame(Duration.ZERO,
                                new KeyValue(nextNode.translateXProperty(), 50, interpolator),
                                new KeyValue(previousNode.translateXProperty(), 0, interpolator),
                                new KeyValue(nextNode.opacityProperty(), 0, interpolator),
                                new KeyValue(previousNode.opacityProperty(), 1, interpolator)),
                        new KeyFrame(duration,
                                new KeyValue(nextNode.translateXProperty(), 0, interpolator),
                                new KeyValue(previousNode.translateXProperty(), -50, interpolator),
                                new KeyValue(nextNode.opacityProperty(), 1, interpolator),
                                new KeyValue(previousNode.opacityProperty(), 0, interpolator))
                );
            }

            @Override
            public TransitionPane.AnimationProducer opposite() {
                return NEXT;
            }
        },

        PREVIOUS {
            @Override
            public void init(TransitionPane container, Node previousNode, Node nextNode) {
                super.init(container, previousNode, nextNode);
                nextNode.setTranslateX(container.getWidth());
            }

            @Override
            public Timeline animate(Pane container, Node previousNode, Node nextNode, Duration duration, Interpolator interpolator) {
                return new Timeline(
                        new KeyFrame(Duration.ZERO,
                                new KeyValue(nextNode.translateXProperty(), -50, interpolator),
                                new KeyValue(previousNode.translateXProperty(), 0, interpolator),
                                new KeyValue(nextNode.opacityProperty(), 0, interpolator),
                                new KeyValue(previousNode.opacityProperty(), 1, interpolator)),
                        new KeyFrame(duration,
                                new KeyValue(nextNode.translateXProperty(), 0, interpolator),
                                new KeyValue(previousNode.translateXProperty(), 50, interpolator),
                                new KeyValue(nextNode.opacityProperty(), 1, interpolator),
                                new KeyValue(previousNode.opacityProperty(), 0, interpolator))
                );
            }

            @Override
            public TransitionPane.AnimationProducer opposite() {
                return PREVIOUS;
            }
        };
    }
}

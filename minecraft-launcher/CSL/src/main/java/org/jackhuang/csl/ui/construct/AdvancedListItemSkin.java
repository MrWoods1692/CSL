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
package org.jackhuang.csl.ui.construct;

import javafx.animation.KeyFrame;
import javafx.animation.KeyValue;
import javafx.animation.Timeline;
import javafx.css.PseudoClass;
import javafx.scene.control.SkinBase;
import javafx.scene.layout.BorderPane;
import javafx.util.Duration;
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.ui.animation.AnimationUtils;
import org.jackhuang.csl.ui.animation.Motion;

public class AdvancedListItemSkin extends SkinBase<AdvancedListItem> {
    private static final PseudoClass SELECTED = PseudoClass.getPseudoClass("selected");

    public AdvancedListItemSkin(AdvancedListItem skinnable) {
        super(skinnable);

        FXUtils.onChangeAndOperate(skinnable.activeProperty(), active -> {
            skinnable.pseudoClassStateChanged(SELECTED, active);
        });

        TwoLineListItem item = new TwoLineListItem();
        item.setMouseTransparent(true);
        item.titleProperty().bind(skinnable.titleProperty());
        item.subtitleProperty().bind(skinnable.subtitleProperty());

        BorderPane horizontal = new BorderPane();
        horizontal.getStyleClass().add("container");
        horizontal.setPickOnBounds(false);
        horizontal.setCenter(item);
        horizontal.rightProperty().bind(skinnable.rightGraphicProperty());

        if (!skinnable.isCompact()) {
            horizontal.leftProperty().bind(skinnable.leftGraphicProperty());
            getChildren().setAll(new RipplerContainer(horizontal));
            return;
        }

        // Collapsible sidebar item: when collapsed the icon is centered;
        // when expanded the icon is pinned to the left and the text label
        // is revealed next to it.
        skinnable.getStyleClass().add("compact");

        // Use opacity instead of visibility for smooth transitions.
        // The text label starts hidden (collapsed by default).
        item.setOpacity(0);
        item.setManaged(false);

        // Dynamically switch the icon between center (collapsed) and left (expanded),
        // and animate the text label opacity in sync.
        FXUtils.onChangeAndOperate(skinnable.expandedProperty(), expanded -> {
            if (AnimationUtils.isAnimationEnabled()) {
                Timeline timeline = new Timeline();
                if (expanded) {
                    // Expanding: move icon to left, make text visible and managed.
                    horizontal.setCenter(item);
                    horizontal.setLeft(skinnable.getLeftGraphic());
                    item.setManaged(true);
                    timeline.getKeyFrames().add(new KeyFrame(Duration.millis(250),
                            new KeyValue(item.opacityProperty(), 1, Motion.STANDARD)));
                } else {
                    // Collapsing: fade text out, then move icon to center.
                    timeline.getKeyFrames().add(new KeyFrame(Duration.millis(180),
                            new KeyValue(item.opacityProperty(), 0, Motion.STANDARD)));
                    timeline.setOnFinished(e -> {
                        item.setManaged(false);
                        horizontal.setLeft(null);
                        horizontal.setCenter(skinnable.getLeftGraphic());
                    });
                }
                timeline.play();
            } else {
                if (expanded) {
                    horizontal.setCenter(item);
                    horizontal.setLeft(skinnable.getLeftGraphic());
                    item.setManaged(true);
                    item.setOpacity(1);
                } else {
                    item.setManaged(false);
                    horizontal.setLeft(null);
                    horizontal.setCenter(skinnable.getLeftGraphic());
                    item.setOpacity(0);
                }
            }
        });

        getChildren().setAll(new RipplerContainer(horizontal));
    }
}

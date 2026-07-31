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

import javafx.css.PseudoClass;
import javafx.scene.control.SkinBase;
import javafx.scene.layout.BorderPane;
import org.jackhuang.csl.ui.FXUtils;

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

        // Collapsible sidebar item: the icon is always pinned to the same left
        // position (BorderPane left + the CSS padding of `.compact`); expanding
        // the sidebar only reveals the text label next to it. A single
        // container is used for both states, so the left graphic can be safely
        // bound - the previous "BorderPane.left : A bound value cannot be set."
        // crash happened because the icon was moved between two containers.
        skinnable.getStyleClass().add("compact");

        item.visibleProperty().bind(skinnable.expandedProperty());
        item.managedProperty().bind(skinnable.expandedProperty());

        horizontal.leftProperty().bind(skinnable.leftGraphicProperty());
        getChildren().setAll(new RipplerContainer(horizontal));
    }
}

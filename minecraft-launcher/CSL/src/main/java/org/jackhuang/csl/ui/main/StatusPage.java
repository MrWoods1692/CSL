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
package org.jackhuang.csl.ui.main;

import javafx.beans.property.ReadOnlyObjectProperty;
import javafx.beans.property.ReadOnlyObjectWrapper;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import org.jackhuang.csl.ui.SVG;
import org.jackhuang.csl.ui.SystemStatusView;
import org.jackhuang.csl.ui.decorator.DecoratorPage;
import org.jetbrains.annotations.NotNullByDefault;

import static org.jackhuang.csl.util.i18n.I18n.i18n;

/// A full-page system status dashboard with transparent background and
/// modern card-based layout.
///
/// The page presents system information in a clean dashboard with:
/// - A centered header with icon, title, and description
/// - The live [SystemStatusView] embedded in a scrollable container
/// - Transparent background that blends with the app's background
@NotNullByDefault
public final class StatusPage extends StackPane implements DecoratorPage {

    private final ReadOnlyObjectWrapper<State> state = new ReadOnlyObjectWrapper<>(this, "state");

    public StatusPage() {
        getStyleClass().add("status-page-root");
        setPadding(new Insets(0));
        setAlignment(Pos.TOP_CENTER);

        VBox pageContent = new VBox(0);
        pageContent.getStyleClass().add("status-page");
        // Reserve space for the decorator title bar (42px) so the header is not obscured
        pageContent.setPadding(new Insets(42, 0, 0, 0));

        // Header
        pageContent.getChildren().add(buildHeader());

        // System status view
        SystemStatusView statusView = new SystemStatusView(() -> {});
        statusView.getStyleClass().add("status-page-view");
        statusView.show();

        StackPane statusWrapper = new StackPane(statusView);
        statusWrapper.setAlignment(Pos.TOP_CENTER);
        statusWrapper.setPadding(new Insets(0, 32, 32, 32));
        VBox.setVgrow(statusWrapper, Priority.ALWAYS);

        pageContent.getChildren().add(statusWrapper);

        ScrollPane scrollPane = new ScrollPane(pageContent);
        scrollPane.setFitToWidth(true);
        scrollPane.setFitToHeight(true);
        scrollPane.getStyleClass().add("edge-to-edge");
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);

        getChildren().add(scrollPane);

        state.setValue(new State(i18n("status"), null, true, false, true));
    }

    private static VBox buildHeader() {
        VBox header = new VBox(8);
        header.getStyleClass().add("status-page-header");
        header.setPadding(new Insets(32, 32, 24, 32));
        header.setAlignment(Pos.CENTER);

        StackPane iconCircle = new StackPane();
        iconCircle.getStyleClass().add("status-header-icon");
        iconCircle.getChildren().add(SVG.SYSTEM_MONITOR.createIcon(28));

        Label title = new Label(i18n("status"));
        title.getStyleClass().add("status-header-title");

        Label subtitle = new Label(i18n("status.description"));
        subtitle.getStyleClass().add("status-header-subtitle");
        subtitle.setWrapText(true);
        subtitle.setAlignment(Pos.CENTER);

        header.getChildren().addAll(iconCircle, title, subtitle);
        return header;
    }

    @Override
    public ReadOnlyObjectProperty<State> stateProperty() {
        return state.getReadOnlyProperty();
    }
}
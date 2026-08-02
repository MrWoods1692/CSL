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

import javafx.beans.binding.Bindings;
import javafx.beans.property.ReadOnlyObjectProperty;
import javafx.beans.property.ReadOnlyObjectWrapper;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
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
        setAlignment(Pos.TOP_LEFT);

        VBox pageContent = new VBox(0);
        pageContent.getStyleClass().add("status-page");
        pageContent.setAlignment(Pos.TOP_CENTER);
        pageContent.setFillWidth(true);
        // The decorator owns the title bar, so do not reserve its height inside
        // the scrollable page content. Doing so pushes the dashboard outside the
        // viewport when the page is laid out by the decorator.
        pageContent.setPadding(new Insets(12, 0, 0, 0));

        // System status view
        SystemStatusView statusView = new SystemStatusView(() -> {});
        statusView.setFullPageMode();
        statusView.getStyleClass().add("status-page-view");
        statusView.show();

        StackPane statusWrapper = new StackPane(statusView);
        statusWrapper.setAlignment(Pos.CENTER);
        statusWrapper.setPadding(new Insets(28, 40, 48, 40));
        // Keep the dashboard centered in the available area, but let the
        // wrapper grow naturally when the window is too small to contain it.
        statusWrapper.setMaxWidth(Double.MAX_VALUE);

        pageContent.getChildren().add(statusWrapper);

        ScrollPane scrollPane = new ScrollPane(pageContent);
        scrollPane.setFitToWidth(true);
        // Do not force the content to the viewport height. In a restored
        // window this can collapse the scrollable extent and make the first
        // or last cards unreachable.
        scrollPane.setFitToHeight(false);
        scrollPane.getStyleClass().add("edge-to-edge");
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);

        // Fill the viewport only when it is taller than the dashboard. When
        // the window is restored or shortened, the content keeps its natural
        // height so both scroll limits remain reachable.
        statusWrapper.minHeightProperty().bind(Bindings.createDoubleBinding(
            () -> Math.max(620, scrollPane.getViewportBounds().getHeight() - 60),
            scrollPane.viewportBoundsProperty()));

        getChildren().add(scrollPane);

        state.setValue(new State(i18n("status"), null, true, false, true));
    }

    @Override
    public ReadOnlyObjectProperty<State> stateProperty() {
        return state.getReadOnlyProperty();
    }
}
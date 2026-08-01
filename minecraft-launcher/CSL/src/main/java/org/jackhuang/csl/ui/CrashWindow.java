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
package org.jackhuang.csl.ui;

import com.jfoenix.controls.JFXButton;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import org.jackhuang.csl.Metadata;
import org.jackhuang.csl.countly.CrashReport;
import org.jackhuang.csl.upgrade.UpdateChecker;

import static org.jackhuang.csl.util.i18n.I18n.i18n;

/**
 * @author huangyuhui
 */
public class CrashWindow extends Stage {

    public CrashWindow(CrashReport report) {
        Label lblCrash = new Label();
        if (report.getThrowable() instanceof InternalError)
            lblCrash.setText(i18n("launcher.crash.java_internal_error"));
        else if (UpdateChecker.isOutdated())
            lblCrash.setText(i18n("launcher.crash.csl_out_dated"));
        else
            lblCrash.setText(i18n("launcher.crash"));
        lblCrash.setWrapText(true);

        TextArea textArea = new TextArea();
        textArea.setText(report.getDisplayText());
        textArea.setEditable(false);

        Button btnContact = new Button();
        btnContact.setText(i18n("launcher.contact"));
        btnContact.setOnAction(event -> FXUtils.openLink(Metadata.CONTACT_URL));
        HBox box = new HBox();
        box.setStyle("-fx-padding: 8px;");
        box.getChildren().add(btnContact);
        box.setAlignment(Pos.CENTER_RIGHT);

        BorderPane pane = new BorderPane();
        StackPane stackPane = new StackPane();
        stackPane.setStyle("-fx-padding: 8px;");
        stackPane.getChildren().add(lblCrash);
        pane.setTop(stackPane);
        pane.setCenter(textArea);
        pane.setBottom(box);

        // Wrap with custom window chrome (Apple-style controls)
        VBox rootPane = new VBox();
        rootPane.getStyleClass().add("crash-window-root");

        // Custom title bar
        HBox titleBar = new HBox(8);
        titleBar.setAlignment(Pos.CENTER_LEFT);
        titleBar.setPadding(new javafx.geometry.Insets(8, 8, 8, 8));
        titleBar.getStyleClass().add("crash-window-title-bar");

        JFXButton btnClose = new JFXButton();
        btnClose.setFocusTraversable(false);
        btnClose.getStyleClass().addAll("window-control-button", "window-control-close");
        btnClose.setOnAction(e -> { javafx.application.Platform.exit(); });

        JFXButton btnMin = new JFXButton();
        btnMin.setFocusTraversable(false);
        btnMin.getStyleClass().addAll("window-control-button", "window-control-min");
        btnMin.setOnAction(e -> setIconified(true));

        JFXButton btnMax = new JFXButton();
        btnMax.setFocusTraversable(false);
        btnMax.getStyleClass().addAll("window-control-button", "window-control-max");
        btnMax.setOnAction(e -> setMaximized(!isMaximized()));

        HBox buttonsContainer = new HBox(8);
        buttonsContainer.setAlignment(Pos.CENTER_LEFT);
        buttonsContainer.getChildren().setAll(btnClose, btnMin, btnMax);

        Label titleLabel = new Label(i18n("message.error"));
        titleLabel.getStyleClass().add("crash-window-title-label");
        titleLabel.setMaxWidth(Double.MAX_VALUE);
        HBox.setHgrow(titleLabel, Priority.ALWAYS);
        titleLabel.setAlignment(Pos.CENTER);

        titleBar.getChildren().setAll(buttonsContainer, titleLabel);

        // Make window draggable
        final double[] dragDelta = new double[2];
        titleBar.setOnMousePressed(e -> {
            dragDelta[0] = getX() - e.getScreenX();
            dragDelta[1] = getY() - e.getScreenY();
        });
        titleBar.setOnMouseDragged(e -> {
            setX(e.getScreenX() + dragDelta[0]);
            setY(e.getScreenY() + dragDelta[1]);
        });

        rootPane.getChildren().add(titleBar);
        VBox.setVgrow(pane, Priority.ALWAYS);
        rootPane.getChildren().add(pane);

        Scene scene = new Scene(rootPane, 800, 480);
        scene.setFill(Color.TRANSPARENT);
        setScene(scene);
        FXUtils.setIcon(this);
        setTitle(i18n("message.error"));
        initStyle(StageStyle.TRANSPARENT);

        setOnCloseRequest(e -> javafx.application.Platform.exit());
    }

}

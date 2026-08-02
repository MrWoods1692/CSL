/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 huangyuhui <huanghongxun2008@126.com> and contributors
 */
package org.jackhuang.csl.ui.construct;

import com.jfoenix.controls.JFXButton;
import javafx.collections.FXCollections;
import javafx.scene.control.ListView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.scene.control.Label;
import org.jetbrains.annotations.NotNullByDefault;

import java.util.function.Consumer;

/// Displays a combo box's values in the launcher's modal selection dialog.
@NotNullByDefault
public final class ComboBoxSelectionDialog<T> extends VBox {
    /// Creates a selection dialog for the supplied list of values.
    public ComboBoxSelectionDialog(ListView<T> source, T selected, Consumer<T> onSelected) {
        getStyleClass().add("combo-selection-dialog");

        var titleBar = new HBox();
        titleBar.getStyleClass().add("combo-selection-title-bar");
        var title = new Label("选择");
        title.getStyleClass().add("combo-selection-title");
        var close = new JFXButton();
        close.getStyleClass().add("macos-close-dot");
        close.setOnAction(event -> fireEvent(new DialogCloseEvent()));
        titleBar.getChildren().addAll(close, title);

        var list = new ListView<T>(FXCollections.observableArrayList(source.getItems()));
        list.getStyleClass().add("combo-selection-list");
        list.getSelectionModel().select(selected);
        list.setCellFactory(source.getCellFactory());
        list.setOnMouseClicked(event -> {
            if (event.getClickCount() == 1) {
                T value = list.getSelectionModel().getSelectedItem();
                if (value != null || list.getItems().contains(null)) {
                    onSelected.accept(value);
                    fireEvent(new DialogCloseEvent());
                }
            }
        });
        VBox.setVgrow(list, Priority.ALWAYS);

        getChildren().addAll(titleBar, list);
        setPrefSize(460, Math.min(520, Math.max(180, source.getItems().size() * 42.0 + 64)));
    }
}
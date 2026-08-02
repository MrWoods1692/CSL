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
package org.jackhuang.csl.ui.construct;

import com.jfoenix.controls.JFXButton;
import com.jfoenix.controls.JFXProgressBar;
import javafx.application.Platform;
import javafx.beans.property.StringProperty;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.layout.*;
import org.jackhuang.csl.task.TaskExecutor;
import org.jackhuang.csl.task.TaskListener;
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.util.TaskCancellationAction;
import org.jetbrains.annotations.NotNull;

import static org.jackhuang.csl.ui.FXUtils.onEscPressed;
import static org.jackhuang.csl.ui.FXUtils.runInFX;
import static org.jackhuang.csl.util.i18n.I18n.i18n;

public class TaskExecutorDialogPane extends BorderPane {
    private TaskExecutor executor;
    private TaskCancellationAction onCancel;
    private final Label lblTitle;
    private final JFXButton btnCancel;
    private final TaskListPane taskListPane;
    private final LoadingOverlay loadingOverlay;
    private final JFXProgressBar singleProgressBar;
    private final Label singleProgressLabel;
    private final VBox singleProgressBox;
    private boolean forceLoadingMode = false;

    public TaskExecutorDialogPane(@NotNull TaskCancellationAction cancel) {
        this.getStyleClass().add("task-executor-dialog-layout");

        FXUtils.setLimitWidth(this, 500);
        FXUtils.setLimitHeight(this, 300);

        VBox center = new VBox();
        this.setCenter(center);
        center.setPadding(new Insets(16));
        {
            lblTitle = new Label();
            lblTitle.setStyle("-fx-font-size: 14px; -fx-font-weight: BOLD;");

            taskListPane = new TaskListPane();
            VBox.setVgrow(taskListPane, Priority.ALWAYS);

            // Single progress view: loading animation above, progress bar below
            loadingOverlay = new LoadingOverlay();
            loadingOverlay.setStyle("-fx-background-color: transparent;");
            loadingOverlay.setMouseTransparent(true);
            loadingOverlay.setPickOnBounds(false);

            singleProgressBar = new JFXProgressBar();
            singleProgressBar.getStyleClass().add("single-download-progress");
            singleProgressBar.setProgress(ProgressIndicator.INDETERMINATE_PROGRESS);

            singleProgressLabel = new Label();
            singleProgressLabel.getStyleClass().add("single-download-label");

            singleProgressBox = new VBox(16, loadingOverlay, singleProgressBar, singleProgressLabel);
            singleProgressBox.setAlignment(Pos.CENTER);
            singleProgressBox.setPadding(new Insets(24, 32, 24, 32));
            singleProgressBox.setVisible(false);
            singleProgressBox.setManaged(false);

            center.getChildren().setAll(lblTitle, taskListPane, singleProgressBox);
        }

        HBox bottom = new HBox();
        bottom.setAlignment(Pos.CENTER_LEFT);
        bottom.setPadding(new Insets(0, 8, 8, 8));
        bottom.setSpacing(8);
        this.setBottom(bottom);
        {
            Region spacer = new Region();
            HBox.setHgrow(spacer, Priority.ALWAYS);
            btnCancel = new JFXButton(i18n("button.cancel"));
            btnCancel.getStyleClass().add("dialog-cancel");
            bottom.getChildren().setAll(spacer, btnCancel);
        }

        setCancel(cancel);

        btnCancel.setDisable(onCancel.getCancellationAction() == null);
        btnCancel.setOnAction(e -> {
            if (executor != null)
                executor.cancel();
            onCancel.getCancellationAction().accept(this);
        });

        onEscPressed(this, btnCancel::fire);
    }

    public void setExecutor(TaskExecutor executor) {
        setExecutor(executor, true);
    }

    public void setExecutor(TaskExecutor executor, boolean autoClose) {
        this.executor = executor;

        if (executor != null) {
            taskListPane.setExecutor(executor);

            if (forceLoadingMode) {
                // Force loading animation mode: always show LoadingOverlay + progress bar
                taskListPane.setVisible(false);
                taskListPane.setManaged(false);
                singleProgressBox.setVisible(true);
                singleProgressBox.setManaged(true);
                VBox.setVgrow(singleProgressBox, Priority.ALWAYS);
                singleProgressBar.setProgress(ProgressIndicator.INDETERMINATE_PROGRESS);
            }

            // When there's only one significant task, show the beautified single-progress view
            executor.addTaskListener(new TaskListener() {
                private boolean singleTaskMode = false;

                @Override
                public void onRunning(org.jackhuang.csl.task.Task<?> task) {
                    if (!task.getSignificance().shouldShow() || task.getName() == null)
                        return;

                    Platform.runLater(() -> {
                        if (!singleTaskMode && !forceLoadingMode) {
                            singleTaskMode = true;
                            taskListPane.setVisible(false);
                            taskListPane.setManaged(false);
                            singleProgressBox.setVisible(true);
                            singleProgressBox.setManaged(true);
                            VBox.setVgrow(singleProgressBox, Priority.ALWAYS);
                        }
                        singleProgressLabel.setText(task.getName());
                        singleProgressBar.progressProperty().bind(task.progressProperty());
                    });
                }

                @Override
                public void onStop(boolean success, TaskExecutor executor) {
                    Platform.runLater(() -> fireEvent(new DialogCloseEvent()));
                }
            });

            if (autoClose)
                executor.addTaskListener(new TaskListener() {
                    @Override
                    public void onStop(boolean success, TaskExecutor executor) {
                        Platform.runLater(() -> fireEvent(new DialogCloseEvent()));
                    }
                });
        }
    }

    /**
     * When set to true, the dialog always shows the loading animation + progress bar
     * instead of the task list, regardless of how many tasks are running.
     * Useful for launch pages where a clean loading UI is preferred.
     */
    public void setForceLoadingMode(boolean forceLoadingMode) {
        this.forceLoadingMode = forceLoadingMode;
    }

    public StringProperty titleProperty() {
        return lblTitle.textProperty();
    }

    public String getTitle() {
        return lblTitle.getText();
    }

    public void setTitle(String currentState) {
        lblTitle.setText(currentState);
    }

    public void setCancel(TaskCancellationAction onCancel) {
        this.onCancel = onCancel;

        runInFX(() -> btnCancel.setDisable(onCancel == null));
    }
}

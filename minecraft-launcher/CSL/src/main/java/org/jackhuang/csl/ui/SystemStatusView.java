/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 huangyuhui <huanghongxun2008@126.com> and contributors
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
import javafx.animation.FadeTransition;
import javafx.animation.Interpolator;
import javafx.animation.KeyFrame;
import javafx.animation.KeyValue;
import javafx.animation.Timeline;
import javafx.animation.TranslateTransition;
import javafx.application.Platform;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.geometry.Pos;
import javafx.scene.control.Label;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Arc;
import javafx.scene.shape.ArcType;
import javafx.scene.shape.Rectangle;
import javafx.scene.shape.StrokeLineCap;
import javafx.util.Duration;
import org.jackhuang.csl.setting.DownloadProviders;
import org.jackhuang.csl.setting.GameDirectoryManager;
import org.jackhuang.csl.setting.SettingsManager;
import org.jackhuang.csl.setting.UsageStatistics;
import org.jackhuang.csl.ui.animation.AnimationUtils;
import org.jackhuang.csl.util.DataSizeUnit;
import org.jackhuang.csl.util.MathUtils;
import org.jackhuang.csl.util.platform.OperatingSystem;
import org.jackhuang.csl.util.platform.SystemInfo;
import org.jackhuang.csl.util.platform.SystemUtils;
import org.jackhuang.csl.util.platform.hardware.CentralProcessor;
import org.jackhuang.csl.util.platform.hardware.GraphicsCard;
import org.jetbrains.annotations.Nullable;

import java.io.BufferedReader;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.Socket;
import java.net.SocketException;
import java.net.URI;
import java.nio.file.FileStore;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.jackhuang.csl.util.i18n.I18n.i18n;

/// A compact system status panel shown at the top-right corner of the main page.
///
/// The panel lists CPU / GPU / memory / disk / power / network information and
/// refreshes itself on a background daemon thread while the popup is open.
///
/// @author Glavo
public final class SystemStatusView extends StackPane {

    private static final int REFRESH_INTERVAL_MILLIS = 2000;
    private static final long SLOW_PROBE_INTERVAL_MILLIS = 30_000; // 30s, was 10s
    private static final long GAME_SIZE_INTERVAL_MILLIS = 120_000; // 2 minutes, was 30s

    /// CPU frequency from a cached platform-specific probe (all platforms except Linux).
    private static volatile String cachedCpuFrequency;

    /// The collected status values, updated on the JavaFX thread.
    private final ObjectProperty<Status> status = new SimpleObjectProperty<>(this, "status");

    private List<Gauge> gauges;

    private List<Tile> tiles;

    private List<StatTile> statsTiles;

    private GridPane statsGrid;

    private Label gpuInfoLabel;
    private Label systemInfoLabel;
    private Label recommendationLabel;
    private Label recommendationDetailsLabel;
    private Label deviceScoreLabel;
    private boolean recommendationExpanded;

    private BarSection memoryBar;
    private BarSection vramBar;
    private BarSection diskBar;

    private final VBox content = new VBox(8);

    private boolean hiding;

    private final Updater updater = new Updater(status);

    /// Creates a system status panel.
    ///
    /// @param onClose the action to run when the close button is pressed.
    public SystemStatusView(Runnable onClose) {
        this.getStyleClass().add("system-status-pane");

        Region background = new Region();
        background.getStyleClass().add("system-status-background");

        Label title = new Label(i18n("status"));
        title.getStyleClass().add("title");
        HBox.setHgrow(title, Priority.ALWAYS);

        JFXButton closeButton = new JFXButton();
        closeButton.getStyleClass().add("toggle-icon-tiny");
        closeButton.setGraphic(SVG.CLOSE.createIcon(14));
        closeButton.setOnAction(e -> onClose.run());

        SVGContainer headerIcon = SVG.SYSTEM_MONITOR.createIcon(18);
        headerIcon.getStyleClass().add("header-icon");

        HBox header = new HBox(8);
        header.setAlignment(Pos.CENTER_LEFT);
        header.getChildren().setAll(headerIcon, title, closeButton);

        // Gauges row: CPU / Memory / Disk
        HBox dashboard = new HBox(16);
        dashboard.setAlignment(Pos.CENTER);
        gauges = List.of(
                new Gauge(i18n("status.cpu.usage")),
                new Gauge(i18n("status.memory.used")),
                new Gauge(i18n("status.disk.used"))
        );
        dashboard.getChildren().setAll(gauges);

        // Detail tiles: 2x3 grid with equal-width columns
        GridPane tileGrid = new GridPane();
        tileGrid.setHgap(12);
        tileGrid.setVgap(12);
        // Two equal columns
        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(50);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(50);
        tileGrid.getColumnConstraints().addAll(col1, col2);
        tiles = List.of(
                addTile(tileGrid, 0, 0, i18n("status.cpu"), SVG.HOST, "tile-sub"),
                addTile(tileGrid, 1, 0, i18n("status.gpu.state"), SVG.SCREENSHOT_MONITOR, "tile-sub"),
                addTile(tileGrid, 0, 1, i18n("status.launcher.usage"), SVG.ROCKET_LAUNCH, "tile-sub"),
                addTile(tileGrid, 1, 1, i18n("status.power.network"), SVG.POWER, "tile-value"),
                addTile(tileGrid, 0, 2, i18n("status.game.size"), SVG.STORAGE, "tile-sub"),
                addTile(tileGrid, 1, 2, i18n("status.java"), SVG.JAVA, "tile-sub")
        );

        // Statistics tiles: 2x4 grid
        this.statsGrid = new GridPane();
        statsGrid.setHgap(12);
        statsGrid.setVgap(12);
        ColumnConstraints statsCol1 = new ColumnConstraints();
        statsCol1.setPercentWidth(50);
        ColumnConstraints statsCol2 = new ColumnConstraints();
        statsCol2.setPercentWidth(50);
        statsGrid.getColumnConstraints().addAll(statsCol1, statsCol2);

        Label statsTitle = new Label(i18n("status.statistics"));
        statsTitle.getStyleClass().add("section-title");

        SVGContainer statsIcon = SVG.GRAPH2.createIcon(16);
        statsIcon.getStyleClass().add("stats-tile-icon");
        HBox statsHeader = new HBox(6, statsIcon, statsTitle);
        statsHeader.setAlignment(Pos.CENTER_LEFT);

        statsTiles = List.of(
                addStatTile(statsGrid, 0, 0, i18n("status.stats.launch_count"), SVG.ROCKET_LAUNCH),
                addStatTile(statsGrid, 1, 0, i18n("status.stats.game_time"), SVG.UPDATE),
                addStatTile(statsGrid, 0, 1, i18n("status.stats.download_count"), SVG.DOWNLOAD),
                addStatTile(statsGrid, 1, 1, i18n("status.stats.download_bytes"), SVG.STORAGE),
                addStatTile(statsGrid, 0, 2, i18n("status.stats.launch_success"), SVG.CHECK_CIRCLE),
                addStatTile(statsGrid, 1, 2, i18n("status.stats.launch_failure"), SVG.CANCEL),
                addStatTile(statsGrid, 0, 3, i18n("status.stats.multiplayer"), SVG.PERSON),
                addStatTile(statsGrid, 1, 3, i18n("status.stats.launcher_runtime"), SVG.UPDATE)
        );

        VBox rows = new VBox(10);
        rows.getChildren().add(tileGrid);

        // Separator before statistics section
        Region statsSeparator = new Region();
        statsSeparator.getStyleClass().add("stats-separator");
        rows.getChildren().add(statsSeparator);

        rows.getChildren().add(statsHeader);
        rows.getChildren().add(statsGrid);
        gpuInfoLabel = addRow(rows, i18n("status.gpu.info"), SVG.SCREENSHOT_MONITOR);
        systemInfoLabel = addRow(rows, i18n("status.hardware.summary"), SVG.HOST);
        recommendationLabel = addRow(rows, i18n("status.graphics.recommendation"), SVG.SETTINGS);
        recommendationLabel.getStyleClass().add("recommendation-value");
        recommendationLabel.setMaxWidth(720);
        recommendationLabel.setTooltip(new Tooltip(i18n("status.graphics.recommendation.expand")));
        recommendationLabel.setOnMouseClicked(event -> toggleRecommendation());
        recommendationLabel.setOnMouseEntered(event -> recommendationLabel.setOpacity(0.78));
        recommendationLabel.setOnMouseExited(event -> recommendationLabel.setOpacity(1));
        recommendationDetailsLabel = addRow(rows, i18n("status.graphics.recommendation.details"), SVG.SETTINGS);
        recommendationDetailsLabel.getStyleClass().add("recommendation-details-value");
        recommendationDetailsLabel.setWrapText(true);
        recommendationDetailsLabel.setMaxWidth(720);
        recommendationDetailsLabel.setVisible(false);
        recommendationDetailsLabel.setManaged(false);
        deviceScoreLabel = addRow(rows, i18n("status.device.score"), SVG.SYSTEM_MONITOR);
        deviceScoreLabel.getStyleClass().add("device-score-value");
        memoryBar = addBarSection(rows, i18n("status.memory"), SVG.MEMORY);
        vramBar = addBarSection(rows, i18n("status.vram"), SVG.MEMORY);
        diskBar = addBarSection(rows, i18n("status.disk"), SVG.STORAGE);

        content.getStyleClass().add("system-status-content");
        content.setMaxWidth(560);
        content.getChildren().setAll(header, dashboard, rows);

        getChildren().setAll(background, content);

        FXUtils.onChange(status, this::apply);

        updater.start();
    }

    /**
     * Expands the compact popup layout for use as a standalone page.
     */
    public void setFullPageMode() {
        // The first child is the compact popup header. The page already has its
        // title in the window decorator, so keeping it here wastes vertical space.
        if (!content.getChildren().isEmpty())
            content.getChildren().remove(0);
        content.setPrefWidth(1120);
        content.setMaxWidth(1120);
        content.setSpacing(18);
        // Also widen stats grid for full page mode
        statsGrid.setPrefWidth(1120);
        statsGrid.setMaxWidth(1120);
    }

    /// The panel is sized by its content; the parent must not stretch it to fill the page.
    @Override
    public boolean isResizable() {
        return false;
    }

    /// Plays the dropdown animation and starts refreshing the panel.
    public void show() {
        if (hiding)
            return;
        updater.setActive(true);
        setVisible(true);
        if (AnimationUtils.isAnimationEnabled()) {
            FadeTransition fade = new FadeTransition(Duration.millis(160), this);
            fade.setFromValue(0);
            fade.setToValue(1);
            FXUtils.playAnimation(this, "system-status-show-fade", fade);

            TranslateTransition slide = new TranslateTransition(Duration.millis(160), this);
            slide.setFromY(-8);
            slide.setToY(0);
            FXUtils.playAnimation(this, "system-status-show-slide", slide);
        }
    }

    /// Plays the collapse animation and stops refreshing the panel.
    public void hide() {
        if (hiding)
            return;
        hiding = true;
        updater.setActive(false);
        if (AnimationUtils.isAnimationEnabled()) {
            FadeTransition fade = new FadeTransition(Duration.millis(120), this);
            fade.setFromValue(1);
            fade.setToValue(0);
            fade.setOnFinished(e -> {
                hiding = false;
                setVisible(false);
            });
            FXUtils.playAnimation(this, "system-status-hide-fade", fade);

            TranslateTransition slide = new TranslateTransition(Duration.millis(120), this);
            slide.setFromY(0);
            slide.setToY(-8);
            FXUtils.playAnimation(this, "system-status-hide-slide", slide);
        } else {
            hiding = false;
            setVisible(false);
        }
    }

    private static Label addRow(VBox box, String name, SVG icon) {
        Label nameLabel = new Label(name);
        nameLabel.getStyleClass().add("name");

        SVGContainer iconView = icon.createIcon(14);
        iconView.getStyleClass().add("row-icon");

        Label valueLabel = new Label("--");
        valueLabel.getStyleClass().add("value");
        valueLabel.setMaxWidth(205);
        valueLabel.setWrapText(true);
        valueLabel.setAlignment(Pos.CENTER_RIGHT);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        HBox row = new HBox(8, iconView, nameLabel, spacer, valueLabel);
        row.setAlignment(Pos.CENTER_LEFT);
        row.getStyleClass().add("status-card");

        box.getChildren().add(row);
        return valueLabel;
    }

    private static final int TILE_HEIGHT = 118;

    /// A square dashboard tile showing one metric (icon + name + value).
    ///
    /// The optional second line ([Tile.extra]) is hidden until it receives text;
    /// it is styled with the given style class (muted for e.g. the CPU frequency,
    /// or a full value style for e.g. the network state).
    private static final class Tile {
        final Label value;
        final Label extra;

        Tile(Label value, Label extra) {
            this.value = value;
            this.extra = extra;
        }
    }

    private static Tile addTile(GridPane grid, int column, int row, String name, SVG icon, String extraStyleClass) {
        Label nameLabel = new Label(name);
        nameLabel.getStyleClass().add("tile-name");

        SVGContainer iconView = icon.createIcon(13);
        iconView.getStyleClass().add("row-icon");

        HBox head = new HBox(4, iconView, nameLabel);
        head.setAlignment(Pos.CENTER_LEFT);

        Label valueLabel = new Label("--");
        valueLabel.getStyleClass().add("tile-value");
        valueLabel.setWrapText(true);

        Label extraLabel = new Label();
        extraLabel.getStyleClass().add(extraStyleClass);
        extraLabel.setWrapText(true);
        extraLabel.setVisible(false);
        extraLabel.setManaged(false);

        VBox tile = new VBox(4, head, valueLabel, extraLabel);
        tile.getStyleClass().addAll("status-card", "status-tile");
        tile.setMinHeight(TILE_HEIGHT);
        tile.setPrefHeight(TILE_HEIGHT);
        tile.setMaxHeight(TILE_HEIGHT);

        GridPane.setHgrow(tile, Priority.ALWAYS);
        grid.add(tile, column, row);

        return new Tile(valueLabel, extraLabel);
    }

    /// A statistics tile showing a named counter with an icon.
    private static final class StatTile {
        final Label value;

        StatTile(Label value) {
            this.value = value;
        }
    }

    private static StatTile addStatTile(GridPane grid, int column, int row, String name, SVG icon) {
        Label nameLabel = new Label(name);
        nameLabel.getStyleClass().add("stats-tile-name");

        SVGContainer iconView = icon.createIcon(14);
        iconView.getStyleClass().add("stats-tile-icon");

        HBox head = new HBox(6, iconView, nameLabel);
        head.setAlignment(Pos.CENTER_LEFT);

        Label valueLabel = new Label("--");
        valueLabel.getStyleClass().add("stats-tile-value");
        valueLabel.setWrapText(true);

        VBox tile = new VBox(6, head, valueLabel);
        tile.getStyleClass().addAll("status-card", "stats-tile");
        tile.setMinHeight(TILE_HEIGHT);
        tile.setPrefHeight(TILE_HEIGHT);
        tile.setMaxHeight(TILE_HEIGHT);

        GridPane.setHgrow(tile, Priority.ALWAYS);
        grid.add(tile, column, row);

        return new StatTile(valueLabel);
    }

    private static BarSection addBarSection(VBox box, String name, SVG icon) {
        Label nameLabel = new Label(name);
        nameLabel.getStyleClass().add("name");

        SVGContainer iconView = icon.createIcon(14);
        iconView.getStyleClass().add("row-icon");

        StackPane bar = new StackPane();
        bar.getStyleClass().add("status-bar");

        Region track = new Region();
        track.getStyleClass().add("status-bar-track");

        Rectangle fill = new Rectangle();
        fill.getStyleClass().add("status-bar-fill");
        fill.setManaged(false);
        fill.setArcWidth(4);
        fill.setArcHeight(4);
        StackPane.setAlignment(fill, Pos.CENTER_LEFT);
        fill.widthProperty().bind(bar.widthProperty());
        fill.heightProperty().bind(bar.heightProperty());

        bar.getChildren().setAll(track, fill);

        Label percentLabel = new Label("--");
        percentLabel.getStyleClass().add("value");
        percentLabel.setAlignment(Pos.CENTER_RIGHT);

        HBox firstLine = new HBox(8, iconView, nameLabel, bar, percentLabel);
        firstLine.setAlignment(Pos.CENTER_LEFT);
        HBox.setHgrow(bar, Priority.ALWAYS);

        Label valueLabel = new Label("--");
        valueLabel.getStyleClass().add("value");
        valueLabel.setMaxWidth(205);
        valueLabel.setWrapText(true);

        VBox card = new VBox(4, firstLine, valueLabel);
        card.getStyleClass().add("status-card");

        box.getChildren().add(card);
        return new BarSection(bar, fill, percentLabel, valueLabel);
    }

    /// A linear progress bar section with a percentage label and a detail text line.
    private static final class BarSection {
        final StackPane bar;
        final Rectangle fill;
        final Label percentLabel;
        final Label valueLabel;

        BarSection(StackPane bar, Rectangle fill, Label percentLabel, Label valueLabel) {
            this.bar = bar;
            this.fill = fill;
            this.percentLabel = percentLabel;
            this.valueLabel = valueLabel;
        }
    }

    private void apply(@Nullable Status newStatus) {
        if (newStatus == null)
            return;

        gauges.get(0).setProgress(newStatus.cpuPercent());
        gauges.get(1).setProgress(newStatus.memoryPercent());
        gauges.get(2).setProgress(newStatus.diskPercent());

        tiles.get(0).value.setText(newStatus.cpuCores());
        tiles.get(0).extra.setText(newStatus.cpuFrequency());
        tiles.get(0).extra.setVisible(true);
        tiles.get(0).extra.setManaged(true);
        tiles.get(1).value.setText(newStatus.gpuState());
        tiles.get(2).value.setText(newStatus.launcherUsage());
        tiles.get(3).value.setText(newStatus.power());
        setStatusColor(tiles.get(3).value, newStatus.powerState());
        tiles.get(3).extra.setText(newStatus.network());
        tiles.get(3).extra.setVisible(true);
        tiles.get(3).extra.setManaged(true);
        setStatusColor(tiles.get(3).extra, newStatus.networkState());
        tiles.get(4).value.setText(newStatus.gameSize());
        tiles.get(5).value.setText(newStatus.javaVersion());

        // Update statistics tiles
        updateStats();

        gpuInfoLabel.setText(newStatus.gpuInfo());
        systemInfoLabel.setText(newStatus.systemInfo());
        recommendationLabel.setText(formatRecommendationLabel(newStatus.graphicsRecommendation()));
        recommendationDetailsLabel.setText(newStatus.graphicsRecommendationDetails());
        deviceScoreLabel.setText(newStatus.deviceScore());
        setScoreColor(deviceScoreLabel, newStatus.deviceScoreValue());

        updateBar(memoryBar, newStatus.memoryUsedBytes(), newStatus.memoryTotalBytes(), formatMemoryBar(newStatus));
        updateBar(vramBar, newStatus.vramUsedBytes(), newStatus.vramTotalBytes(), formatVramBar(newStatus));
        updateBar(diskBar, newStatus.diskUsedBytes(), newStatus.diskTotalBytes(), formatDiskBar(newStatus));
    }

    private void updateStats() {
        try {
            UsageStatistics stats = SettingsManager.usageStats();
            statsTiles.get(0).value.setText(formatCount(stats.getLaunchCount()));
            statsTiles.get(1).value.setText(formatDuration(stats.getTotalGameTimeMs()));
            statsTiles.get(2).value.setText(formatCount(stats.getDownloadCount()));
            statsTiles.get(3).value.setText(DataSizeUnit.format(stats.getTotalDownloadBytes()));
            statsTiles.get(4).value.setText(formatCount(stats.getLaunchSuccessCount()));
            statsTiles.get(5).value.setText(formatCount(stats.getLaunchFailureCount()));
            statsTiles.get(6).value.setText(formatCount(stats.getMultiplayerCount()));
            statsTiles.get(7).value.setText(formatDuration(stats.getTotalLauncherRuntimeMs()));
        } catch (IllegalStateException ignored) {
        }
    }

    private static String formatCount(long count) {
        if (count <= 0) return "--";
        if (count < 1000) return String.valueOf(count);
        if (count < 1_000_000) return String.format("%.1fK", count / 1000.0);
        return String.format("%.1fM", count / 1_000_000.0);
    }

    private static String formatDuration(long ms) {
        if (ms <= 0) return "--";
        long seconds = ms / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;
        if (days > 0)
            return days + "d " + (hours % 24) + "h";
        if (hours > 0)
            return hours + "h " + (minutes % 60) + "m";
        if (minutes > 0)
            return minutes + "m";
        return seconds + "s";
    }

    private void toggleRecommendation() {
        recommendationExpanded = !recommendationExpanded;
        recommendationDetailsLabel.setVisible(recommendationExpanded);
        recommendationDetailsLabel.setManaged(recommendationExpanded);
        recommendationLabel.setText(formatRecommendationLabel(
            recommendationLabel.getText().replaceFirst("^[▸▾] ", "")));
        }

        private String formatRecommendationLabel(String recommendation) {
        return (recommendationExpanded ? "▾ " : "▸ ") + recommendation;
    }

    private static void setScoreColor(Label label, int score) {
        label.setStyle("-fx-text-fill: " + toCssColor(
                score >= 80 ? colorFor(15) : score >= 60 ? colorFor(45) : colorFor(75)) + ";");
    }

    private static String formatMemoryBar(Status status) {
        if (status.memoryTotalBytes() <= 0 || status.memoryUsedBytes() < 0 || status.memoryFreeBytes() < 0)
            return "--";
        return i18n("status.memory.bar.value",
                DataSizeUnit.format(status.memoryUsedBytes()),
                DataSizeUnit.format(status.memoryTotalBytes()),
                DataSizeUnit.format(status.memoryFreeBytes()));
    }

    private static String formatDiskBar(Status status) {
        if (status.diskTotalBytes() <= 0 || status.diskUsedBytes() < 0 || status.diskFreeBytes() < 0)
            return "--";
        return i18n("status.disk.bar.value",
                DataSizeUnit.format(status.diskUsedBytes()),
                DataSizeUnit.format(status.diskTotalBytes()),
                DataSizeUnit.format(status.diskFreeBytes()),
                status.gameBytes() >= 0 ? DataSizeUnit.format(status.gameBytes()) : "--");
    }

    private static String formatVramBar(Status status) {
        if (status.vramTotalBytes() <= 0 || status.vramUsedBytes() < 0)
            return "--";
        return i18n("status.vram.bar.value",
                DataSizeUnit.format(status.vramUsedBytes()),
                DataSizeUnit.format(status.vramTotalBytes()));
    }

    private static void updateBar(BarSection section, long used, long total, String valueText) {
        if (total > 0 && used >= 0) {
            double percent = MathUtils.clamp(used * 100.0 / total, 0, 100);
            section.fill.widthProperty().bind(section.bar.widthProperty().multiply(percent / 100));
            section.fill.setFill(colorFor(percent));
            section.percentLabel.setText(Math.round(percent) + "%");
            section.percentLabel.setStyle("-fx-text-fill: " + toCssColor(colorFor(percent)) + ";");
            section.valueLabel.setText(valueText);
        } else {
            section.fill.widthProperty().bind(section.bar.widthProperty().multiply(0));
            section.fill.setFill(colorFor(0));
            section.percentLabel.setText("--");
            section.percentLabel.setStyle("");
            section.valueLabel.setText(valueText);
        }
    }

    /// The bar and gauge color encodes the severity: green (0%) to red (100%).
    private static Color colorFor(double percent) {
        double hue = 120 * (1 - MathUtils.clamp(percent, 0, 100) / 100);
        return Color.hsb(hue, 0.85, 0.8);
    }

    /// Colors a value label by its state: 0 = neutral, 1 = good, 2 = warning, 3 = bad.
    private static void setStatusColor(Label label, int state) {
        if (state <= 0) {
            label.setStyle("");
            return;
        }
        Color color = switch (state) {
            case 1 -> colorFor(20);
            case 2 -> colorFor(55);
            case 3 -> colorFor(0);
            default -> null;
        };
        if (color != null)
            label.setStyle("-fx-text-fill: " + toCssColor(color) + ";");
    }

    private static String toCssColor(Color color) {
        return String.format(Locale.ROOT, "#%02x%02x%02x",
                (int) Math.round(color.getRed() * 255),
                (int) Math.round(color.getGreen() * 255),
                (int) Math.round(color.getBlue() * 255));
    }

    /// All values displayed by the panel, collected on the background thread.
    public record Status(
            int cpuPercent,
            int memoryPercent,
            int diskPercent,
            int powerState,
            int networkState,
            long memoryUsedBytes,
            long memoryTotalBytes,
            long memoryFreeBytes,
            long diskUsedBytes,
            long diskTotalBytes,
            long diskFreeBytes,
            long gameBytes,
            long vramUsedBytes,
            long vramTotalBytes,
            String cpuCores,
            String cpuFrequency,
            String gpuState,
            String gpuInfo,
            String systemInfo,
            String graphicsRecommendation,
            String graphicsRecommendationDetails,
            int deviceScoreValue,
            String deviceScore,
            String launcherUsage,
            String power,
            String network,
            String gameSize,
            String javaVersion
    ) {
    }

    /// A circular progress gauge with a percentage label and a caption below it.
    ///
    /// The arcs live in a plain [Pane] so that changing the value arc length never
    /// shifts the geometry through layout bounds recalculation.
    private static final class Gauge extends StackPane {

        private static final double DIAMETER = 108;
        private static final double RADIUS = 40;
        private static final double STROKE_WIDTH = 8;
        private static final Duration ANIMATION_DURATION = Duration.millis(400);

        private final Arc valueArc;
        private final Label percentLabel;
        private final Timeline valueAnimation = new Timeline();

        Gauge(String caption) {
            getStyleClass().addAll("gauge", "status-card", "status-gauge-card");

            Arc track = new Arc(DIAMETER / 2, DIAMETER / 2, RADIUS, RADIUS, 90, -360);
            track.getStyleClass().add("gauge-track");
            track.setType(ArcType.OPEN);
            track.setFill(null);
            track.setStrokeWidth(STROKE_WIDTH);
            track.setStrokeLineCap(StrokeLineCap.ROUND);

            valueArc = new Arc(DIAMETER / 2, DIAMETER / 2, RADIUS, RADIUS, 90, 0);
            valueArc.getStyleClass().add("gauge-value");
            valueArc.setType(ArcType.OPEN);
            valueArc.setFill(null);
            valueArc.setStrokeWidth(STROKE_WIDTH);
            valueArc.setStrokeLineCap(StrokeLineCap.ROUND);
            valueArc.setStroke(colorFor(0));

            Pane arcsPane = new Pane(track, valueArc);
            arcsPane.setPrefSize(DIAMETER, DIAMETER);
            arcsPane.setMinSize(DIAMETER, DIAMETER);
            arcsPane.setMaxSize(DIAMETER, DIAMETER);

            percentLabel = new Label("--");
            percentLabel.getStyleClass().add("gauge-percent");
            percentLabel.setAlignment(Pos.CENTER);

            StackPane circle = new StackPane(arcsPane, percentLabel);
            circle.setPrefSize(DIAMETER, DIAMETER);
            circle.setMinSize(DIAMETER, DIAMETER);
            circle.setMaxSize(DIAMETER, DIAMETER);

            Label captionLabel = new Label(caption);
            captionLabel.getStyleClass().add("gauge-caption");

            VBox box = new VBox(4, circle, captionLabel);
            box.setAlignment(Pos.CENTER);

            setAlignment(Pos.CENTER);
            getChildren().add(box);
        }

        void setProgress(double percent) {
            if (percent < 0) {
                valueAnimation.stop();
                valueArc.setLength(0);
                percentLabel.setText("--");
                percentLabel.setStyle("");
                valueArc.setStroke(colorFor(0));
                return;
            }

            double clamped = MathUtils.clamp(percent, 0, 100);
            percentLabel.setText(Math.round(clamped) + "%");
            percentLabel.setStyle("-fx-text-fill: " + toCssColor(colorFor(clamped)) + ";");
            valueArc.setStroke(colorFor(clamped));

            double targetLength = -360 * clamped / 100;
            if (AnimationUtils.isAnimationEnabled()) {
                valueAnimation.stop();
                valueAnimation.getKeyFrames().setAll(new KeyFrame(
                        ANIMATION_DURATION,
                        new KeyValue(valueArc.lengthProperty(), targetLength, Interpolator.EASE_OUT)));
                valueAnimation.play();
            } else {
                valueArc.setLength(targetLength);
            }
        }

    }

    private static final class Updater extends Thread {

        private final ObjectProperty<Status> statusProperty;

        private volatile boolean active = true;

        private long lastGameSizeCheck;
        private long gameSize = -1;

        private long lastPowerCheck;
        private String powerStatus;

        private long lastNetworkCheck;
        private String networkStatus;

        private long lastVramCheck;
        private long vramUsed = -1;
        private long vramTotal = -1;

        private int powerState;
        private int networkState;

        Updater(ObjectProperty<Status> statusProperty) {
            super("SystemStatusUpdater");
            this.statusProperty = statusProperty;

            setDaemon(true);
            setPriority(Thread.MIN_PRIORITY);
        }

        void setActive(boolean active) {
            this.active = active;
        }

        @Override
        public void run() {
            while (true) {
                if (Controllers.isStopped())
                    return;

                if (active) {
                    Status newStatus = collect();
                    Platform.runLater(() -> statusProperty.set(newStatus));
                }

                try {
                    //noinspection BusyWait
                    Thread.sleep(REFRESH_INTERVAL_MILLIS);
                } catch (InterruptedException e) {
                    return;
                }
            }
        }

        private Status collect() {
            long now = System.currentTimeMillis();

            int cpuPercent = sampleCpuUsage();

            long totalMemory = SystemInfo.getTotalMemorySize();
            long freeMemory = SystemInfo.getFreeMemorySize();
            long usedMemory = totalMemory > 0 && freeMemory >= 0
                    ? Long.max(0, totalMemory - freeMemory)
                    : -1;
            int memoryPercent = totalMemory > 0 && usedMemory >= 0
                    ? (int) Math.round(usedMemory * 100.0 / totalMemory)
                    : -1;

            long[] diskSpace = getDiskSpace();
            long diskTotal = diskSpace[0];
            long diskFree = diskSpace[1];
            long diskUsed = diskTotal > 0 && diskFree >= 0
                    ? Long.max(0, diskTotal - diskFree)
                    : -1;
            int diskPercent = diskTotal > 0 && diskUsed >= 0
                    ? (int) Math.round(diskUsed * 100.0 / diskTotal)
                    : -1;

            long gameBytes = getGameSpace(now);

            if (now - lastVramCheck >= SLOW_PROBE_INTERVAL_MILLIS) {
                lastVramCheck = now;
                probeVram();
            }

            String powerStatus = getPowerStatus(now);
            String networkStatus = getNetworkStatus(now);

            List<GraphicsCard> graphicsCards = SystemInfo.getGraphicsCards();

            return new Status(
                    cpuPercent,
                    memoryPercent,
                    diskPercent,
                    powerState,
                    networkState,
                    usedMemory,
                    totalMemory,
                    freeMemory,
                    diskUsed,
                    diskTotal,
                    diskFree,
                    gameBytes,
                    vramUsed,
                    vramTotal,
                    getCpuCores(),
                    getCpuFrequency(),
                    graphicsCards == null || graphicsCards.isEmpty()
                            ? i18n("status.not_detected")
                            : i18n("status.detected"),
                    graphicsCards == null || graphicsCards.isEmpty()
                            ? i18n("status.not_detected")
                            : formatGraphicsCards(graphicsCards),
                        getSystemInfo(),
                        getGraphicsRecommendation(totalMemory, vramTotal, graphicsCards),
                        getGraphicsRecommendationDetails(totalMemory, vramTotal, graphicsCards),
                        calculateDeviceScore(totalMemory, vramTotal, graphicsCards, diskTotal, diskFree),
                        formatDeviceScore(calculateDeviceScore(totalMemory, vramTotal, graphicsCards, diskTotal, diskFree)),
                    getLauncherUsage(),
                    powerStatus,
                    networkStatus,
                    gameBytes >= 0 ? DataSizeUnit.format(gameBytes) : i18n("status.unknown"),
                    System.getProperty("java.version", i18n("status.unknown"))
                            + " (" + System.getProperty("java.vendor", "") + ")"
            );
        }

        private static String formatGraphicsCards(List<GraphicsCard> graphicsCards) {
            StringBuilder builder = new StringBuilder();
            for (GraphicsCard card : graphicsCards) {
                if (builder.length() > 0)
                    builder.append("; ");
                builder.append(card);
                if (card.getDriverVersion() != null)
                    builder.append(" · ").append(i18n("status.gpu.driver", card.getDriverVersion()));
            }
            return builder.toString();
        }

        private static String getSystemInfo() {
            String os = OperatingSystem.CURRENT_OS.name();
            String arch = System.getProperty("os.arch", i18n("status.unknown"));
            return os + " · " + arch;
        }

        private static String getGraphicsRecommendation(long totalMemory, long vramTotal,
                List<GraphicsCard> graphicsCards) {
            long memoryGiB = totalMemory > 0 ? totalMemory / (1024 * 1024 * 1024) : 0;
            long vramGiB = vramTotal > 0 ? vramTotal / (1024 * 1024 * 1024) : 0;
            boolean hasGpu = graphicsCards != null && !graphicsCards.isEmpty();

            if (hasGpu && memoryGiB >= 16 && vramGiB >= 6)
                return i18n("status.graphics.recommendation.high");
            if (hasGpu && memoryGiB >= 8 && vramGiB >= 2)
                return i18n("status.graphics.recommendation.balanced");
            return i18n("status.graphics.recommendation.performance");
        }

        private static String getGraphicsRecommendationDetails(long totalMemory, long vramTotal,
                List<GraphicsCard> graphicsCards) {
            long memoryGiB = totalMemory > 0 ? totalMemory / (1024 * 1024 * 1024) : 0;
            long vramGiB = vramTotal > 0 ? vramTotal / (1024 * 1024 * 1024) : 0;
            boolean hasGpu = graphicsCards != null && !graphicsCards.isEmpty();

            if (hasGpu && memoryGiB >= 16 && vramGiB >= 6)
                return i18n("status.graphics.details.high");
            if (hasGpu && memoryGiB >= 8 && vramGiB >= 2)
                return i18n("status.graphics.details.balanced");
            return i18n("status.graphics.details.performance");
        }

        private static int calculateDeviceScore(long totalMemory, long vramTotal,
                List<GraphicsCard> graphicsCards, long diskTotal, long diskFree) {
            int score = 0;
            long memoryGiB = totalMemory > 0 ? totalMemory / (1024 * 1024 * 1024) : 0;
            long vramGiB = vramTotal > 0 ? vramTotal / (1024 * 1024 * 1024) : 0;

            score += memoryGiB >= 32 ? 25 : memoryGiB >= 16 ? 22 : memoryGiB >= 8 ? 17 : memoryGiB > 0 ? 10 : 0;
            score += vramGiB >= 12 ? 30 : vramGiB >= 6 ? 26 : vramGiB >= 4 ? 22 : vramGiB >= 2 ? 16 : vramGiB > 0 ? 8 : 0;
            score += graphicsCards != null && !graphicsCards.isEmpty() ? 25 : 5;
            score += diskTotal > 0 && diskFree >= diskTotal / 3 ? 20 : diskTotal > 0 ? 10 : 0;
            return Math.min(100, score);
        }

        private static String formatDeviceScore(int score) {
            String level = score >= 80 ? i18n("status.device.score.excellent")
                    : score >= 60 ? i18n("status.device.score.good")
                    : i18n("status.device.score.basic");
            return i18n("status.device.score.value", score, level);
        }

        private static int sampleCpuUsage() {
            try {
                if (ManagementFactory.getOperatingSystemMXBean() instanceof com.sun.management.OperatingSystemMXBean bean) {
                    double load = bean.getCpuLoad();
                    if (load >= 0)
                        return (int) Math.round(load * 100);
                }
            } catch (Throwable ignored) {
            }
            return -1;
        }

        private static String getCpuCores() {
            CentralProcessor cpu = SystemInfo.getCentralProcessor();
            if (cpu != null) {
                CentralProcessor.Cores cores = cpu.getCores();
                if (cores != null)
                    return i18n("status.cpu.cores.value", cores.physical(), cores.logical());
            }

            int available = Runtime.getRuntime().availableProcessors();
            return i18n("status.cpu.cores.value", available, available);
        }

        private static String getCpuFrequency() {
            if (OperatingSystem.CURRENT_OS == OperatingSystem.LINUX) {
                String value = readValueOf(Paths.get("/proc/cpuinfo"), "cpu MHz");
                if (value != null) {
                    try {
                        double mhz = Double.parseDouble(value);
                        if (mhz > 0)
                            return formatFrequencyMhz(mhz);
                    } catch (NumberFormatException ignored) {
                    }
                }
            }

            String cached = cachedCpuFrequency;
            if (cached == null) {
                cached = probeCpuFrequency();
                cachedCpuFrequency = cached;
            }
            return cached;
        }

        private static @Nullable String probeCpuFrequency() {
            switch (OperatingSystem.CURRENT_OS) {
                case WINDOWS -> {
                    try {
                        String output = SystemUtils.run("wmic", "cpu", "get", "CurrentClockSpeed");
                        Matcher matcher = Pattern.compile("\\b(\\d+)\\b").matcher(output);
                        if (matcher.find())
                            return formatFrequencyMhz(Integer.parseInt(matcher.group(1)));
                    } catch (Throwable ignored) {
                    }
                }
                case MACOS -> {
                    try {
                        String output = SystemUtils.run("sysctl", "-n", "hw.cpufrequency");
                        long hz = Long.parseLong(output.trim());
                        if (hz > 0)
                            return formatFrequencyMhz(hz / 1_000_000.0);
                    } catch (Throwable ignored) {
                    }
                }
                default -> {
                }
            }
            return i18n("status.unknown");
        }

        private static String formatFrequencyMhz(double mhz) {
            if (mhz >= 1000)
                return String.format(Locale.ROOT, "%.2f GHz", mhz / 1000);
            return String.format(Locale.ROOT, "%.0f MHz", mhz);
        }

        private static String getLauncherUsage() {
            Runtime runtime = Runtime.getRuntime();
            long used = runtime.totalMemory() - runtime.freeMemory();
            long committed = runtime.totalMemory();
            long max = runtime.maxMemory();
            return i18n("status.launcher.usage.value",
                    DataSizeUnit.format(used), DataSizeUnit.format(committed), DataSizeUnit.format(max));
        }

        private static Path getGameDirectoryPath() {
            try {
                var gameDirectory = GameDirectoryManager.getSelectedGameDirectory();
                if (gameDirectory != null) {
                    Path path = gameDirectory.getPath().toPath();
                    return path.isAbsolute() ? path.normalize() : path.toAbsolutePath().normalize();
                }
            } catch (Throwable ignored) {
            }
            return Paths.get(System.getProperty("user.dir"));
        }

        private static long[] getDiskSpace() {
            try {
                Path root = getGameDirectoryPath().getRoot();
                if (root == null)
                    root = Paths.get(System.getProperty("user.home")).toAbsolutePath().getRoot();
                FileStore store = Files.getFileStore(root);
                return new long[]{store.getTotalSpace(), store.getUsableSpace()};
            } catch (IOException e) {
                return new long[]{-1, -1};
            }
        }

        private long getGameSpace(long now) {
            if (gameSize < 0 || now - lastGameSizeCheck >= GAME_SIZE_INTERVAL_MILLIS) {
                lastGameSizeCheck = now;
                gameSize = walkDirectorySize(getGameDirectoryPath());
            }
            return gameSize;
        }

        private static long walkDirectorySize(Path directory) {
            if (!Files.isDirectory(directory))
                return 0;

            long[] size = {0};
            try {
                Files.walkFileTree(directory, new SimpleFileVisitor<>() {
                    @Override
                    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                        if (Thread.interrupted())
                            return FileVisitResult.TERMINATE;
                        size[0] += attrs.size();
                        return FileVisitResult.CONTINUE;
                    }

                    @Override
                    public FileVisitResult visitFileFailed(Path file, IOException exc) {
                        return FileVisitResult.CONTINUE;
                    }
                });
                return size[0];
            } catch (IOException e) {
                return -1;
            }
        }

        private void probeVram() {
            vramUsed = -1;
            vramTotal = -1;
            try {
                Path nvidiaSmi = SystemUtils.which(OperatingSystem.CURRENT_OS == OperatingSystem.WINDOWS ? "nvidia-smi.exe" : "nvidia-smi");
                if (nvidiaSmi != null) {
                    String output = SystemUtils.run(nvidiaSmi.toString(),
                            "--query-gpu=memory.used,memory.total", "--format=csv,noheader,nounits");
                    Matcher matcher = Pattern.compile("(\\d+)\\s*,\\s*(\\d+)").matcher(output);
                    if (matcher.find()) {
                        vramUsed = Long.parseLong(matcher.group(1)) * 1024 * 1024;
                        vramTotal = Long.parseLong(matcher.group(2)) * 1024 * 1024;
                    }
                }
            } catch (Throwable ignored) {
            }
        }

        private String getPowerStatus(long now) {
            if (powerStatus == null || now - lastPowerCheck >= SLOW_PROBE_INTERVAL_MILLIS) {
                lastPowerCheck = now;
                probePowerStatus();
            }
            return powerStatus;
        }

        private void probePowerStatus() {
            switch (OperatingSystem.CURRENT_OS) {
                case LINUX -> probeLinuxPowerStatus();
                case WINDOWS -> probeWindowsPowerStatus();
                case MACOS -> probeMacOSPowerStatus();
                default -> {
                    powerStatus = i18n("status.unknown");
                    powerState = 0;
                }
            }
        }

        private void probeLinuxPowerStatus() {
            Path supplyDirectory = Paths.get("/sys/class/power_supply");
            if (!Files.isDirectory(supplyDirectory)) {
                powerStatus = i18n("status.unknown");
                powerState = 0;
                return;
            }

            String batteryState = null;
            String batteryCapacity = null;
            boolean mainsOnline = false;

            try (var stream = Files.list(supplyDirectory)) {
                List<Path> devices = stream.toList();
                for (Path device : devices) {
                    String type = readFirstLine(device.resolve("type"));
                    if ("Battery".equals(type)) {
                        if (batteryState == null)
                            batteryState = readFirstLine(device.resolve("status"));
                        if (batteryCapacity == null)
                            batteryCapacity = readFirstLine(device.resolve("capacity"));
                    } else if ("Mains".equals(type) && "1".equals(readFirstLine(device.resolve("online")))) {
                        mainsOnline = true;
                    }
                }
            } catch (IOException ignored) {
            }

            if (batteryState == null) {
                powerStatus = mainsOnline ? i18n("status.power.ac") : i18n("status.unknown");
                powerState = mainsOnline ? 1 : 0;
                return;
            }

            int percent = -1;
            if (batteryCapacity != null) {
                try {
                    percent = Integer.parseInt(batteryCapacity);
                } catch (NumberFormatException ignored) {
                }
            }

            switch (batteryState) {
                case "Charging" -> {
                    powerStatus = percent >= 0 ? i18n("status.power.charging.value", percent) : i18n("status.power.charging");
                    powerState = 1;
                }
                case "Discharging" -> {
                    powerStatus = percent >= 0 ? i18n("status.power.discharging.value", percent) : i18n("status.power.discharging");
                    powerState = 2;
                }
                case "Full" -> {
                    powerStatus = percent >= 0 ? i18n("status.power.full.value", percent) : i18n("status.power.full");
                    powerState = 1;
                }
                case "Not charging" -> {
                    powerStatus = i18n("status.power.not_charging");
                    powerState = 2;
                }
                default -> {
                    powerStatus = percent >= 0 ? i18n("status.power.battery.value", percent) : i18n("status.power.battery");
                    powerState = 0;
                }
            }
        }

        private void probeWindowsPowerStatus() {
            powerStatus = i18n("status.unknown");
            powerState = 0;
            try {
                String output = SystemUtils.run("wmic", "path", "Win32_Battery", "get", "BatteryStatus,EstimatedChargeRemaining");
                Matcher matcher = Pattern.compile("(\\d+)\\s+(\\d+)").matcher(output);
                if (matcher.find()) {
                    int batteryStatus = Integer.parseInt(matcher.group(1));
                    int percent = Integer.parseInt(matcher.group(2));
                    switch (batteryStatus) {
                        case 1 -> {
                            powerStatus = i18n("status.power.discharging.value", percent);
                            powerState = 2;
                        }
                        case 2 -> {
                            powerStatus = i18n("status.power.charging.value", percent);
                            powerState = 1;
                        }
                        case 3 -> {
                            powerStatus = i18n("status.power.full.value", percent);
                            powerState = 1;
                        }
                        default -> {
                            powerStatus = i18n("status.power.battery.value", percent);
                            powerState = 0;
                        }
                    }
                    return;
                }
                // No battery found (e.g. a desktop), assume AC power.
                powerStatus = i18n("status.power.ac");
                powerState = 1;
            } catch (Throwable ignored) {
            }
        }

        private void probeMacOSPowerStatus() {
            powerStatus = i18n("status.unknown");
            powerState = 0;
            try {
                String output = SystemUtils.run("pmset", "-g", "batt");
                int percent = -1;
                Matcher percentMatcher = Pattern.compile("(\\d+)%").matcher(output);
                if (percentMatcher.find()) {
                    try {
                        percent = Integer.parseInt(percentMatcher.group(1));
                    } catch (NumberFormatException ignored) {
                    }
                }

                if (output.contains("AC Power")) {
                    if (output.contains("charged")) {
                        powerStatus = percent >= 0 ? i18n("status.power.full.value", percent) : i18n("status.power.full");
                        powerState = 1;
                    } else if (output.contains("charging")) {
                        powerStatus = percent >= 0 ? i18n("status.power.charging.value", percent) : i18n("status.power.charging");
                        powerState = 1;
                    } else {
                        powerStatus = i18n("status.power.ac");
                        powerState = 1;
                    }
                } else if (output.contains("Battery Power")) {
                    powerStatus = percent >= 0 ? i18n("status.power.discharging.value", percent) : i18n("status.power.discharging");
                    powerState = 2;
                }
            } catch (Throwable ignored) {
            }
        }

        private String getNetworkStatus(long now) {
            if (networkStatus == null || now - lastNetworkCheck >= SLOW_PROBE_INTERVAL_MILLIS) {
                lastNetworkCheck = now;
                probeNetworkStatus();
            }
            return networkStatus;
        }

        private void probeNetworkStatus() {
            if (!isLocalNetworkUp()) {
                networkStatus = i18n("status.network.offline");
                networkState = 3;
            } else if (isInternetReachable()) {
                networkStatus = i18n("status.network.online");
                networkState = 1;
            } else {
                networkStatus = i18n("status.network.local");
                networkState = 2;
            }
        }

        private static boolean isLocalNetworkUp() {
            try {
                Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
                while (interfaces.hasMoreElements()) {
                    NetworkInterface networkInterface = interfaces.nextElement();
                    if (!networkInterface.isUp() || networkInterface.isLoopback())
                        continue;
                    Enumeration<java.net.InetAddress> addresses = networkInterface.getInetAddresses();
                    while (addresses.hasMoreElements()) {
                        if (!addresses.nextElement().isLoopbackAddress())
                            return true;
                    }
                }
            } catch (SocketException ignored) {
            }
            return false;
        }

        private static boolean isInternetReachable() {
            URI uri = getProbeUri();
            if (uri == null || uri.getHost() == null)
                return false;

            int port = uri.getPort() > 0 ? uri.getPort() : ("https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80);
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(uri.getHost(), port), 2000);
                return true;
            } catch (IOException e) {
                return false;
            }
        }

        private static @Nullable URI getProbeUri() {
            try {
                List<URI> urls = DownloadProviders.getDownloadProvider().getVersionListURLs();
                if (urls != null && !urls.isEmpty())
                    return urls.get(0);
            } catch (Throwable ignored) {
            }
            return null;
        }

        private static @Nullable String readFirstLine(Path path) {
            try (BufferedReader reader = Files.newBufferedReader(path)) {
                return reader.readLine();
            } catch (IOException e) {
                return null;
            }
        }

        private static @Nullable String readValueOf(Path path, String key) {
            try (BufferedReader reader = Files.newBufferedReader(path)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith(key)) {
                        int idx = line.indexOf(':');
                        if (idx >= 0)
                            return line.substring(idx + 1).trim();
                    }
                }
            } catch (IOException ignored) {
            }
            return null;
        }
    }
}

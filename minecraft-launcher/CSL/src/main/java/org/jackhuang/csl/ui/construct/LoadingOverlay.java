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

import javafx.animation.AnimationTimer;
import javafx.geometry.Pos;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;

/// A loading overlay that shows a row of rounded squares performing a
/// "lift-shift-drop" animation: the leftmost block rises, moves right
/// over the row, then drops down at the rightmost position while the
/// remaining blocks shift left. Each block has a fixed color.
///
/// Uses a single {@link AnimationTimer} for all blocks instead of
/// multiple {@code Timeline} objects to reduce CPU overhead.
public final class LoadingOverlay extends StackPane {

    private static final double BLOCK_SIZE = 14;
    private static final double BLOCK_RADIUS = 7;
    private static final double BLOCK_SPACING = 9;
    private static final int BLOCK_COUNT = 5;

    // Fixed colors for each block
    private static final Color[] BLOCK_COLORS = {
        Color.rgb(159, 234, 126, 0.6),  // light green
        Color.rgb(113, 188, 20, 0.6),   // mid green
        Color.rgb(76, 159, 11, 0.6),    // dark green
        Color.rgb(45, 121, 6, 0.6),     // deep green
        Color.rgb(36, 99, 5, 0.6),      // darkest green
    };

    private AnimationTimer timer;

    public LoadingOverlay() {
        getStyleClass().add("loading-overlay");
        setMouseTransparent(false);
        setPickOnBounds(true);

        double step = BLOCK_SIZE + BLOCK_SPACING;
        double totalWidth = BLOCK_COUNT * BLOCK_SIZE + (BLOCK_COUNT - 1) * BLOCK_SPACING;
        double totalHeight = BLOCK_SIZE * 2 + BLOCK_SPACING; // room for the lifted block above

        Pane blockPane = new Pane();
        blockPane.setPrefSize(totalWidth, totalHeight);
        blockPane.setMaxSize(totalWidth, totalHeight);

        Rectangle[] blocks = new Rectangle[BLOCK_COUNT];
        for (int i = 0; i < BLOCK_COUNT; i++) {
            Rectangle rect = new Rectangle(BLOCK_SIZE, BLOCK_SIZE);
            rect.getStyleClass().add("loading-block");
            rect.setArcWidth(BLOCK_RADIUS);
            rect.setArcHeight(BLOCK_RADIUS);
            rect.setFill(BLOCK_COLORS[i]);
            rect.setX(i * step);
            rect.setY(BLOCK_SIZE + BLOCK_SPACING); // bottom row
            blocks[i] = rect;
            blockPane.getChildren().add(rect);
        }

        // Single AnimationTimer drives all blocks — much cheaper than 5 Timelines
        double cycleMs = 1200;
        double phaseMs = cycleMs / 3;
        double maxTranslateX = (BLOCK_COUNT - 1) * step;
        double liftDistance = -(BLOCK_SIZE + BLOCK_SPACING);

        timer = new AnimationTimer() {
            private long startNanos = -1;

            @Override
            public void handle(long now) {
                if (startNanos < 0) startNanos = now;
                double elapsedMs = (now - startNanos) / 1_000_000.0;

                for (int i = 0; i < BLOCK_COUNT; i++) {
                    // Each block's cycle is offset by i * cycleMs
                    double t = ((elapsedMs - i * cycleMs) % cycleMs + cycleMs) % cycleMs;

                    double ty, tx;
                    if (t < phaseMs) {
                        // Phase 1: rise up (ease-out)
                        double p = t / phaseMs;
                        double ep = 1 - (1 - p) * (1 - p); // ease-out quad
                        ty = liftDistance * ep;
                        tx = 0;
                    } else if (t < 2 * phaseMs) {
                        // Phase 2: slide right (ease-in-out)
                        double p = (t - phaseMs) / phaseMs;
                        double ep = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // ease-in-out quad
                        ty = liftDistance;
                        tx = maxTranslateX * ep;
                    } else {
                        // Phase 3: drop down (ease-in)
                        double p = (t - 2 * phaseMs) / phaseMs;
                        double ep = p * p; // ease-in quad
                        ty = liftDistance * (1 - ep);
                        tx = maxTranslateX;
                    }

                    blocks[i].setTranslateY(ty);
                    blocks[i].setTranslateX(tx);
                    double pulse = 1 + 0.16 * Math.sin(Math.PI * Math.min(1, t / phaseMs));
                    blocks[i].setScaleX(pulse);
                    blocks[i].setScaleY(pulse);
                    blocks[i].setOpacity(0.64 + 0.28 * Math.min(1, pulse - 1) / 0.16);
                }
            }
        };
        timer.start();

        StackPane wrapper = new StackPane(blockPane);
        wrapper.setAlignment(Pos.CENTER);
        getChildren().add(wrapper);
    }

    /** Stops the animation timer. Call when the overlay is removed. */
    public void stop() {
        if (timer != null) {
            timer.stop();
            timer = null;
        }
    }
}
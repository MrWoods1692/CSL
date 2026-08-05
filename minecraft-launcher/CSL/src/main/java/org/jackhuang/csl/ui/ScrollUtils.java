// Copy from https://github.com/palexdev/MaterialFX/blob/c8038ce2090f5cddf923a19d79cc601db86a4d17/materialfx/src/main/java/io/github/palexdev/materialfx/utils/ScrollUtils.java

/*
 * Copyright (C) 2022 Parisi Alessandro
 * This file is part of MaterialFX (https://github.com/palexdev/MaterialFX).
 *
 * MaterialFX is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MaterialFX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with MaterialFX.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.jackhuang.csl.ui;

import javafx.scene.control.ScrollPane;
import javafx.scene.control.skin.VirtualFlow;
import javafx.scene.input.ScrollEvent;

/**
 * Utility class for ScrollPanes.
 */
final class ScrollUtils {

    public enum ScrollDirection {
        UP(-1), RIGHT(-1), DOWN(1), LEFT(1);

        final int intDirection;

        ScrollDirection(int intDirection) {
            this.intDirection = intDirection;
        }

        public int intDirection() {
            return intDirection;
        }
    }

    private static final double DEFAULT_SPEED = 0.5;
    private static final double DEFAULT_TRACK_PAD_ADJUSTMENT = 1.0;

    private static final double CUTOFF_DELTA = 0.01;

    /**
     * Determines if the given ScrollEvent comes from a trackpad.
     * <p></p>
     * Although this method works in most cases, it is not very accurate.
     * Since in JavaFX there's no way to tell if a ScrollEvent comes from a trackpad or a mouse
     * we use this trick: I noticed that a mouse scroll has a delta of 32 (don't know if it changes depending on the device or OS)
     * and trackpad scrolls have a way smaller delta. So depending on the scroll direction we check if the delta is lesser than 10
     * (trackpad event) or greater(mouse event).
     *
     * @see ScrollEvent#getDeltaX()
     * @see ScrollEvent#getDeltaY()
     */
    public static boolean isTrackPad(ScrollEvent event, ScrollDirection scrollDirection) {
        return switch (scrollDirection) {
            case UP, DOWN -> Math.abs(event.getDeltaY()) < 10;
            case LEFT, RIGHT -> Math.abs(event.getDeltaX()) < 10;
        };
    }

    /**
     * Determines the scroll direction of the given ScrollEvent.
     * <p></p>
     * Although this method works fine, it is not very accurate.
     * In JavaFX there's no concept of scroll direction, if you try to scroll with a trackpad
     * you'll notice that you can scroll in both directions at the same time, both deltaX and deltaY won't be 0.
     * <p></p>
     * For this method to work we assume that this behavior is not possible.
     * <p></p>
     * If deltaY is 0 we return LEFT or RIGHT depending on deltaX (respectively if lesser or greater than 0).
     * <p>
     * Else we return DOWN or UP depending on deltaY (respectively if lesser or greater than 0).
     *
     * @see ScrollEvent#getDeltaX()
     * @see ScrollEvent#getDeltaY()
     */
    public static ScrollDirection determineScrollDirection(ScrollEvent event) {
        double deltaX = event.getDeltaX();
        double deltaY = event.getDeltaY();

        if (deltaY == 0.0) {
            return deltaX < 0 ? ScrollDirection.LEFT : ScrollDirection.RIGHT;
        } else {
            return deltaY < 0 ? ScrollDirection.DOWN : ScrollDirection.UP;
        }
    }

    //================================================================================
    // ScrollPanes
    //================================================================================

    /**
     * Adds a smooth scrolling effect to the given scroll pane,
     * calls {@link #addSmoothScrolling(ScrollPane, double)} with a
     * default speed value of 1.
     */
    public static void addSmoothScrolling(ScrollPane scrollPane) {
        addSmoothScrolling(scrollPane, DEFAULT_SPEED);
    }

    /**
     * Adds a smooth scrolling effect to the given scroll pane with the given scroll speed.
     * Calls {@link #addSmoothScrolling(ScrollPane, double, double)}
     * with a default trackPadAdjustment of 7.
     */
    public static void addSmoothScrolling(ScrollPane scrollPane, double speed) {
        addSmoothScrolling(scrollPane, speed, DEFAULT_TRACK_PAD_ADJUSTMENT);
    }

    /**
     * Adds a smooth scrolling effect to the given scroll pane with the given
     * scroll speed and the given trackPadAdjustment.
     * <p></p>
     * The trackPadAdjustment is a value used to slow down the scrolling if a trackpad is used.
     * This is kind of a workaround and it's not perfect, but at least it's way better than before.
     * The default value is 7, tested up to 10, further values can cause scrolling misbehavior.
     */
    public static void addSmoothScrolling(ScrollPane scrollPane, double speed, double trackPadAdjustment) {
        smoothScroll(scrollPane, speed, trackPadAdjustment);
    }

    /// @author Glavo
    public static void addSmoothScrolling(VirtualFlow<?> virtualFlow) {
        addSmoothScrolling(virtualFlow, DEFAULT_SPEED);
    }

    /// @author Glavo
    public static void addSmoothScrolling(VirtualFlow<?> virtualFlow, double speed) {
        addSmoothScrolling(virtualFlow, speed, DEFAULT_TRACK_PAD_ADJUSTMENT);
    }

    /// @author Glavo
    public static void addSmoothScrolling(VirtualFlow<?> virtualFlow, double speed, double trackPadAdjustment) {
        smoothScroll(virtualFlow, speed, trackPadAdjustment);
    }

    private static void smoothScroll(ScrollPane scrollPane, double speed, double trackPadAdjustment) {
        scrollPane.addEventFilter(ScrollEvent.SCROLL, event -> {
            ScrollDirection direction = determineScrollDirection(event);
            double delta = isTrackPad(event, direction) ? speed / trackPadAdjustment : speed;
            switch (direction) {
                case LEFT, RIGHT -> {
                    double width = scrollPane.getContent().getLayoutBounds().getWidth();
                    if (width > 0) {
                        scrollPane.setHvalue(Math.min(Math.max(scrollPane.getHvalue() + direction.intDirection * delta / width, 0), 1));
                    }
                }
                case UP, DOWN -> {
                    double height = scrollPane.getContent().getLayoutBounds().getHeight();
                    if (height > 0) {
                        scrollPane.setVvalue(Math.min(Math.max(scrollPane.getVvalue() + direction.intDirection * delta / height, 0), 1));
                    }
                }
            }
            event.consume();
        });
    }

    private static void smoothScroll(VirtualFlow<?> virtualFlow, double speed, double trackPadAdjustment) {
        if (!virtualFlow.isVertical()) {
            return;
        }
        virtualFlow.addEventFilter(ScrollEvent.SCROLL, event -> {
            ScrollDirection direction = determineScrollDirection(event);
            if (direction == ScrollDirection.LEFT || direction == ScrollDirection.RIGHT) {
                return;
            }
            double delta = isTrackPad(event, direction) ? speed / trackPadAdjustment : speed;
            virtualFlow.scrollPixels(direction.intDirection * delta);
            event.consume();
        });
    }

    private ScrollUtils() {
    }
}

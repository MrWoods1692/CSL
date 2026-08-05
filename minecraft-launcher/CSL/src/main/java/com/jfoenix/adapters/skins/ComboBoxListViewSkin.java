package com.jfoenix.adapters.skins;

import javafx.scene.Node;
import javafx.scene.layout.Region;

import java.lang.reflect.Field;

/**
 * Override of JFoenix's ComboBoxListViewSkin to fix arrowButton access on JavaFX 21+.
 * The arrowButton field is in ComboBoxBaseSkin (superclass of ComboBoxListViewSkin),
 * not in ComboBoxListViewSkin itself. The original JFoenix used getDeclaredField
 * which doesn't search superclasses, causing NoSuchFieldException on JavaFX 21.
 */
public class ComboBoxListViewSkin<T> extends javafx.scene.control.skin.ComboBoxListViewSkin<T> {

    public ComboBoxListViewSkin(javafx.scene.control.ComboBox<T> comboBox) {
        super(comboBox);
    }

    /**
     * Returns the arrow button node for this skin.
     * Casts to StackPane for compatibility with JFoenix code that calls setBackground on it.
     */
    public Region getArrowButton() {
        return (Region) getArrowButton(this);
    }

    /**
     * Public static method called by JFoenix to obtain the arrow button.
     * We override the broken version from the JFoenix JAR.
     */
    public static Node getArrowButton(javafx.scene.control.skin.ComboBoxListViewSkin<?> skin) {
        // Search the class hierarchy for arrowButton field (declared in ComboBoxBaseSkin in JavaFX 21+)
        try {
            Field field = null;
            Class<?> clazz = skin.getClass();
            while (clazz != null) {
                try {
                    field = clazz.getDeclaredField("arrowButton");
                    break;
                } catch (NoSuchFieldException e) {
                    clazz = clazz.getSuperclass();
                }
            }
            if (field == null) {
                throw new NoSuchFieldException("arrowButton not found in class hierarchy of " + skin.getClass().getName());
            }
            field.setAccessible(true);
            return (Node) field.get(skin);
        } catch (Exception e) {
            throw new IllegalAccessError("Cannot access arrowButton, this should not happen. " + e.getMessage());
        }
    }
}
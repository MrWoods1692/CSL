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
package org.jackhuang.csl.ui.main;

import javafx.scene.control.ScrollPane;
import javafx.scene.control.Label;
import javafx.geometry.Pos;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import org.jackhuang.csl.Metadata;
import org.jackhuang.csl.theme.Themes;
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.ui.WeakListenerHolder;
import org.jackhuang.csl.ui.construct.ComponentList;
import org.jackhuang.csl.ui.construct.LineButton;
import org.jackhuang.csl.ui.construct.SpinnerPane;

import static org.jackhuang.csl.util.i18n.I18n.i18n;

/// Displays community chat and issue-reporting channels.
public class FeedbackPage extends SpinnerPane {

    private final WeakListenerHolder holder = new WeakListenerHolder();

    /// Creates the feedback channels page.
    public FeedbackPage() {
        VBox content = new VBox();
        content.getStyleClass().add("spinner-pane-content");
        content.getStyleClass().add("feedback-page-content");
        ScrollPane scrollPane = new ScrollPane(content);
        scrollPane.setFitToWidth(true);
        FXUtils.smoothScrolling(scrollPane);
        setContent(scrollPane);

        HBox hero = new HBox(18);
        hero.getStyleClass().add("feedback-hero");
        hero.setAlignment(Pos.CENTER_LEFT);
        var heroIcon = FXUtils.newBuiltinImage("/assets/img/icon.png", 58, 58, true, true);
        var heroImage = new javafx.scene.image.ImageView(heroIcon);
        heroImage.setMouseTransparent(true);
        Label heroTitle = new Label(i18n("contact"));
        heroTitle.getStyleClass().add("feedback-hero-title");
        Label heroSubtitle = new Label(i18n("contact.feedback.github.statement"));
        heroSubtitle.getStyleClass().add("feedback-hero-subtitle");
        VBox heroText = new VBox(5, heroTitle, heroSubtitle);
        heroText.setAlignment(Pos.CENTER_LEFT);
        hero.getChildren().setAll(heroImage, heroText);

        ComponentList groups = new ComponentList();
        {
            var users = LineButton.createExternalLinkButton(Metadata.GROUPS_URL);
            users.setLargeTitle(true);
            users.setLeading(FXUtils.newBuiltinImage("/assets/img/icon.png"), 36);
            users.setTitle(i18n("contact.chat.qq_group"));
            users.setSubtitle(i18n("contact.chat.qq_group.statement"));

            var discord = LineButton.createExternalLinkButton("https://discord.gg/jVvC7HfM6U");
            discord.setLargeTitle(true);
            discord.setLeading(FXUtils.newBuiltinImage("/assets/img/discord.png"), 36);
            discord.setTitle(i18n("contact.chat.discord"));
            discord.setSubtitle(i18n("contact.chat.discord.statement"));

            groups.getContent().setAll(users, discord);
        }

        ComponentList feedback = new ComponentList();
        {
            var github = LineButton.createExternalLinkButton("https://github.com/MrWoods1692/CSL/issues/new/choose");
            github.setLargeTitle(true);
            github.setTitle(i18n("contact.feedback.github"));
            github.setSubtitle(i18n("contact.feedback.github.statement"));

            holder.add(FXUtils.onWeakChangeAndOperate(Themes.darkModeProperty(), darkMode -> {
                github.setLeading(darkMode
                        ? FXUtils.newBuiltinImage("/assets/img/github-white.png", 36, 36, true, true)
                        : FXUtils.newBuiltinImage("/assets/img/github.png", 36, 36, true, true));
            }));

            feedback.getContent().setAll(github);
        }

        content.getChildren().addAll(
            hero,
                ComponentList.createComponentListTitle(i18n("contact.chat")),
                groups,
                ComponentList.createComponentListTitle(i18n("contact.feedback")),
                feedback
        );
    }
}

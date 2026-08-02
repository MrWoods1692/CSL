/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2022  huangyuhui <huanghongxun2008@126.com> and contributors
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
import org.jackhuang.csl.ui.FXUtils;
import org.jackhuang.csl.ui.construct.ComponentList;
import org.jackhuang.csl.ui.construct.LineButton;
import org.jackhuang.csl.ui.construct.SpinnerPane;

import static org.jackhuang.csl.util.i18n.I18n.i18n;

public final class AboutPage extends SpinnerPane {

    public AboutPage() {
        VBox content = new VBox();
        content.getStyleClass().add("spinner-pane-content");
        content.getStyleClass().add("about-page-content");
        ScrollPane scrollPane = new ScrollPane(content);
        scrollPane.setFitToWidth(true);
        FXUtils.smoothScrolling(scrollPane);
        setContent(scrollPane);

        HBox hero = new HBox(22);
        hero.getStyleClass().add("about-hero");
        hero.setAlignment(Pos.CENTER_LEFT);

        var logo = FXUtils.newBuiltinImage("/assets/img/icon.png", 88, 88, true, true);
        var logoView = new javafx.scene.image.ImageView(logo);
        logoView.getStyleClass().add("about-logo");
        logoView.setMouseTransparent(true);

        Label name = new Label(Metadata.FULL_NAME);
        name.getStyleClass().add("about-name");
        Label tagline = new Label(i18n("about"));
        tagline.getStyleClass().add("about-tagline");
        Label version = new Label(Metadata.NAME + "  ·  " + Metadata.VERSION);
        version.getStyleClass().add("about-version");

        VBox heroText = new VBox(7, tagline, name, version);
        heroText.setAlignment(Pos.CENTER_LEFT);
        hero.getChildren().setAll(logoView, heroText);

        ComponentList about = new ComponentList();
        about.getStyleClass().add("about-info-list");
        {
            var launcher = LineButton.createExternalLinkButton("https://csl.mrcwoods.com");
            launcher.setLargeTitle(true);
            launcher.setLeading(FXUtils.newBuiltinImage("/assets/img/icon.png"), 36);
            launcher.setTitle(Metadata.FULL_NAME);
            launcher.setSubtitle(Metadata.VERSION);

            var author = LineButton.createExternalLinkButton("https://github.com/MrWoods1692/");
            author.setLargeTitle(true);
            author.setLeading(FXUtils.newBuiltinImage("/assets/img/yellow_fish.png"));
            author.setTitle("Mr.C.Woods");
            author.setSubtitle(i18n("about.author.statement"));

            about.getContent().setAll(launcher, author);
        }

        ComponentList legal = new ComponentList();
        legal.getStyleClass().add("about-info-list");
        {
            var copyright = new LineButton();
            copyright.setLargeTitle(true);
            copyright.setTitle(i18n("about.copyright"));
            copyright.setSubtitle(i18n("about.copyright.statement"));

            var claim = LineButton.createExternalLinkButton(Metadata.EULA_URL);
            claim.setLargeTitle(true);
            claim.setTitle(i18n("about.claim"));
            claim.setSubtitle(i18n("about.claim.statement"));

            var openSource = LineButton.createExternalLinkButton("https://github.com/MrWoods1692/CSL/blob/main/LICENSE");
            openSource.setLargeTitle(true);
            openSource.setTitle(i18n("about.open_source"));
            openSource.setSubtitle(i18n("about.open_source.statement"));

            legal.getContent().setAll(copyright, claim, openSource);
        }

        var aboutTitle = ComponentList.createComponentListTitle(i18n("about"));
        aboutTitle.getStyleClass().add("about-section-title");
        var legalTitle = ComponentList.createComponentListTitle(i18n("about.legal"));
        legalTitle.getStyleClass().add("about-section-title");

        content.getChildren().setAll(
            hero,
            aboutTitle,
                about,
            legalTitle,
                legal
        );
    }
}

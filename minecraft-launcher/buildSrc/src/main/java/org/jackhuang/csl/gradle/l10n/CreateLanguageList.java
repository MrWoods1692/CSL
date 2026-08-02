/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2025 huangyuhui <huanghongxun2008@126.com> and contributors
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
package org.jackhuang.csl.gradle.l10n;

import org.gradle.api.DefaultTask;
import org.gradle.api.GradleException;
import org.gradle.api.file.DirectoryProperty;
import org.gradle.api.file.RegularFileProperty;
import org.gradle.api.provider.ListProperty;
import org.gradle.api.provider.Property;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputDirectory;
import org.gradle.api.tasks.OutputFile;
import org.gradle.api.tasks.TaskAction;
import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

/// @author Glavo
/// 从资源包目录扫描语言文件并生成支持的语言列表的 Gradle 任务
/// @author Glavo
public abstract class CreateLanguageList extends DefaultTask {
    @InputDirectory
    public abstract DirectoryProperty getResourceBundleDir();  // 资源包目录

    @Input
    public abstract Property<@NotNull String> getResourceBundleBaseName();  // 资源包基础名称

    @Input
    public abstract ListProperty<@NotNull String> getAdditionalLanguages();  // 额外添加的语言

    @OutputFile
    public abstract RegularFileProperty getOutputFile();  // 输出 JSON 文件

    @TaskAction
    public void run() throws IOException {
        Path inputDir = getResourceBundleDir().get().getAsFile().toPath();  // 获取输入目录路径
        if (!Files.isDirectory(inputDir))  // 检查目录是否存在
            throw new GradleException("Input directory not exists: " + inputDir);


        SortedSet<Locale> locales = new TreeSet<>(LocalizationUtils::compareLocale);  // 使用自定义比较器排序
        locales.addAll(getAdditionalLanguages().getOrElse(List.of()).stream()  // 添加额外语言
                .map(Locale::forLanguageTag)  // 将语言标签转换为 Locale
                .toList());

        String baseName = getResourceBundleBaseName().get();  // 获取基础名称
        String suffix = ".properties";  // 属性文件后缀

        try (var stream = Files.newDirectoryStream(inputDir, file -> {  // 遍历目录中的属性文件
            String fileName = file.getFileName().toString();
            return fileName.startsWith(baseName) && fileName.endsWith(suffix);  // 匹配基础名称和后缀
        })) {
            for (Path file : stream) {  // 遍历匹配的文件
                String fileName = file.getFileName().toString();
                if (fileName.length() == baseName.length() + suffix.length())  // 无语言后缀 = 英文
                    locales.add(Locale.ENGLISH);
                else if (fileName.charAt(baseName.length()) == '_') {  // 有语言后缀
                    String localeName = fileName.substring(baseName.length() + 1, fileName.length() - suffix.length());  // 提取语言标记

                    // TODO: 如果 I18N 文件命名方式改变，删除此逻辑
                    if (baseName.equals("I18N")) {  // I18N 文件的特殊处理
                        if (localeName.equals("zh"))  // zh -> 繁体中文
                            locales.add(Locale.forLanguageTag("zh-Hant"));
                        else if (localeName.equals("zh_CN"))  // zh_CN -> 简体中文
                            locales.add(Locale.forLanguageTag("zh-Hans"));
                        else
                            locales.add(Locale.forLanguageTag(localeName.replace('_', '-')));  // 转换下划线为连字符
                    } else {
                        if (localeName.equals("zh"))  // zh -> 简体中文
                            locales.add(Locale.forLanguageTag("zh-Hans"));
                        else
                            locales.add(Locale.forLanguageTag(localeName.replace('_', '-')));  // 转换下划线为连字符
                    }
                }
            }
        }

        Path outputFile = getOutputFile().get().getAsFile().toPath();  // 获取输出文件路径
        Files.createDirectories(outputFile.getParent());  // 创建父目录
        Files.writeString(outputFile, locales.stream().map(locale -> '"' + locale.toLanguageTag() + '"')  // 格式化为 JSON 数组
                .collect(Collectors.joining(", ", "[", "]")));  // 连接为 JSON 数组字符串
    }

}

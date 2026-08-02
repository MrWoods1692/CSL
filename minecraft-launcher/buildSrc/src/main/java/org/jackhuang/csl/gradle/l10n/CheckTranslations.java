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
import org.gradle.api.file.RegularFileProperty;
import org.gradle.api.logging.Logger;
import org.gradle.api.logging.Logging;
import org.gradle.api.tasks.InputFile;
import org.gradle.api.tasks.TaskAction;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.function.BiConsumer;

/// @author Glavo
/// 检查翻译文件的完整性和拼写正确性的 Gradle 任务
/// @author Glavo
public abstract class CheckTranslations extends DefaultTask {

    private static final Logger LOGGER = Logging.getLogger(CheckTranslations.class);  // 日志记录器

    @InputFile
    public abstract RegularFileProperty getEnglishFile();  // 英文翻译文件

    @InputFile
    public abstract RegularFileProperty getSimplifiedChineseFile();  // 简体中文翻译文件

    @InputFile
    public abstract RegularFileProperty getTraditionalChineseFile();  // 繁体中文翻译文件

    @InputFile
    public abstract RegularFileProperty getClassicalChineseFile();  // 文言文翻译文件

    @TaskAction
    public void run() throws IOException {
        Checker checker = new Checker();  // 创建检查器实例

        // 加载各语言的属性文件
        var english = new PropertiesFile(getEnglishFile());
        var simplifiedChinese = new PropertiesFile(getSimplifiedChineseFile());
        var traditionalChinese = new PropertiesFile(getTraditionalChineseFile());
        var classicalChinese = new PropertiesFile(getClassicalChineseFile());

        // 检查简体中文翻译
        simplifiedChinese.forEach((key, value) -> {
            checker.checkKeyExists(english, key);  // 检查英文中是否存在对应键
            checker.checkKeyExists(traditionalChinese, key);  // 检查繁体中是否存在对应键

            checker.checkMisspelled(simplifiedChinese, key, value, "账户", "帐户");  // 检查"帐户"拼写错误
            checker.checkMisspelled(simplifiedChinese, key, value, "其他", "其它");  // 检查"其它"拼写错误

            checker.checkMisspelled(simplifiedChinese, key, value, "(", "（");  // 检查全角括号
            checker.checkMisspelled(simplifiedChinese, key, value, ")", "）");  // 检查全角括号
        });

        // 检查繁体中文翻译
        traditionalChinese.forEach((key, value) -> {
            checker.checkMisspelled(traditionalChinese, key, value, "(", "（");  // 检查全角括号
            checker.checkMisspelled(traditionalChinese, key, value, ")", "）");  // 检查全角括号
        });

        // 检查文言文翻译
        classicalChinese.forEach((key, value) -> {
            checker.checkMisspelled(classicalChinese, key, value, "綫", "線");  // 检查异体字
            checker.checkMisspelled(classicalChinese, key, value, "爲", "為");  // 检查异体字
            checker.checkMisspelled(classicalChinese, key, value, "啟", "啓");  // 检查异体字
        });

        checker.check();  // 执行最终检查，如有问题则抛出异常
    }

    // 属性文件包装类，封装 Properties 加载和遍历
    private static final class PropertiesFile {
        final Path path;  // 文件路径
        final Properties properties = new Properties();  // 加载的属性

        PropertiesFile(RegularFileProperty property) throws IOException {
            this(property.getAsFile().get().toPath().toAbsolutePath().normalize());  // 获取规范化路径
        }

        PropertiesFile(Path path) throws IOException {
            this.path = path;
            try (var reader = Files.newBufferedReader(path)) {  // 使用 UTF-8 读取
                properties.load(reader);  // 加载属性文件
            }
        }

        public String getFileName() {
            return path.getFileName().toString();  // 返回文件名
        }

        public void forEach(BiConsumer<String, String> consumer) {
            properties.forEach((key, value) -> consumer.accept(key.toString(), value.toString()));  // 遍历所有属性
        }
    }

    // 检查器类，负责收集和报告翻译问题
    private static final class Checker {

        private final Map<PropertiesFile, Map<Class<?>, Set<Problem>>> problems = new LinkedHashMap<>();  // 问题映射
        private int problemsCount;  // 问题计数

        // 检查键是否存在于指定文件中
        public void checkKeyExists(PropertiesFile file, String key) {
            if (!file.properties.containsKey(key)) {  // 如果键不存在
                onFailure(file, new Problem.MissingKey(key));  // 记录缺失键问题
            }
        }

        // 检查拼写错误
        public void checkMisspelled(PropertiesFile file, String key, String value,
                                    String correct, String misspelled) {
            if (value.contains(misspelled)) {  // 如果包含错误拼写
                onFailure(file, new Problem.Misspelled(correct, misspelled));  // 记录拼写问题
            }
        }

        // 记录问题
        public void onFailure(PropertiesFile file, Problem problem) {
            problemsCount++;  // 增加问题计数
            problems.computeIfAbsent(file, ignored -> new HashMap<>())  // 获取或创建文件的问题映射
                    .computeIfAbsent(problem.getClass(), ignored -> new LinkedHashSet<>())  // 获取或创建问题类型集合
                    .add(problem);  // 添加问题
        }

        // 执行最终检查，如有问题则抛出异常
        public void check() {
            if (problemsCount > 0) {  // 如果存在问题
                problems.forEach((file, problems) -> {  // 遍历所有文件的问题
                    problems.values().stream().flatMap(Collection::stream).forEach(problem ->  // 输出每个问题
                            LOGGER.warn("{}: {}", file.getFileName(), problem.getMessage()));
                });

                throw new GradleException("Failed to check translations, " + problemsCount + " found problems.");  // 抛出异常
            }
        }
    }

    // 问题基类，使用 sealed 限制子类
    private static abstract sealed class Problem {
        public abstract String getMessage();  // 获取问题描述

        // 缺失键问题
        private static final class MissingKey extends Problem {
            private final String key;  // 缺失的键名

            MissingKey(String key) {
                this.key = key;
            }

            @Override
            public String getMessage() {
                return "missing key '%s'".formatted(key);  // 格式化缺失键消息
            }
        }

        // 拼写错误问题
        private static final class Misspelled extends Problem {
            private final String correct;  // 正确拼写
            private final String misspelled;  // 错误拼写

            Misspelled(String correct, String misspelled) {
                this.correct = correct;
                this.misspelled = misspelled;
            }

            @Override
            public String getMessage() {
                return "misspelled '%s' should be replaced by '%s'".formatted(misspelled, correct);  // 格式化拼写错误消息
            }

            @Override
            public int hashCode() {
                return misspelled.hashCode();  // 基于错误拼写的哈希码
            }

            @Override
            public boolean equals(Object obj) {
                return obj instanceof Misspelled that && this.misspelled.equals(that.misspelled);  // 基于错误拼写判断相等
            }
        }

    }
}

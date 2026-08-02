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
package org.jackhuang.csl.gradle.docs;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/// @author Glavo
/// 表示一个文档文件，包含其目录、文件路径、名称、语言环境和内容项
/// @author Glavo
public record Document(DocumentFileTree directory,  // 文档所在的文件树
                       Path file,  // 文档文件路径
                       String name, DocumentLocale locale,  // 文档名称和语言环境
                       List<Item> items) {  // 文档内容项列表

    // 匹配宏开始标记的正则表达式
    private static final Pattern MACRO_BEGIN = Pattern.compile(
            "<!-- #BEGIN (?<name>\\w+) -->"
    );

    // 匹配宏属性行的正则表达式
    private static final Pattern MACRO_PROPERTY_LINE = Pattern.compile(
            "<!-- #PROPERTY (?<name>\\w+)=(?<value>.*) -->"
    );

    // 解析属性值中的转义字符
    private static String parsePropertyValue(String value) {
        int i = 0;
        while (i < value.length()) {  // 查找第一个转义字符
            char ch = value.charAt(i);
            if (ch == '\\')
                break;  // 找到反斜杠，需要处理转义
            i++;
        }

        if (i == value.length())  // 没有转义字符，直接返回
            return value;

        StringBuilder builder = new StringBuilder(value.length());  // 构建结果字符串
        builder.append(value, 0, i);  // 复制转义前的部分
        for (; i < value.length(); i++) {  // 处理转义字符
            char ch = value.charAt(i);
            if (ch == '\\' && i < value.length() - 1) {  // 转义序列
                char next = value.charAt(++i);  // 获取下一个字符
                switch (next) {
                    case 'n' -> builder.append('\n');  // 换行
                    case 'r' -> builder.append('\r');  // 回车
                    case '\\' -> builder.append('\\');  // 反斜杠
                    default -> builder.append(next);  // 其他字符原样输出
                }
            } else {
                builder.append(ch);  // 普通字符
            }
        }
        return builder.toString();  // 返回解析后的值
    }

    // 将属性值写入 StringBuilder，处理转义
    static void writePropertyValue(StringBuilder builder, String value) {
        for (int i = 0; i < value.length(); i++) {  // 遍历每个字符
            char ch = value.charAt(i);

            switch (ch) {
                case '\\' -> builder.append("\\\\");  // 转义反斜杠
                case '\r' -> builder.append("\\r");  // 转义回车
                case '\n' -> builder.append("\\n");  // 转义换行
                default -> builder.append(ch);  // 普通字符
            }
        }
    }

    // 从文件加载文档，解析宏和内容
    public static Document load(DocumentFileTree directory, Path file, String name, DocumentLocale locale) throws IOException {
        var items = new ArrayList<Item>();  // 内容项列表
        try (var reader = Files.newBufferedReader(file)) {  // 打开文件读取器
            String line;

            while ((line = reader.readLine()) != null) {  // 逐行读取
                if (!line.startsWith("<!-- #")) {  // 普通行
                    items.add(new Line(line));  // 添加为普通行
                } else {
                    Matcher matcher = MACRO_BEGIN.matcher(line);  // 匹配宏开始标记
                    if (!matcher.matches())  // 不是有效的宏开始标记
                        throw new IOException("Invalid macro begin line: " + line);

                    String macroName = matcher.group("name");  // 获取宏名称
                    String endLine = "<!-- #END " + macroName + " -->";  // 构造宏结束标记
                    var lines = new ArrayList<String>();  // 宏内容行列表
                    while (true) {
                        line = reader.readLine();  // 读取下一行

                        if (line == null)  // 文件结束但未找到宏结束标记
                            throw new IOException("Missing end line for macro: " + macroName);
                        else if (line.equals(endLine)) {  // 找到宏结束标记
                            break;
                        } else {
                            lines.add(line);  // 添加宏内容行
                        }
                    }

                    var properties = new LinkedHashMap<String, List<String>>();  // 宏属性映射
                    int propertiesCount = 0;  // 属性行计数

                    // 处理宏属性
                    for (String macroBodyLine : lines) {
                        if (!macroBodyLine.startsWith("<!-- #"))  // 不是属性行，结束属性解析
                            break;

                        Matcher propertyMatcher = MACRO_PROPERTY_LINE.matcher(macroBodyLine);  // 匹配属性行
                        if (propertyMatcher.matches()) {
                            String propertyName = propertyMatcher.group("name");  // 属性名
                            String propertyValue = parsePropertyValue(propertyMatcher.group("value"));  // 属性值

                            properties.computeIfAbsent(propertyName, k -> new ArrayList<>(1))  // 添加到属性映射
                                    .add(propertyValue);
                            propertiesCount++;  // 属性计数加一
                        } else {
                            throw new IOException("Invalid macro property line: " + macroBodyLine);  // 无效属性行
                        }
                    }

                    if (propertiesCount > 0)  // 移除已解析的属性行
                        lines.subList(0, propertiesCount).clear();

                    items.add(new MacroBlock(macroName,  // 添加宏块到内容列表
                            Collections.unmodifiableMap(properties),  // 不可修改的属性映射
                            Collections.unmodifiableList(lines)));  // 不可修改的内容行列表
                }
            }
        }
        return new Document(directory, file, name, locale, items);  // 返回文档对象
    }

    // 文档内容项的密封接口
    public sealed interface Item {
    }

    // 宏块记录：包含名称、属性和内容行
    public record MacroBlock(String name, Map<String, List<String>> properties,
                             List<String> contentLines) implements Item {
    }

    // 普通行记录：包含行内容
    public record Line(String content) implements Item {
    }
}

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

import org.gradle.api.GradleException;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

/// 本地化工具类，提供语言比较和子语言解析功能
final class LocalizationUtils {
    // 子语言到父语言的映射表，从 CSV 文件加载
    public static final Map<String, String> subLanguageToParent = loadCSV("sublanguages.csv");

    // 从 CSV 文件加载子语言映射
    private static Map<String, String> loadCSV(String fileName) {
        InputStream resource = LocalizationUtils.class.getResourceAsStream(fileName);  // 获取资源流
        if (resource == null) {  // 资源不存在
            throw new GradleException("Resource not found: " + fileName);
        }

        HashMap<String, String> result = new HashMap<>();  // 结果映射
        try (resource) {  // 自动关闭资源
            new String(resource.readAllBytes(), StandardCharsets.UTF_8).lines().forEach(line -> {  // 按行读取
                if (line.startsWith("#") || line.isBlank())  // 跳过注释和空行
                    return;

                String[] items = line.split(",");  // 按逗号分割
                if (items.length < 2) {  // 至少需要两个字段
                    throw new GradleException("Invalid line in sublanguages.csv: " + line);
                }

                String parent = items[0];  // 第一个字段是父语言
                for (int i = 1; i < items.length; i++) {  // 后续字段是子语言
                    result.put(items[i], parent);  // 建立子语言到父语言的映射
                }
            });
        } catch (RuntimeException | Error e) {  // 运行时异常直接抛出
            throw e;
        } catch (Throwable e) {  // 其他异常包装为 GradleException
            throw new GradleException("Failed to load " + fileName, e);
        }

        return Map.copyOf(result);  // 返回不可变映射
    }

    // 解析语言的继承链（从子语言到根语言）
    private static List<String> resolveLanguage(String language) {
        List<String> langList = new ArrayList<>();  // 语言链列表

        String lang = language;
        while (true) {  // 循环向上查找父语言
            langList.add(0, lang);  // 在列表头部插入

            String parent = subLanguageToParent.get(lang);  // 查找父语言
            if (parent != null) {  // 如果存在父语言
                lang = parent;  // 继续向上查找
            } else {
                return langList;  // 返回完整的语言链
            }
        }
    }

    // 比较两个语言代码
    public static int compareLanguage(String l1, String l2) {
        var list1 = resolveLanguage(l1);  // 解析语言1的继承链
        var list2 = resolveLanguage(l2);  // 解析语言2的继承链

        int n = Math.min(list1.size(), list2.size());  // 取较短链的长度
        for (int i = 0; i < n; i++) {  // 逐级比较
            int c = list1.get(i).compareTo(list2.get(i));  // 字符串比较
            if (c != 0)
                return c;  // 返回比较结果
        }

        return Integer.compare(list1.size(), list2.size());  // 链长度比较
    }

    // 比较文字系统
    public static int compareScript(String s1, String s2) {
        return s1.compareTo(s2);  // 字符串比较
    }

    // 比较两个 Locale 对象
    public static int compareLocale(Locale l1, Locale l2) {
        int c = compareLanguage(l1.getLanguage(), l2.getLanguage());  // 先比较语言
        if (c != 0)
            return c;

        c = compareScript(l1.getScript(), l2.getScript());  // 再比较脚本
        if (c != 0)
            return c;

        c = l1.getCountry().compareTo(l2.getCountry());  // 再比较国家/地区
        if (c != 0)
            return c;

        c = l1.getVariant().compareTo(l2.getVariant());  // 再比较变体
        if (c != 0)
            return c;

        return l1.toString().compareTo(l2.toLanguageTag());  // 最后比较字符串表示
    }

    private LocalizationUtils() {
    }
}

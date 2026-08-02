// 配置依赖解析管理
dependencyResolutionManagement {
    // 定义版本目录 (Version Catalog)，用于集中管理依赖版本
    versionCatalogs {
        create("libs") {  // 创建名为 "libs" 的版本目录
            from(files("../gradle/libs.versions.toml"))  // 从 TOML 文件加载版本定义
        }
    }
}

// 配置 Maven 仓库 - 优先使用环境变量 MAVEN_CENTRAL_REPO，否则使用 Maven Central
repositories {
    System.getenv("MAVEN_CENTRAL_REPO").let { repo ->  // 获取环境变量中的 Maven 仓库地址
        if (repo.isNullOrBlank())  // 如果环境变量为空或未设置
            mavenCentral()  // 使用默认的 Maven Central 仓库
        else
            maven(url = repo)  // 使用自定义的 Maven 仓库地址
    }
}

// 声明 buildSrc 自身的依赖
dependencies {
    implementation(libs.gson)  // Google Gson JSON 解析库
    implementation(libs.jna)  // Java Native Access 本地调用库
    implementation(libs.kala.compress.tar)  // Kala Compress TAR 压缩库
    implementation(libs.kala.compress.ar)  // Kala Compress AR 压缩库
}

// 配置 Java 编译版本
java {
    sourceCompatibility = JavaVersion.VERSION_17  // 源代码兼容 Java 17
    targetCompatibility = JavaVersion.VERSION_17  // 编译目标为 Java 17
}

// 配置所有 Java 编译任务的编码
tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"  // 设置源文件编码为 UTF-8
}

// 配置资源处理任务：将 CSLCore 的语言文件复制到 l10n 目录
tasks.processResources {
    into("org/jackhuang/csl/gradle/l10n") {  // 复制到 l10n 包目录
        from(projectDir.resolve("../CSLCore/src/main/resources/assets/lang/"))  // 从 CSLCore 的语言资源目录复制
    }
}

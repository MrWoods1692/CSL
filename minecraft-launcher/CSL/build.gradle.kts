import org.jackhuang.csl.gradle.TerracottaConfigUpgradeTask
import org.jackhuang.csl.gradle.ci.GitHubActionUtils
import org.jackhuang.csl.gradle.ci.JenkinsUtils
import org.jackhuang.csl.gradle.l10n.CheckTranslations
import org.jackhuang.csl.gradle.l10n.CreateLanguageList
import org.jackhuang.csl.gradle.l10n.CreateLocaleNamesResourceBundle
import org.jackhuang.csl.gradle.l10n.UpsideDownTranslate
import org.jackhuang.csl.gradle.mod.ParseModDataTask
import org.jackhuang.csl.gradle.pack.CreateDeb
import org.jackhuang.csl.gradle.pack.ReleaseType
import org.jackhuang.csl.gradle.utils.PropertiesUtils
import java.net.URI
import java.nio.file.FileSystems
import java.nio.file.Files
import java.security.KeyFactory
import java.security.MessageDigest
import java.security.Signature
import java.security.spec.PKCS8EncodedKeySpec
import java.util.zip.ZipFile

plugins {
    alias(libs.plugins.shadow)
}

val projectConfig = PropertiesUtils.load(rootProject.file("config/project.properties").toPath())

val isOfficial = JenkinsUtils.IS_ON_CI || GitHubActionUtils.IS_ON_OFFICIAL_REPO

val versionType = System.getenv("VERSION_TYPE") ?: if (isOfficial) "nightly" else "unofficial"
val versionRoot = System.getenv("VERSION_ROOT") ?: projectConfig.getProperty("versionRoot") ?: "3"

val microsoftAuthId = System.getenv("MICROSOFT_AUTH_ID") ?: ""
val curseForgeApiKey = System.getenv("CURSEFORGE_API_KEY") ?: ""

val launcherExe = System.getenv("CSL_LAUNCHER_EXE") ?: ""

val buildNumber = System.getenv("BUILD_NUMBER")?.toInt()
if (buildNumber != null) {
    version = if (JenkinsUtils.IS_ON_CI && versionType == "dev") {
        "$versionRoot.0.$buildNumber"
    } else {
        "$versionRoot.$buildNumber"
    }
} else {
    val shortCommit = System.getenv("GITHUB_SHA")?.lowercase()?.substring(0, 7)
    version = if (shortCommit.isNullOrBlank()) {
        "$versionRoot.SNAPSHOT"
    } else if (isOfficial) {
        "$versionRoot.dev-$shortCommit"
    } else {
        "$versionRoot.unofficial-$shortCommit"
    }
}

val embedResources = configurations.register("embedResources")

val bundledFrpArchives = listOf(
    "frp_0.70.1_darwin_amd64.tar.gz",
    "frp_0.70.1_freebsd_amd64.tar.gz",
    "frp_0.70.1_linux_amd64.tar.gz",
    "frp_0.70.1_linux_arm.tar.gz",
    "frp_0.70.1_linux_arm64.tar.gz",
    "frp_0.70.1_linux_loong64.tar.gz",
    "frp_0.70.1_linux_mips.tar.gz",
    "frp_0.70.1_windows_amd64.zip",
)

dependencies {
    implementation(project(":CSLCore"))
    implementation(project(":CSLBoot"))
    implementation("libs:JFoenix")
    implementation(libs.jwebp)
    implementation(libs.fxsvgimage)
    implementation(libs.java.info)
    implementation(libs.monet.fx)
    implementation(libs.nayuki.qrcodegen)
    implementation(libs.uuid.tools)

    testImplementation(libs.jimfs)

    if (launcherExe.isBlank()) {
        implementation(libs.cslauncher)
    }

    embedResources(libs.lwjgl.unsafe.agent)
}

fun digest(algorithm: String, bytes: ByteArray): ByteArray = MessageDigest.getInstance(algorithm).digest(bytes)

fun createChecksum(file: File) {
    val algorithms = linkedMapOf(
        "SHA-1" to "sha1",
        "SHA-256" to "sha256",
        "SHA-512" to "sha512"
    )

    algorithms.forEach { (algorithm, ext) ->
        File(file.parentFile, "${file.name}.$ext").writeText(
            digest(algorithm, file.readBytes()).joinToString(separator = "", postfix = "\n") { "%02x".format(it) }
        )
    }
}

fun attachSignature(jar: File) {
    val keyLocation = System.getenv("CSL_SIGNATURE_KEY")
    if (keyLocation == null) {
        logger.warn("Missing signature key")
        return
    }

    val privatekey = KeyFactory.getInstance("RSA").generatePrivate(PKCS8EncodedKeySpec(File(keyLocation).readBytes()))
    val signer = Signature.getInstance("SHA512withRSA")
    signer.initSign(privatekey)
    ZipFile(jar).use { zip ->
        zip.stream()
            .sorted(Comparator.comparing { it.name })
            .filter { it.name != "META-INF/csl_signature" }
            .forEach {
                signer.update(digest("SHA-512", it.name.toByteArray()))
                signer.update(digest("SHA-512", zip.getInputStream(it).readBytes()))
            }
    }
    val signature = signer.sign()
    FileSystems.newFileSystem(URI.create("jar:" + jar.toURI()), emptyMap<String, Any>()).use { zipfs ->
        Files.newOutputStream(zipfs.getPath("META-INF/csl_signature")).use { it.write(signature) }
    }
}

tasks.withType<JavaCompile> {
    sourceCompatibility = "17"
    targetCompatibility = "17"
}

tasks.checkstyleMain {
    // Third-party code is not checked
    exclude("**/org/jackhuang/csl/ui/image/apng/**")
}

val addOpens = listOf(
    "java.base/java.lang",
    "java.base/java.lang.reflect",
    "java.base/jdk.internal.loader",
    "javafx.base/com.sun.javafx.binding",
    "javafx.base/com.sun.javafx.event",
    "javafx.base/com.sun.javafx.runtime",
    "javafx.base/javafx.beans.property",
    "javafx.graphics/javafx.css",
    "javafx.graphics/javafx.stage",
    "javafx.graphics/javafx.scene",
    "javafx.graphics/com.sun.glass.ui",
    "javafx.graphics/com.sun.javafx.stage",
    "javafx.graphics/com.sun.javafx.util",
    "javafx.graphics/com.sun.prism",
    "javafx.controls/com.sun.javafx.scene.control",
    "javafx.controls/com.sun.javafx.scene.control.behavior",
    "javafx.graphics/com.sun.javafx.tk.quantum",
    "javafx.controls/javafx.scene.control.skin",
    "jdk.attach/sun.tools.attach",
)

tasks.compileJava {
    options.compilerArgs.addAll(addOpens.map { "--add-exports=$it=ALL-UNNAMED" })
}

tasks.processResources {
    into("assets/frp") {
        bundledFrpArchives.forEach { archive ->
            val source = rootProject.file("../$archive")
            if (!source.isFile) throw GradleException("Missing bundled FRP archive: $source")
            from(source)
        }
    }
}

val cslProperties = buildList {
    add("csl.version" to project.version.toString())
    add("csl.add-opens" to addOpens.joinToString(" "))
    System.getenv("GITHUB_SHA")?.let {
        add("csl.version.hash" to it)
    }
    add("csl.version.type" to versionType)
    add("csl.microsoft.auth.id" to microsoftAuthId)
    add("csl.curseforge.apikey" to curseForgeApiKey)
    add("csl.lwjgl-unsafe-agent.version" to libs.lwjgl.unsafe.agent.get().version!!)
}

val cslPropertiesFile = layout.buildDirectory.file("csl.properties")
val createPropertiesFile = tasks.register("createPropertiesFile") {
    outputs.file(cslPropertiesFile)
    cslProperties.forEach { (k, v) -> inputs.property(k, v) }

    doLast {
        val targetFile = cslPropertiesFile.get().asFile
        targetFile.parentFile.mkdir()
        targetFile.bufferedWriter().use {
            for ((k, v) in cslProperties) {
                it.write("$k=$v\n")
            }
        }
    }
}

tasks.jar {
    enabled = false
    dependsOn(tasks["shadowJar"])
}

val jarPath = tasks.jar.get().archiveFile.get().asFile

tasks.shadowJar {
    dependsOn(createPropertiesFile)

    archiveClassifier.set(null as String?)

    exclude("**/package-info.class")
    exclude("META-INF/maven/**")

    exclude("META-INF/services/javax.imageio.spi.ImageReaderSpi")
    exclude("META-INF/services/javax.imageio.spi.ImageInputStreamSpi")

    listOf(
        "aix-*", "sunos-*", "openbsd-*", "dragonflybsd-*", "freebsd-*", "linux-*",
        "*-ppc", "*-ppc64le", "*-s390x", "*-armel",
    ).forEach { exclude("com/sun/jna/$it/**") }

    minimize {
        exclude(dependency("com.google.code.gson:.*:.*"))
        exclude(dependency("net.java.dev.jna:jna:.*"))
        exclude(dependency("libs:JFoenix:.*"))
        exclude(project(":CSLBoot"))
        // FrpcManager is also loaded by optional multiplayer integrations.
        exclude(project(":CSLCore"))
    }

    manifest.attributes(
        "Created-By" to "Copyright(c) 2013-2025 huangyuhui.",
        "Implementation-Version" to project.version.toString(),
        "Main-Class" to "org.jackhuang.csl.Main",
        "Multi-Release" to "true",
        "Add-Opens" to addOpens.joinToString(" "),
        "Enable-Native-Access" to "ALL-UNNAMED",
        "Enable-Final-Field-Mutation" to "ALL-UNNAMED",
    )

    if (launcherExe.isNotBlank()) {
        into("assets") {
            from(file(launcherExe))
        }
    }

    doLast {
        attachSignature(jarPath)
        createChecksum(jarPath)
    }
}

tasks.processResources {
    dependsOn(createPropertiesFile)
    dependsOn(upsideDownTranslate)
    dependsOn(createLocaleNamesResourceBundle)
    dependsOn(createLanguageList)
    dependsOn(bundleTerracottaCore)

    into("assets/") {
        from(cslPropertiesFile)
        from(embedResources)
    }

    into("assets/lang") {
        from(createLanguageList.map { it.outputFile })
        from(upsideDownTranslate.map { it.outputFile })
        from(createLocaleNamesResourceBundle.map { it.outputDirectory })
    }

    inputs.property("terracotta_version", libs.versions.terracotta)
    doLast {
        upgradeTerracottaConfig.get().checkValid()
    }
}

fun artifactFile(ext: String) = jarPath.resolveSibling(jarPath.nameWithoutExtension + '.' + ext)

val makeExecutables = tasks.register("makeExecutables") {
    val extensions = listOf("exe", "sh")

    dependsOn(tasks.jar)

    inputs.file(jarPath)
    outputs.files(extensions.map { artifactFile(it) })

    doLast {
        val jarContent = jarPath.readBytes()

        ZipFile(jarPath).use { zipFile ->
            for (extension in extensions) {
                val output = artifactFile(extension)
                val entry = zipFile.getEntry("assets/CSLauncher.$extension")
                    ?: throw GradleException("CSLauncher.$extension not found")

                output.outputStream().use { outputStream ->
                    zipFile.getInputStream(entry).use { it.copyTo(outputStream) }
                    outputStream.write(jarContent)
                }

                createChecksum(output)
            }
        }
    }
}

val makeDeb = tasks.register("makeDeb", CreateDeb::class) {
    dependsOn(makeExecutables)

    val debFile = layout.file(provider { artifactFile("deb") })

    val debChannel = when (versionType) {
        "stable" -> ReleaseType.STABLE
        "dev" -> ReleaseType.DEVELOPMENT
        else -> ReleaseType.NIGHTLY
    }

    version.set(project.version.toString())
    releaseType.set(debChannel)
    launcherClassName.set("org.jackhuang.csl.Launcher")
    appShFile.set(layout.file(provider { artifactFile("sh") }))
    iconFile.set(layout.projectDirectory.file("image/csl.png"))
    outputFile.set(debFile)

    doLast {
        createChecksum(debFile.get().asFile)
    }
}

tasks.build {
    dependsOn(makeExecutables)
    dependsOn(makeDeb)
}

fun parseToolOptions(options: String?): MutableList<String> {
    if (options == null)
        return mutableListOf()

    val builder = StringBuilder()
    val result = mutableListOf<String>()

    var offset = 0

    loop@ while (offset < options.length) {
        val ch = options[offset]
        if (Character.isWhitespace(ch)) {
            if (builder.isNotEmpty()) {
                result += builder.toString()
                builder.clear()
            }

            while (offset < options.length && Character.isWhitespace(options[offset])) {
                offset++
            }

            continue@loop
        }

        if (ch == '\'' || ch == '"') {
            offset++

            while (offset < options.length) {
                val ch2 = options[offset++]
                if (ch2 != ch) {
                    builder.append(ch2)
                } else {
                    continue@loop
                }
            }

            throw GradleException("Unmatched quote in $options")
        }

        builder.append(ch)
        offset++
    }

    if (builder.isNotEmpty()) {
        result += builder.toString()
    }

    return result
}

// For IntelliJ IDEA
tasks.withType<JavaExec> {
    if (name != "run") {
        jvmArgs(addOpens.map { "--add-opens=$it=ALL-UNNAMED" })
//        if (javaVersion >= JavaVersion.VERSION_24) {
//            jvmArgs("--enable-native-access=ALL-UNNAMED")
//        }
    }
}

tasks.register<JavaExec>("run") {
    dependsOn(tasks.jar)

    group = "application"

    classpath = files(jarPath)
    workingDir = rootProject.rootDir

    val vmOptions = parseToolOptions(System.getenv("CSL_JAVA_OPTS") ?: "-Xmx1g")
    if (vmOptions.none { it.startsWith("-Dcsl.offline.auth.restricted=") })
        vmOptions += "-Dcsl.offline.auth.restricted=false"
    if (vmOptions.none { it.startsWith("-Dcsl.self_integrity_check.disable=") })
        vmOptions += "-Dcsl.self_integrity_check.disable=true"

    jvmArgs(vmOptions)

    val cslJavaHome = System.getenv("CSL_JAVA_HOME")
    if (cslJavaHome != null) {
        this.executable(
            file(cslJavaHome).resolve("bin")
                .resolve(if (System.getProperty("os.name").lowercase().startsWith("windows")) "java.exe" else "java")
        )
    }

    doFirst {
        logger.quiet("CSL_JAVA_OPTS: {}", vmOptions)
        logger.quiet("CSL_JAVA_HOME: {}", cslJavaHome ?: System.getProperty("java.home"))
    }
}

// terracotta

val upgradeTerracottaConfig = tasks.register<TerracottaConfigUpgradeTask>("upgradeTerracottaConfig") {
    val destination = layout.projectDirectory.file("src/main/resources/assets/terracotta.json")
    val source = layout.projectDirectory.file("terracotta-template.json");

    classifiers.set(
        listOf(
            "windows-x86_64", "windows-arm64",
            "macos-x86_64", "macos-arm64",
            "linux-x86_64", "linux-arm64", "linux-loongarch64", "linux-riscv64",
            "freebsd-x86_64"
        )
    )

    version.set(libs.versions.terracotta)
    downloadURL.set($$"https://github.com/burningtnt/Terracotta/releases/download/v${version}/terracotta-${version}-${classifier}-pkg.tar.gz")

    templateFile.set(source)
    outputFile.set(destination)
}

// Bundles the Terracotta core package for the current platform into launcher resources, so that online
// multiplayer works out of the box without downloading the core at runtime.
val bundleTerracottaCore = tasks.register("bundleTerracottaCore") {
    val version = libs.versions.terracotta.get()
    val osName = System.getProperty("os.name").lowercase()
    val osArch = System.getProperty("os.arch").lowercase()
    val os = when {
        osName.contains("win") -> "windows"
        osName.contains("mac") -> "macos"
        osName.contains("linux") -> "linux"
        else -> "freebsd"
    }
    val arch = when (osArch) {
        "amd64", "x86_64" -> "x86_64"
        "aarch64", "arm64" -> "arm64"
        else -> osArch
    }
    val classifier = "$os-$arch"

    val destination = layout.projectDirectory.file("src/main/resources/assets/terracotta/terracotta-$version-$classifier-pkg.tar.gz")

    inputs.property("terracotta_version", version)
    inputs.property("classifier", classifier)
    outputs.file(destination)

    doLast {
        val url = URI.create("https://github.com/burningtnt/Terracotta/releases/download/v$version/terracotta-$version-$classifier-pkg.tar.gz").toURL()
        val file = destination.asFile
        file.parentFile.mkdirs()
        url.openStream().use { input -> file.outputStream().use { output -> input.copyTo(output) } }
    }
}

// Check Translations

tasks.register<CheckTranslations>("checkTranslations") {
    val dir = layout.projectDirectory.dir("src/main/resources/assets/lang")

    englishFile.set(dir.file("I18N.properties"))
    simplifiedChineseFile.set(dir.file("I18N_zh_CN.properties"))
    traditionalChineseFile.set(dir.file("I18N_zh.properties"))
    classicalChineseFile.set(dir.file("I18N_lzh.properties"))
}

// l10n

val generatedDir = layout.buildDirectory.dir("generated")

val upsideDownTranslate = tasks.register<UpsideDownTranslate>("upsideDownTranslate") {
    inputFile.set(layout.projectDirectory.file("src/main/resources/assets/lang/I18N.properties"))
    outputFile.set(generatedDir.map { it.file("generated/i18n/I18N_en_Qabs.properties") })
}

val createLanguageList = tasks.register<CreateLanguageList>("createLanguageList") {
    resourceBundleDir.set(layout.projectDirectory.dir("src/main/resources/assets/lang"))
    resourceBundleBaseName.set("I18N")
    additionalLanguages.set(listOf("en-Qabs"))
    outputFile.set(generatedDir.map { it.file("languages.json") })
}

val createLocaleNamesResourceBundle = tasks.register<CreateLocaleNamesResourceBundle>("createLocaleNamesResourceBundle") {
    dependsOn(createLanguageList)

    languagesFile.set(createLanguageList.flatMap { it.outputFile })
    outputDirectory.set(generatedDir.map { it.dir("generated/LocaleNames") })
}

// mcmod data

tasks.register<ParseModDataTask>("parseModData") {
    inputFile.set(layout.projectDirectory.file("mod.json"))
    outputFile.set(layout.projectDirectory.file("src/main/resources/assets/mod_data.txt"))
}

tasks.register<ParseModDataTask>("parseModPackData") {
    inputFile.set(layout.projectDirectory.file("modpack.json"))
    outputFile.set(layout.projectDirectory.file("src/main/resources/assets/modpack_data.txt"))
}

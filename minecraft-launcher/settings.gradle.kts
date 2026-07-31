rootProject.name = "CSL3"
include(
    "CSL",
    "CSLCore",
    "CSLBoot"
)

val minecraftLibraries = listOf("CSLTransformerDiscoveryService", "CSLMultiMCBootstrap")
include(minecraftLibraries)

for (library in minecraftLibraries) {
    project(":$library").projectDir = file("minecraft/libraries/$library")
}

/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 huangyuhui <huanghongxun2008@126.com> and contributors
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
package org.jackhuang.csl.setting;

import com.google.gson.annotations.JsonAdapter;
import com.google.gson.annotations.SerializedName;
import javafx.beans.property.LongProperty;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleLongProperty;
import javafx.beans.property.SimpleObjectProperty;
import org.jackhuang.csl.util.gson.JsonSchema;
import org.jackhuang.csl.util.gson.JsonSerializable;
import org.jackhuang.csl.util.gson.JsonUtils;
import org.jackhuang.csl.util.gson.ObservableSetting;
import org.jetbrains.annotations.NotNullByDefault;
import org.jetbrains.annotations.Nullable;

import java.util.Objects;

/// Tracks cumulative usage statistics for the launcher, persisted as JSON.
///
/// Counts are monotonically increasing and survive across launcher restarts.
/// The JSON representation is saved as {@code state/usage-statistics.json} under the current CSL directory.
///
/// @author Glavo
@NotNullByDefault
@JsonAdapter(UsageStatistics.Adapter.class)
@JsonSerializable
public final class UsageStatistics extends ObservableSetting implements JsonSchemaSetting {
    /// The JSON schema supported by this statistics store.
    public static final JsonSchema CURRENT_SCHEMA =
            new JsonSchema("usage-statistics", new JsonSchema.Version(1, 0, 0));

    /// Creates an empty usage statistics store.
    public UsageStatistics() {
        tracker.markDirty(schema);
        register();
    }

    /// Deserializes usage statistics from JSON.
    public static @Nullable UsageStatistics fromJson(String json) {
        return JsonUtils.fromJson(JsonUtils.GSON, json, UsageStatistics.class);
    }

    // ---- Schema ----

    @SerializedName(JsonSchema.PROPERTY_SCHEMA)
    private final ObjectProperty<JsonSchema> schema = new SimpleObjectProperty<>(CURRENT_SCHEMA);

    public ObjectProperty<JsonSchema> schemaProperty() { return schema; }
    public JsonSchema getSchema() { return schema.get(); }
    public void setSchema(JsonSchema schema) { this.schema.set(Objects.requireNonNull(schema)); }

    // ---- Persistence control ----

    private transient boolean savable = true;

    @Override
    public boolean isSavable() { return savable; }

    @Override
    public void setSavable(boolean savable) { this.savable = savable; }

    private transient boolean backupOnNextSave = false;

    @Override
    public boolean isBackupOnNextSave() { return backupOnNextSave; }

    @Override
    public void setBackupOnNextSave(boolean backupOnNextSave) { this.backupOnNextSave = backupOnNextSave; }

    // ---- Statistics fields ----

    /// Total number of game launch attempts.
    @SerializedName("launchCount")
    private final LongProperty launchCount = new SimpleLongProperty(0);

    public LongProperty launchCountProperty() { return launchCount; }
    public long getLaunchCount() { return launchCount.get(); }
    public void setLaunchCount(long value) { this.launchCount.set(value); }

    /// Number of successful game launches (game window opened).
    @SerializedName("launchSuccessCount")
    private final LongProperty launchSuccessCount = new SimpleLongProperty(0);

    public LongProperty launchSuccessCountProperty() { return launchSuccessCount; }
    public long getLaunchSuccessCount() { return launchSuccessCount.get(); }
    public void setLaunchSuccessCount(long value) { this.launchSuccessCount.set(value); }

    /// Number of launch failures (game crashed or failed to start).
    @SerializedName("launchFailureCount")
    private final LongProperty launchFailureCount = new SimpleLongProperty(0);

    public LongProperty launchFailureCountProperty() { return launchFailureCount; }
    public long getLaunchFailureCount() { return launchFailureCount.get(); }
    public void setLaunchFailureCount(long value) { this.launchFailureCount.set(value); }

    /// Total game play time in milliseconds.
    @SerializedName("totalGameTimeMs")
    private final LongProperty totalGameTimeMs = new SimpleLongProperty(0);

    public LongProperty totalGameTimeMsProperty() { return totalGameTimeMs; }
    public long getTotalGameTimeMs() { return totalGameTimeMs.get(); }
    public void setTotalGameTimeMs(long value) { this.totalGameTimeMs.set(value); }

    /// Total number of file downloads.
    @SerializedName("downloadCount")
    private final LongProperty downloadCount = new SimpleLongProperty(0);

    public LongProperty downloadCountProperty() { return downloadCount; }
    public long getDownloadCount() { return downloadCount.get(); }
    public void setDownloadCount(long value) { this.downloadCount.set(value); }

    /// Total downloaded bytes (traffic consumed).
    @SerializedName("totalDownloadBytes")
    private final LongProperty totalDownloadBytes = new SimpleLongProperty(0);

    public LongProperty totalDownloadBytesProperty() { return totalDownloadBytes; }
    public long getTotalDownloadBytes() { return totalDownloadBytes.get(); }
    public void setTotalDownloadBytes(long value) { this.totalDownloadBytes.set(value); }

    /// Number of game instance deletions.
    @SerializedName("deleteCount")
    private final LongProperty deleteCount = new SimpleLongProperty(0);

    public LongProperty deleteCountProperty() { return deleteCount; }
    public long getDeleteCount() { return deleteCount.get(); }
    public void setDeleteCount(long value) { this.deleteCount.set(value); }

    /// Number of errors encountered (launch failures, download errors, etc.).
    @SerializedName("errorCount")
    private final LongProperty errorCount = new SimpleLongProperty(0);

    public LongProperty errorCountProperty() { return errorCount; }
    public long getErrorCount() { return errorCount.get(); }
    public void setErrorCount(long value) { this.errorCount.set(value); }

    /// Number of multiplayer sessions hosted or joined.
    @SerializedName("multiplayerCount")
    private final LongProperty multiplayerCount = new SimpleLongProperty(0);

    public LongProperty multiplayerCountProperty() { return multiplayerCount; }
    public long getMultiplayerCount() { return multiplayerCount.get(); }
    public void setMultiplayerCount(long value) { this.multiplayerCount.set(value); }

    /// Number of modpack installations.
    @SerializedName("modpackInstallCount")
    private final LongProperty modpackInstallCount = new SimpleLongProperty(0);

    public LongProperty modpackInstallCountProperty() { return modpackInstallCount; }
    public long getModpackInstallCount() { return modpackInstallCount.get(); }
    public void setModpackInstallCount(long value) { this.modpackInstallCount.set(value); }

    /// Number of game instance creations.
    @SerializedName("instanceCreateCount")
    private final LongProperty instanceCreateCount = new SimpleLongProperty(0);

    public LongProperty instanceCreateCountProperty() { return instanceCreateCount; }
    public long getInstanceCreateCount() { return instanceCreateCount.get(); }
    public void setInstanceCreateCount(long value) { this.instanceCreateCount.set(value); }

    /// Total launcher runtime in milliseconds (how long CSL itself has been running).
    @SerializedName("totalLauncherRuntimeMs")
    private final LongProperty totalLauncherRuntimeMs = new SimpleLongProperty(0);

    public LongProperty totalLauncherRuntimeMsProperty() { return totalLauncherRuntimeMs; }
    public long getTotalLauncherRuntimeMs() { return totalLauncherRuntimeMs.get(); }
    public void setTotalLauncherRuntimeMs(long value) { this.totalLauncherRuntimeMs.set(value); }

    // ---- Convenience increment methods ----

    /// Increments the launch count by one.
    public void incrementLaunchCount() { launchCount.set(launchCount.get() + 1); }

    /// Increments the successful launch count by one.
    public void incrementLaunchSuccessCount() { launchSuccessCount.set(launchSuccessCount.get() + 1); }

    /// Increments the launch failure count by one.
    public void incrementLaunchFailureCount() { launchFailureCount.set(launchFailureCount.get() + 1); }

    /// Adds the given milliseconds to total game time.
    public void addGameTimeMs(long ms) { totalGameTimeMs.set(totalGameTimeMs.get() + ms); }

    /// Increments the download count by one and adds the given bytes.
    public void recordDownload(long bytes) {
        downloadCount.set(downloadCount.get() + 1);
        totalDownloadBytes.set(totalDownloadBytes.get() + bytes);
    }

    /// Increments the delete count by one.
    public void incrementDeleteCount() { deleteCount.set(deleteCount.get() + 1); }

    /// Increments the error count by one.
    public void incrementErrorCount() { errorCount.set(errorCount.get() + 1); }

    /// Increments the multiplayer session count by one.
    public void incrementMultiplayerCount() { multiplayerCount.set(multiplayerCount.get() + 1); }

    /// Increments the modpack install count by one.
    public void incrementModpackInstallCount() { modpackInstallCount.set(modpackInstallCount.get() + 1); }

    /// Increments the instance create count by one.
    public void incrementInstanceCreateCount() { instanceCreateCount.set(instanceCreateCount.get() + 1); }

    /// Adds the given milliseconds to total launcher runtime.
    public void addLauncherRuntimeMs(long ms) { totalLauncherRuntimeMs.set(totalLauncherRuntimeMs.get() + ms); }

    // ---- JSON adapter ----

    public static final class Adapter extends ObservableSetting.Adapter<UsageStatistics> {
        @Override
        protected UsageStatistics createInstance() {
            return new UsageStatistics();
        }
    }
}
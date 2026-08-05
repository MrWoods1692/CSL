/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.ui.multiplayer;

import javafx.beans.property.ReadOnlyObjectProperty;
import javafx.beans.property.ReadOnlyObjectWrapper;
import javafx.collections.FXCollections;
import javafx.concurrent.Task;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Button;
import com.jfoenix.controls.JFXButton;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.SelectionMode;
import javafx.scene.control.Separator;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.paint.Color;
import javafx.scene.text.Text;
import javafx.scene.text.TextFlow;
import javafx.scene.input.Clipboard;
import javafx.scene.input.ClipboardContent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.util.StringConverter;
import org.jackhuang.csl.network.MultiplayerMode;
import org.jackhuang.csl.network.MultiplayerSession;
import org.jackhuang.csl.network.frp.FrpcManager;
import org.jackhuang.csl.ui.decorator.DecoratorPage;
import org.jackhuang.csl.ui.Controllers;
import org.jackhuang.csl.ui.construct.MessageDialogPane;
import org.jetbrains.annotations.NotNullByDefault;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Consumer;
import java.util.concurrent.CompletableFuture;

import static org.jackhuang.csl.util.i18n.I18n.i18n;
import static org.jackhuang.csl.setting.SettingsManager.settings;

/// Launcher-owned multiplayer control page with direct, P2P and FRP controls.
@NotNullByDefault
public final class MultiplayerPage extends VBox implements DecoratorPage {
    private static FrpcManager automaticFrpc;
    private final ReadOnlyObjectWrapper<State> state =
            new ReadOnlyObjectWrapper<>(State.fromTitle(i18n("multiplayer")));
    private final MultiplayerSession session = new MultiplayerSession();
    private final FrpcManager frpc = new FrpcManager();
    private final MultiplayerRuntime runtime = new MultiplayerRuntime();
    private final MinecraftServerManager minecraftServer = new MinecraftServerManager();
    private final Label status = new Label();
    private final TextFlow serverLog = new TextFlow();
    private final ComboBox<LogCategory> logFilter = new ComboBox<>();
    private final Label logSummary = new Label();
    private final List<ServerLogEntry> serverLogEntries = new ArrayList<>();
    private final Set<String> ops = new HashSet<>();
    private final Consumer<String> logListener = line ->
        javafx.application.Platform.runLater(() -> appendServerLog(line));

    private void runOAuthAction(Button button, Label oauthStatus, OAuthWork work, String successText) {
        button.setDisable(true);
        oauthStatus.setText("OAuth：处理中...");
        CompletableFuture.supplyAsync(() -> {
            try {
                return work.run();
            } catch (IOException exception) {
                throw new java.util.concurrent.CompletionException(exception);
            }
        }).whenComplete((result, throwable) -> javafx.application.Platform.runLater(() -> {
            button.setDisable(false);
            if (throwable != null) {
                Throwable cause = throwable.getCause() == null ? throwable : throwable.getCause();
                oauthStatus.setText("OAuth：" + cause.getMessage());
            } else {
                oauthStatus.setText(successText + "：" + result);
            }
        }));
    }

    @FunctionalInterface
    private interface OAuthWork {
        String run() throws IOException;
    }

    private enum LogCategory {
        ALL("全部"),
        INFO("信息"),
        SUCCESS("成功"),
        WARNING("警告"),
        ERROR("错误"),
        DEBUG("调试");

        private final String title;

        LogCategory(String title) {
            this.title = title;
        }

        @Override
        public String toString() {
            return title;
        }
    }

    private record ServerLogEntry(String line, LogCategory category) {
    }

    /// Creates the interactive multiplayer page.
    public MultiplayerPage() {
        getStyleClass().add("content-background");
        setAlignment(Pos.TOP_CENTER);
        setPadding(new Insets(32));

        Label title = new Label(i18n("multiplayer"));
        title.getStyleClass().add("multiplayer-title");
        Label description = new Label("房主点击“开始联机”，启动器自动启动服务端、获取公网地址、映射端口、生成房间号。\n"
                + "访客只需输入房间号即可加入。服务端自动启用离线模式，无需正版验证。");
        description.setWrapText(true);
        description.getStyleClass().add("secondary-label");
        Button oauthLogin = new Button("登录联机服务");
        oauthLogin.getStyleClass().add("secondary-button");
        Button oauthRefresh = new Button("刷新令牌");
        oauthRefresh.getStyleClass().add("secondary-button");
        Button oauthLogout = new Button("登出联机服务");
        oauthLogout.getStyleClass().add("secondary-button");
        Label oauthStatus = new Label("OAuth：未登录");
        oauthStatus.getStyleClass().add("secondary-label");
        OAuthPkceService oauth = new OAuthPkceService();
        oauthLogin.setOnAction(event -> runOAuthAction(oauthLogin, oauthStatus, () -> oauth.startLogin(), "登录成功"));
        oauthRefresh.setOnAction(event -> runOAuthAction(oauthRefresh, oauthStatus, () -> oauth.refreshToken(), "令牌已刷新"));
        oauthLogout.setOnAction(event -> runOAuthAction(oauthLogout, oauthStatus, () -> oauth.finishLogout(), "已登出"));

        Label badge = new Label("自研联机控制面");
        badge.getStyleClass().add("multiplayer-badge");
        Label onlineBadge = new Label("● 在线工具");
        onlineBadge.getStyleClass().add("multiplayer-online-badge");
        HBox oauthButtons = new HBox(8, oauthLogin, oauthRefresh, oauthLogout);
        HBox pageHeading = new HBox(10, badge, onlineBadge, oauthButtons);
        pageHeading.getStyleClass().add("multiplayer-heading");

        // 角色选择：房主 / 访客
        ComboBox<String> role = new ComboBox<>(FXCollections.observableArrayList("房主", "访客"));
        role.setValue("房主");
        role.setMaxWidth(Double.MAX_VALUE);
        Label roleHint = new Label();
        roleHint.setWrapText(true);
        roleHint.getStyleClass().add("secondary-label");
        updateRoleHint(role.getValue(), roleHint);

        // 房主模式控件
        Button start = new Button("开始联机");
        start.getStyleClass().add("accent-button");
        Button stop = new Button("停止联机");
        stop.getStyleClass().add("secondary-button");
        stop.setDisable(true);
        Button chmlfrp = new Button("使用 chmlfrp");
        chmlfrp.getStyleClass().add("secondary-button");
        HBox hostActions = new HBox(10, start, stop, chmlfrp);
        HBox.setHgrow(start, Priority.ALWAYS);
        HBox.setHgrow(stop, Priority.ALWAYS);
        HBox.setHgrow(chmlfrp, Priority.ALWAYS);
        start.setMaxWidth(Double.MAX_VALUE);
        stop.setMaxWidth(Double.MAX_VALUE);
        chmlfrp.setMaxWidth(Double.MAX_VALUE);

        // 访客模式控件
        TextField roomCode = new TextField();
        roomCode.setPromptText("输入房主给出的房间号（8位字符）");
        roomCode.setMaxWidth(Double.MAX_VALUE);
        Button visitorJoin = new Button("加入服务器");
        visitorJoin.getStyleClass().add("accent-button");
        HBox guestActions = new HBox(10, roomCode, visitorJoin);
        HBox.setHgrow(roomCode, Priority.ALWAYS);
        guestActions.setVisible(false);
        guestActions.setManaged(false);

        // 邀请/房间号显示
        TextField invite = new TextField();
        invite.setEditable(false);
        invite.setPromptText("启动联机后生成房间号");
        invite.setMaxWidth(Double.MAX_VALUE);
        Button copyInvite = new Button("复制房间号");
        copyInvite.getStyleClass().add("secondary-button");
        copyInvite.setDisable(true);
        copyInvite.setOnAction(event -> {
            ClipboardContent content = new ClipboardContent();
            content.putString(invite.getText());
            Clipboard.getSystemClipboard().setContent(content);
            status.setText("状态：房间号已复制，可发送给好友。");
        });
        HBox inviteActions = new HBox(10, invite, copyInvite);
        HBox.setHgrow(invite, Priority.ALWAYS);

        // 状态标签
        status.setText("状态：未启动");
        status.setWrapText(true);
        status.getStyleClass().addAll("multiplayer-status", "status-idle");

        // 服务端日志
        serverLog.getStyleClass().add("multiplayer-log");
        serverLog.setPrefHeight(220);
        serverLog.setMaxWidth(Double.MAX_VALUE);
        serverLog.setLineSpacing(2);
        ScrollPane logScroll = new ScrollPane(serverLog);
        logScroll.setFitToWidth(true);
        logScroll.setPrefHeight(250);
        logScroll.setMaxWidth(Double.MAX_VALUE);
        logScroll.getStyleClass().add("multiplayer-log-scroll");
        logFilter.getItems().setAll(LogCategory.values());
        logFilter.setValue(LogCategory.ALL);
        logFilter.setPrefWidth(110);
        logFilter.setOnAction(event -> refreshServerLog());
        Button clearLogs = new Button("清空日志");
        clearLogs.getStyleClass().add("secondary-button");
        clearLogs.setOnAction(event -> {
            serverLogEntries.clear();
            refreshServerLog();
        });
        logSummary.getStyleClass().add("secondary-label");
        HBox logToolbar = new HBox(10, new Label("日志分类"), logFilter, logSummary, clearLogs);
        logToolbar.getStyleClass().add("multiplayer-log-toolbar");
        HBox.setHgrow(logSummary, Priority.ALWAYS);
        minecraftServer.addLogListener(logListener);
        minecraftServer.getLogLines().forEach(this::appendServerLog);

        // 角色切换逻辑
        role.valueProperty().addListener((observable, oldValue, newValue) -> {
            boolean guest = "访客".equals(newValue);
            hostActions.setVisible(!guest);
            hostActions.setManaged(!guest);
            guestActions.setVisible(guest);
            guestActions.setManaged(guest);
            inviteActions.setVisible(!guest);
            inviteActions.setManaged(!guest);
            updateRoleHint(newValue, roleHint);
            if (guest) {
                status.setText("状态：访客模式，请输入房主给出的房间号。");
            } else {
                status.setText("状态：未启动");
            }
        });

        // 房主：开始联机
        start.setOnAction(event -> {
            if (!"房主".equals(role.getValue())) {
                status.setText("状态：当前是访客模式，请使用“加入服务器”。");
                return;
            }
            start.setDisable(true);
            stop.setDisable(false);
            chmlfrp.setDisable(true);
            doP2pAutoStart(25565, invite, copyInvite, start, stop);
        });

        // 访客：加入
        visitorJoin.setOnAction(event -> {
            if (!"访客".equals(role.getValue())) {
                status.setText("状态：当前是房主模式，请使用“开始联机”。");
                return;
            }
            String code = roomCode.getText().trim();
            if (code.isBlank()) {
                status.setText("状态：请输入房主给出的房间号。");
                return;
            }
            // 解析房间号：格式 p2p:ip:port:token
            String[] parts = P2pHolePuncher.parseInvite(code);
            if (parts == null) {
                status.setText("状态：房间号格式错误，应为 p2p:IP:端口:TOKEN。");
                return;
            }
            String hostIp = parts[0];
            int hostPort = Integer.parseInt(parts[1]);
            String token = parts[2];
            status.setText("状态：正在连接房主 " + hostIp + ":" + hostPort + "...");
            visitorJoin.setDisable(true);
            startP2pAsGuest(hostIp, hostPort, token, invite, copyInvite, visitorJoin);
        });

        // 停止、chmlfrp
        stop.setOnAction(event -> stopAll(start, stop));
        chmlfrp.setOnAction(event -> {
            status.setText("状态：chmlfrp 暂未接入真实 API，请后续提供接口文档后再接入。");
            showP2pFallbackPrompt("用户主动查看 chmlfrp 联机方案。");
        });

        // 管理员 (ops) 管理
        TextField opNameField = new TextField();
        opNameField.setPromptText("输入玩家名，例如：Notch");
        opNameField.setMaxWidth(Double.MAX_VALUE);
        Button addOp = new Button("添加管理员");
        addOp.getStyleClass().add("secondary-button");
        Button removeOp = new Button("移除选中");
        removeOp.getStyleClass().add("secondary-button");
        ListView<String> opList = new ListView<>();
        opList.setPrefHeight(80);
        opList.setPlaceholder(new Label("未添加管理员，离线模式下任何人都可以冒充管理员"));
        HBox opButtons = new HBox(8, addOp, removeOp);
        opButtons.getStyleClass().add("multiplayer-button-row");
        Label opHint = new Label("添加的玩家名将在服务端启动时写入 ops.json，获得管理员权限（等级 4）。\n"
                + "离线模式下请确保只有信任的玩家知道管理员用户名。");
        opHint.setWrapText(true);
        opHint.getStyleClass().add("secondary-label");
        addOp.setOnAction(event -> {
            String name = opNameField.getText().trim();
            if (name.isBlank()) return;
            if (ops.add(name)) {
                opList.getItems().add(name);
                opNameField.clear();
                status.setText("状态：已添加管理员 \"" + name + "\"，将在下次启动服务端时生效。");
            }
        });
        removeOp.setOnAction(event -> {
            String selected = opList.getSelectionModel().getSelectedItem();
            if (selected != null) {
                ops.remove(selected);
                opList.getItems().remove(selected);
                status.setText("状态：已移除管理员 \"" + selected + "\"。");
            }
        });
        VBox opSection = new VBox(8, new Label("管理员"), opNameField, opButtons, opList, opHint);
        opSection.getStyleClass().add("multiplayer-section");

        // 安全警告
        Label offlineModeWarning = new Label("安全提醒：本机作为服务器运行，自动启用离线模式（online-mode=false, enforce-secure-profile=false）。"
                + "任何人都可以冒用其他玩家的用户名登录，包括管理员，存在严重安全风险。"
                + "强烈建议同时安装登录验证插件 AuthMe、nLogin，或安装仅需服务端配置的 DirectAuth 模组，"
                + "要求玩家输入密码；DirectAuth 还支持正版玩家自动登录。"
                + "如果希望完全自主管理账户与皮肤，也可以搭建兼容官方 Yggdrasil 协议的 Drasl 验证 API 服务器，"
                + "从而减少对 Mojang 基础设施的依赖。");
        offlineModeWarning.setWrapText(true);
        offlineModeWarning.getStyleClass().add("multiplayer-warning");

        // 布局组装
        VBox connectionCard = new VBox(14,
                new Label("联机控制"),
                role, roleHint,
                hostActions,
                guestActions,
                inviteActions,
                offlineModeWarning,
                opSection);
        connectionCard.getStyleClass().add("multiplayer-card");
        connectionCard.getChildren().get(0).getStyleClass().add("multiplayer-section-title");

        VBox statusCard = new VBox(8, new Label("运行状态"), status, new HBox(10));
        statusCard.getStyleClass().add("multiplayer-card");
        statusCard.getChildren().get(0).getStyleClass().add("multiplayer-section-title");

        VBox logCard = new VBox(10, new Label("服务端日志"), logToolbar, logScroll);
        logCard.getStyleClass().add("multiplayer-card");
        logCard.getChildren().get(0).getStyleClass().add("multiplayer-section-title");

        VBox content = new VBox(18, pageHeading, title, description, oauthStatus,
                connectionCard, statusCard, logCard);
        content.getStyleClass().add("multiplayer-content");
        content.setPadding(new Insets(8));
        content.setMaxWidth(720);
        ScrollPane scrollPane = new ScrollPane(content);
        scrollPane.getStyleClass().add("multiplayer-scroll");
        scrollPane.setFitToWidth(true);
        scrollPane.setFitToHeight(true);
        getChildren().add(scrollPane);
    }

    private void startP2pAsGuest(String hostIp, int hostPort, String token,
                                 TextField invite, Button copyInvite, Button visitorJoin) {
        P2pHolePuncher.knockAsGuest(hostIp, hostPort, token,
                logMsg -> javafx.application.Platform.runLater(() -> status.setText(logMsg)))
                .thenAccept(result -> {
                    P2pHolePuncher.Result hole = result;
                    javafx.application.Platform.runLater(() -> {
                        if (!hole.ok()) {
                            String msg = hole.error() != null ? hole.error() : "超时";
                            session.transition(MultiplayerSession.State.FAILED, msg);
                            status.setText("P2P 连接失败：" + msg);
                            visitorJoin.setDisable(false);
                            showP2pFallbackPrompt(msg);
                        } else {
                            session.transition(MultiplayerSession.State.RUNNING, null);
                            status.setText("P2P 连接已建立！");
                            invite.setText("已连接到 " + hole.peer().getHostString() + ":" + hole.peer().getPort());
                            copyInvite.setDisable(false);
                        }
                    });
                })
                .exceptionally(err -> {
                    javafx.application.Platform.runLater(() -> {
                        String msg = rootMessage(err != null ? err : new RuntimeException("未知错误"));
                        session.transition(MultiplayerSession.State.FAILED, msg);
                        status.setText("P2P 连接异常：" + msg);
                        visitorJoin.setDisable(false);
                        showP2pFallbackPrompt(msg);
                    });
                    return null;
                });
    }

    /// Starts the configured FRP profile during launcher startup when enabled.
    public static void autoStartDefaultProfile() {
        if (!settings().autoStartMultiplayerProperty().get()) return;
        String profileName = settings().defaultMultiplayerProfileProperty().get();
        if (profileName == null || profileName.isBlank()) {
            System.err.println("自动联机未启动：未选择默认联机配置。");
            return;
        }
        MultiplayerProfileStore.Profile profile = new MultiplayerProfileStore().load().stream()
                .filter(item -> item.name().equals(profileName))
                .findFirst().orElse(null);
        if (profile == null || profile.mode() != MultiplayerMode.FRP) {
            System.err.println("自动联机未启动：默认配置不存在或不是 FRP 配置。");
            return;
        }
        int configuredPort = profile.port();
        int frpPort = parseRequiredPort(profile.configuration(), "local_port");
        if (configuredPort != frpPort) {
            System.err.println("自动联机未启动：本地端口 " + configuredPort
                    + " 与 FRP local_port " + frpPort + " 不一致。");
            return;
        }
        try {
            String localHost = extractValue(profile.configuration(), "local_ip", "127.0.0.1");
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(localHost, configuredPort), 1500);
            }
            automaticFrpc = new FrpcManager();
            automaticFrpc.start(profile.configuration());
        } catch (Exception exception) {
            if (automaticFrpc != null) automaticFrpc.stop();
            automaticFrpc = null;
            System.err.println("自动联机启动失败：" + exception.getMessage());
        }
    }

    /// Stops the FRP process started automatically with the launcher.
    public static void stopAutomaticDefaultProfile() {
        if (automaticFrpc != null) automaticFrpc.stop();
        automaticFrpc = null;
    }

    /// Returns the page state consumed by the decorator.
    @Override
    public ReadOnlyObjectProperty<State> stateProperty() {
        return state.getReadOnlyProperty();
    }

    /// Stops the bundled FRPC process when the page is closed.
    @Override
    public void closePage() {
        minecraftServer.removeLogListener(logListener);
        runtime.close();
        stop(null, null);
        minecraftServer.close();
    }

    private void ensureServerThenStartAllProfiles(List<MultiplayerProfileStore.Profile> profiles,
                                                  Button startButton, Button stopButton) {
        List<MultiplayerProfileStore.Profile> frpProfiles = profiles.stream()
                .filter(profile -> profile.mode() == MultiplayerMode.FRP)
                .toList();
        if (frpProfiles.isEmpty()) {
            status.setText("状态：没有已保存的 FRP 配置可启动。");
            return;
        }
        if (frpProfiles.stream().anyMatch(profile -> profile.port() < 1 || profile.port() > 65535)) {
            status.setText("状态：所选配置包含无效端口，请先编辑并保存配置。");
            return;
        }
        int localPort;
        try {
            localPort = validateBatchProfiles(frpProfiles);
        } catch (IllegalArgumentException exception) {
            status.setText("状态：" + exception.getMessage());
            return;
        }
        startButton.setDisable(true);
        status.setText("状态：正在检查并启动本地 Minecraft 服务端...");
        int serverPort = localPort;
        CompletableFuture.runAsync(() -> {
            List<String> startedProfiles = new ArrayList<>();
            try {
                // 多个 FRP 隧道共享同一个本地 Minecraft 服务端，只启动一次。
                minecraftServer.ensureRunning(serverPort, ops).join();
                for (MultiplayerProfileStore.Profile profile : frpProfiles) {
                    runtime.start(profile);
                    startedProfiles.add(profile.name());
                }
                javafx.application.Platform.runLater(() -> {
                    stopButton.setDisable(false);
                    status.setText("状态：服务器已就绪，已启动 " + frpProfiles.size() + " 个 FRP 隧道，好友可通过任一地址连接。");
                });
            } catch (Exception exception) {
                startedProfiles.forEach(runtime::stop);
                javafx.application.Platform.runLater(() -> {
                    startButton.setDisable(false);
                    String message = rootMessage(exception);
                    status.setText("状态：Minecraft 服务端启动失败：" + message);
                    showServerDownloadPromptIfNeeded(message);
                });
            }
        });
    }

    private static int validateBatchProfiles(List<MultiplayerProfileStore.Profile> profiles) {
        int localPort = -1;
        Set<Integer> remotePorts = new HashSet<>();
        for (MultiplayerProfileStore.Profile profile : profiles) {
            String configuration = profile.configuration().trim();
            if (!configuration.contains("[common]") || !configuration.contains("[mc]")) {
                throw new IllegalArgumentException("配置“" + profile.name()
                    + "”必须包含 [common] 和 [mc] 段。");
            }
            int configuredLocalPort;
            try {
                configuredLocalPort = parseRequiredPort(configuration, "local_port");
            } catch (IllegalArgumentException exception) {
                throw new IllegalArgumentException("配置“" + profile.name()
                    + "”的 local_port 无效。");
            }
            if (profile.port() != configuredLocalPort) {
                throw new IllegalArgumentException("配置“" + profile.name()
                    + "”的本地端口与 FRP local_port 不一致。");
            }
            if (localPort < 0) localPort = configuredLocalPort;
            if (localPort != configuredLocalPort) {
                throw new IllegalArgumentException("批量运行的配置必须共享同一个本地 Minecraft 端口。");
            }
            int remotePort = parseRequiredPort(configuration, "remote_port");
            if (!remotePorts.add(remotePort)) {
                throw new IllegalArgumentException("批量运行的 FRP 配置不能使用重复的远程端口。");
            }
        }
        return localPort;
    }

    private void ensureServerThenStart(MultiplayerMode mode, ComboBox<String> host, TextField port,
                                       TextArea frpConfiguration, TextField invite, Button copyInvite,
                                       Button start, Button stop) {
        final int localPort;
        try {
            localPort = Integer.parseInt(port.getText().trim());
        } catch (NumberFormatException exception) {
            status.setText("状态：端口必须是 1 到 65535 之间的数字。");
            return;
        }
        if (localPort < 1 || localPort > 65535) {
            status.setText("状态：端口必须是 1 到 65535 之间的数字。");
            return;
        }
        start.setDisable(true);
        status.setText("状态：正在检查并启动本地 Minecraft 服务端...");
        minecraftServer.ensureRunning(localPort, ops).whenComplete((ignored, exception) ->
                javafx.application.Platform.runLater(() -> {
                    if (exception != null) {
                        start.setDisable(false);
                        String message = rootMessage(exception);
                        status.setText("状态：Minecraft 服务端启动失败：" + message);
                        showServerDownloadPromptIfNeeded(message);
                        return;
                    }
                    start(mode, host, port, frpConfiguration, invite, copyInvite, start, stop);
                }));
    }

    private void showServerDownloadPromptIfNeeded(String message) {
        if (!message.contains("下载") && !message.contains("没有可用的服务端")) return;
        JFXButton download = new JFXButton("前往下载服务端");
        download.getStyleClass().add("dialog-accept");
        download.setOnAction(event -> Controllers.navigate(Controllers.getDownloadPage()));
        Controllers.confirmAction("当前配置未安装 Minecraft 服务端，点击下方按钮进入下载页面。",
                "需要安装 Minecraft 服务端", MessageDialogPane.MessageType.WARNING, download, null);
    }

    private static String rootMessage(Throwable throwable) {
        Throwable root = throwable;
        while (root.getCause() != null) root = root.getCause();
        return root.getMessage() == null ? "未知错误" : root.getMessage();
    }

    private void showP2pFallbackPrompt(String message) {
        JFXButton frp = new JFXButton("改用 FRP");
        frp.getStyleClass().add("dialog-accept");
        frp.setOnAction(event -> {
            status.setText("状态：请切换到 FRP 模式并粘贴完整配置。");
        });
        Controllers.confirmAction(
                "P2P 连接未打通，可能是对称 NAT、CGNAT、防火墙或端口未映射导致。建议改用 FRP，或接入 chmlfrp 做隧道穿透。\n\n原因：" + message,
                "P2P 失败",
                MessageDialogPane.MessageType.WARNING,
                frp,
                () -> status.setText("状态：chmlfrp 暂未接入真实 API，请后续提供接口文档后再接入。"));
    }

    private void start(MultiplayerMode mode, ComboBox<String> host, TextField port,
                       TextArea frpConfiguration, TextField invite, Button copyInvite,
                       Button start, Button stop) {
        String pastedConfiguration = frpConfiguration.getText().trim();
        String hostValue = host.getValue() == null ? "" : host.getValue().trim();
        if (mode == null || (mode == MultiplayerMode.FRP && pastedConfiguration.isBlank())
                || (mode != MultiplayerMode.FRP && mode != MultiplayerMode.LAN && hostValue.isBlank())) {
            status.setText(mode == MultiplayerMode.FRP ? "状态：请粘贴完整 FRP 配置。"
                    : "状态：未发现公网 IP，请先配置端口映射或改用 FRP。");
            return;
        }
        if (mode != MultiplayerMode.FRP && mode != MultiplayerMode.LAN && !isPublicAddress(hostValue)) {
            status.setText("状态：直连不显示局域网或本地 IP，请选择公网 IP 或改用 FRP。");
            return;
        }
        if (mode == MultiplayerMode.FRP) {
            startFrp(pastedConfiguration, port, invite, copyInvite, start, stop);
            return;
        }
        final int parsedPort;
        try {
            parsedPort = Integer.parseInt(port.getText().trim());
            if (parsedPort < 1 || parsedPort > 65535) throw new NumberFormatException();
        } catch (NumberFormatException exception) {
            status.setText("状态：端口必须是 1 到 65535 之间的数字。");
            return;
        }
        if (mode == MultiplayerMode.P2P) {
            startDirect(mode, hostValue, parsedPort, host, invite, copyInvite, start, stop);
            return;
        }
        if (mode == MultiplayerMode.LAN) {
            startLan(parsedPort, invite, copyInvite, start, stop);
            return;
        }
        session.transition(MultiplayerSession.State.STARTING, null);
        start.setDisable(true);
        stop.setDisable(false);
        session.transition(MultiplayerSession.State.RUNNING, null);
        status.setText("状态：服务器已就绪（" + hostValue + ":" + parsedPort + "），好友可直接连接。");
        setInvite(invite, copyInvite, mode, hostValue, parsedPort);
    }

    private void startDirect(MultiplayerMode p2pMode, String host, int mcPort,
                             ComboBox<String> hostSelector, TextField inviteField,
                             Button copyInviteBtn, Button startBtn, Button stopBtn) {
        status.setText("状态：正在自动启动 Minecraft 服务端...");
        startBtn.setDisable(true);
        stopBtn.setDisable(false);

        // 固定端口 25565，自动检测并启动服务端
        final int localPort = 25565;
        minecraftServer.ensureRunning(localPort, ops).whenComplete((ignored, exception) ->
                javafx.application.Platform.runLater(() -> {
                    if (exception != null) {
                        startBtn.setDisable(false);
                        stopBtn.setDisable(true);
                        String message = rootMessage(exception);
                        status.setText("状态：Minecraft 服务端启动失败：" + message);
                        showServerDownloadPromptIfNeeded(message);
                        return;
                    }
                    doP2pAutoStart(localPort, inviteField, copyInviteBtn, startBtn, stopBtn);
                }));
    }

    private void doP2pAutoStart(int localPort, TextField inviteField, Button copyInviteBtn,
                                Button startBtn, Button stopBtn) {
        status.setText("状态：正在获取公网地址 (STUN)...");
        StunClient.lookup().thenCompose(stunResult -> {
            if (stunResult == null) {
                throw new RuntimeException("STUN查询失败：无法获取公网地址映射。请检查网络后重试。");
            }
            String publicIp = stunResult.publicIp();
            int publicPort = stunResult.publicPort();

            // 尝试 UPnP 自动映射（外网端口=公网端口，内网端口=本地端口）
            javafx.application.Platform.runLater(() -> status.setText("状态：尝试 UPnP 自动映射端口..."));
            return UpnpPortMapper.mapPort("127.0.0.1", publicPort, localPort, "CSL-P2P")
                    .thenApply(ok -> {
                        javafx.application.Platform.runLater(() -> {
                            if (ok) {
                                status.setText("状态：UPnP 端口映射成功。");
                            } else {
                                status.setText("状态：UPnP 映射失败（路由器可能不支持或已禁用），仍继续尝试打洞。");
                            }
                        });
                        return new String[]{publicIp, String.valueOf(publicPort)};
                    });
        }).thenCompose(arr -> {
            String publicIp = arr[0];
            int publicPort = Integer.parseInt(arr[1]);
            String token = java.util.UUID.randomUUID().toString().substring(0, 8);
            String inviteCode = P2pHolePuncher.buildInvite(publicIp, publicPort, token);

            javafx.application.Platform.runLater(() -> {
                inviteField.setText(inviteCode);
                copyInviteBtn.setDisable(false);
                status.setText("P2P 邀请已就绪，发给好友。等待访客握手…");
            });

            // 开始监听访客握手
            return P2pHolePuncher.listenForGuest(localPort, token,
                    logMsg -> javafx.application.Platform.runLater(() -> status.setText(logMsg)));
        }).thenAccept(result -> {
            P2pHolePuncher.Result hole = result;
            javafx.application.Platform.runLater(() -> {
                if (!hole.ok()) {
                    String msg = hole.error() != null ? hole.error() : "超时";
                    session.transition(MultiplayerSession.State.FAILED, msg);
                    status.setText("P2P 打洞失败：" + msg);
                    startBtn.setDisable(false);
                    stopBtn.setDisable(true);
                    showP2pFallbackPrompt(msg);
                } else {
                    session.transition(MultiplayerSession.State.RUNNING, null);
                    status.setText("P2P 连接已建立！好友可通过邀请码加入");
                    setInvite(inviteField, copyInviteBtn, MultiplayerMode.P2P,
                            hole.peer().getHostString(), hole.peer().getPort());
                }
            });
        }).exceptionally(err -> {
            javafx.application.Platform.runLater(() -> {
                String msg = rootMessage(err != null ? err : new RuntimeException("未知错误"));
                session.transition(MultiplayerSession.State.FAILED, msg);
                status.setText("P2P 启动失败：" + msg);
                startBtn.setDisable(false);
                stopBtn.setDisable(true);
                showP2pFallbackPrompt(msg);
            });
            return null;
        });
    }

    private void startFrp(String pastedConfiguration, TextField localServerPort,
                          TextField invite, Button copyInvite,
                          Button start, Button stop) {
        session.transition(MultiplayerSession.State.STARTING, null);
        start.setDisable(true);
        stop.setDisable(false);
        Task<Void> task = new Task<>() {
            @Override
            protected Void call() throws Exception {
                if (!pastedConfiguration.contains("[common]") || !pastedConfiguration.contains("[mc]")) {
                    throw new IllegalArgumentException("FRP 配置必须包含 [common] 和 [mc] 段");
                }
                String localHost = extractValue(pastedConfiguration, "local_ip", "127.0.0.1");
                int localPort = parseRequiredPort(pastedConfiguration, "local_port");
                int configuredServerPort;
                try {
                    configuredServerPort = Integer.parseInt(localServerPort.getText().trim());
                } catch (NumberFormatException exception) {
                    throw new IllegalArgumentException("本地 Minecraft 服务端端口无效：请输入 1 到 65535 之间的数字。", exception);
                }
                if (configuredServerPort < 1 || configuredServerPort > 65535) {
                    throw new IllegalArgumentException("本地 Minecraft 服务端端口必须是 1 到 65535 之间的数字。");
                }
                if (configuredServerPort != localPort) {
                    throw new IllegalArgumentException("端口不一致：本地 Minecraft 服务端端口为 "
                            + configuredServerPort + "，但 FRP 配置的 local_port 为 " + localPort
                            + "。请修改其中一项后再启动。");
                }
                try (Socket socket = new Socket()) {
                    socket.connect(new InetSocketAddress(localHost, localPort), 1500);
                } catch (IOException exception) {
                    throw new IOException("本地 Minecraft 服务端未在 " + localHost + ":" + localPort
                            + " 监听，请先启动服务端后再开始联机。", exception);
                }
                frpc.start(pastedConfiguration);
                return null;
            }
        };
        task.setOnSucceeded(event -> {
            session.transition(MultiplayerSession.State.RUNNING, null);
            status.setText("状态：FRPC 已启动，服务器已就绪，好友可通过 FRP 地址连接。");
            String address = extractValue(pastedConfiguration, "server_addr", "未知服务端");
            int remotePort = parseValue(pastedConfiguration, "remote_port", 0);
            setInvite(invite, copyInvite, MultiplayerMode.FRP, address, remotePort);
        });
        task.setOnFailed(event -> {
            Throwable error = task.getException();
            session.transition(MultiplayerSession.State.FAILED, error == null ? "未知错误" : error.getMessage());
            status.setText("状态：FRPC 启动失败：" + (error == null ? "未知错误" : error.getMessage()));
            start.setDisable(false);
            stop.setDisable(true);
        });
        Thread worker = new Thread(task, "CSL-Multiplayer-FRPC");
        worker.setDaemon(true);
        worker.start();
    }

    private void startLan(int port, TextField invite, Button copyInvite,
                          Button start, Button stop) {
        String lanIp = detectLanIp();
        session.transition(MultiplayerSession.State.STARTING, null);
        start.setDisable(true);
        stop.setDisable(false);
        session.transition(MultiplayerSession.State.RUNNING, null);
        status.setText("状态：局域网服务器已就绪（" + lanIp + ":" + port + "），同一局域网内的好友可直接连接。");
        setInvite(invite, copyInvite, MultiplayerMode.LAN, lanIp, port);
    }

    private void stop(Button start, Button stop) {
        frpc.stop();
        minecraftServer.close();
        session.close();
        status.setText("状态：已停止。");
        if (start != null) start.setDisable(false);
        if (stop != null) stop.setDisable(true);
    }

    private void stopAll(Button start, Button stop) {
        runtime.stopAll();
        stop(start, stop);
        status.setText("状态：已停止全部联机配置。");
    }

    private static void setInvite(TextField invite, Button copyInvite, MultiplayerMode mode,
                                  String host, int port) {
        String modeLabel = switch (mode) {
            case DIRECT -> "公网直连";
            case FRP -> "FRP 穿透";
            case P2P -> "P2P 直连";
            case LAN -> "局域网";
        };
        invite.setText("加入我的 Minecraft 服务器！| 模式: " + modeLabel + " | 地址: " + host
                + (port > 0 ? ":" + port : " | 请使用已粘贴的 FRP 配置连接"));
        copyInvite.setDisable(false);
    }

    private void appendServerLog(String line) {
        if (serverLogEntries.size() >= 500) serverLogEntries.remove(0);
        serverLogEntries.add(new ServerLogEntry(line, classifyLog(line)));
        refreshServerLog();
    }

    private void refreshServerLog() {
        LogCategory selected = logFilter.getValue() == null ? LogCategory.ALL : logFilter.getValue();
        serverLog.getChildren().clear();
        int visible = 0;
        for (ServerLogEntry entry : serverLogEntries) {
            if (selected != LogCategory.ALL && entry.category() != selected) continue;
            Text text = new Text("[" + entry.category() + "] " + entry.line()
                + System.lineSeparator());
            text.setFill(logColor(entry.category()));
            serverLog.getChildren().add(text);
            visible++;
        }
        logSummary.setText("显示 " + visible + " / " + serverLogEntries.size() + " 行");
    }

    private static LogCategory classifyLog(String line) {
        String lower = line.toLowerCase();
        if (lower.contains("error") || lower.contains("exception") || lower.contains("fatal")) {
            return LogCategory.ERROR;
        }
        if (lower.contains("warn")) return LogCategory.WARNING;
        if (lower.contains("debug")) return LogCategory.DEBUG;
        if (lower.contains("done") || lower.contains("started") || lower.contains("listening")) {
            return LogCategory.SUCCESS;
        }
        return LogCategory.INFO;
    }

    private static Color logColor(LogCategory category) {
        return switch (category) {
            case ERROR -> Color.web("#ef5350");
            case WARNING -> Color.web("#ffb74d");
            case SUCCESS -> Color.web("#66bb6a");
            case DEBUG -> Color.web("#90caf9");
            case ALL, INFO -> Color.web("#d7dee9");
        };
    }

    private static String extractValue(String configuration, String key, String fallback) {
        for (String line : configuration.split("\\R")) {
            String trimmed = line.trim();
            if (trimmed.startsWith(key) && trimmed.contains("=")) {
                return trimmed.substring(trimmed.indexOf('=') + 1).trim();
            }
        }
        return fallback;
    }

    private static int parseValue(String configuration, String key, int fallback) {
        try {
            return Integer.parseInt(extractValue(configuration, key, Integer.toString(fallback)));
        } catch (NumberFormatException exception) {
            return fallback;
        }
    }

    private static int parseRequiredPort(String configuration, String key) {
        String value = extractValue(configuration, key, "");
        try {
            int port = Integer.parseInt(value);
            if (port < 1 || port > 65535) throw new NumberFormatException();
            return port;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("FRP 配置中的 " + key
                    + " 必须是 1 到 65535 之间的数字。", exception);
        }
    }

    private static int parsePortOrDefault(String value) {
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ignored) {
            return 25565;
        }
    }

    private static volatile List<String> cachedPublicIps;
    private static volatile long cachedPublicIpsTime;

    private static void discoverPublicIps(ComboBox<String> host, Label status) {
        List<String> cached = cachedPublicIps;
        long now = System.currentTimeMillis();
        if (cached != null && now - cachedPublicIpsTime < 300_000L) {
            applyPublicIps(host, status, cached);
            return;
        }
        host.setPromptText("正在自动获取公网 IP...");
        CompletableFuture.supplyAsync(PublicIpDiscovery::discover).thenAccept(addresses ->
                javafx.application.Platform.runLater(() -> {
                    cachedPublicIps = List.copyOf(addresses);
                    cachedPublicIpsTime = System.currentTimeMillis();
                    applyPublicIps(host, status, addresses);
                }));
    }

    private static void applyPublicIps(ComboBox<String> host, Label status, List<String> addresses) {
        String current = host.getValue();
        host.getItems().setAll(addresses);
        if (current != null && isPublicAddress(current)) host.setValue(current);
        else if (!addresses.isEmpty()) host.setValue(addresses.get(0));
        else host.setValue("");
        host.setPromptText(addresses.isEmpty()
                ? "未发现公网 IP，请配置端口映射或改用 FRP"
                : "选择公网 IP（发现多个时可切换）");
        if (!addresses.isEmpty()) {
            status.setText(addresses.size() == 1
                    ? "状态：已自动获取公网 IP：" + addresses.get(0)
                    : "状态：发现多个公网 IP，请选择对外可访问的地址。");
        }
    }

    private static boolean isPublicAddress(String address) {
        return PublicIpDiscovery.isPublicIpv4(address.trim());
    }

    private static void detectLocalPort(TextField port, Button detectButton, Label status) {
        detectButton.setDisable(true);
        status.setText("状态：正在检测本地 Minecraft 服务端口...");
        CompletableFuture.supplyAsync(() -> {
            int configured;
            try {
                configured = Integer.parseInt(port.getText().trim());
            } catch (NumberFormatException ignored) {
                configured = 25565;
            }
            return isLocalPortOpen(configured) ? configured : 0;
        }).whenComplete((found, throwable) -> javafx.application.Platform.runLater(() -> {
            detectButton.setDisable(false);
            if (throwable != null) {
                status.setText("状态：端口检测失败：" + rootMessage(throwable));
                return;
            }
            if (found > 0) {
                port.setText(Integer.toString(found));
                status.setText("状态：检测到本地 Minecraft 服务端端口 " + found + "。");
            } else {
                status.setText("状态：未检测到本地 Minecraft 服务端，请先启动服务端。");
            }
        }));
    }

    private static boolean isLocalPortOpen(int port) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress("127.0.0.1", port), 250);
            return true;
        } catch (IOException ignored) {
            return false;
        }
    }

    private static void updateRoleHint(String role, Label target) {
        if ("访客".equals(role)) {
            target.setText("访客：输入房主给出的公网地址、P2P 地址或 FRP 地址后直接加入，无需启动本地服务端。");
        } else {
            target.setText("房主：先启动本地 Minecraft 服务端，再按公网直连、P2P、FRP 的优先级选择联机方式。");
        }
    }

    private static void updateModeHint(MultiplayerMode mode, Label target) {
        if (mode == MultiplayerMode.DIRECT) {
            target.setText("公网直连：本机启动服务器，好友通过你的公网 IP 和端口直接加入。需要你有公网 IP 或已做端口映射。");
        } else if (mode == MultiplayerMode.FRP) {
            target.setText("FRP 内网穿透：直接粘贴完整 INI 配置，无需公网 IP。启动器自动管理 frpc 进程，将本地服务器暴露到外网。");
        } else if (mode == MultiplayerMode.LAN) {
            target.setText("局域网：自动检测本机局域网 IP，同一路由器/WiFi 下的好友可直接连接，无需公网 IP 或额外配置。");
        } else {
            target.setText("P2P 直连：当前不可用。信令服务和真实数据通道尚未接入，暂不能建立 P2P 连接。");
        }
    }

    /// Detects the first non-loopback IPv4 LAN address, falling back to 127.0.0.1.
    private static String detectLanIp() {
        try {
            java.util.Enumeration<java.net.NetworkInterface> interfaces =
                    java.net.NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                java.net.NetworkInterface networkInterface = interfaces.nextElement();
                if (!networkInterface.isUp() || networkInterface.isLoopback()) continue;
                java.util.Enumeration<java.net.InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    java.net.InetAddress address = addresses.nextElement();
                    if (address instanceof java.net.Inet4Address && !address.isLoopbackAddress()) {
                        return address.getHostAddress();
                    }
                }
            }
        } catch (java.net.SocketException ignored) {
        }
        return "127.0.0.1";
    }
}

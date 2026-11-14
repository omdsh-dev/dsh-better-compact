# 检查点摘要：以图片附加（summaryImage）

`summaryImage` 把压缩检查点的摘要**正文**渲染成 PNG，作为 image 块附加到检查点消息里，替换原来那块摘要文本。可选能力，默认关闭；代价是每轮请求都要重新付一次视觉 token。

## 选项与生效范围

| | |
|---|---|
| 键 | `summaryImage` |
| 类型 / 默认 | boolean / `false` |
| 生效时机 | volatile（与其他 volatile 字段一致：保存后引擎仍用载入时的快照，重载 profile 才生效） |
| 生效模式 | 仅 `goal` 与 `custom` |
| 无效模式 | `handoff` 与 `native`：设置页开关在这两种模式下 disabled，已保存的值保留但不参与压缩 |

`handoff` 永不渲染：它的检查点必须是逐字可读的文档。`native` 走宿主摘要器，本插件不接管其检查点内容。

**谁在管压缩，比模式更重要。** 本插件只在两种情况下拥有压缩权：会话没有 agent preset（host 平面，如 headless），或会话选了 `better-compact` preset。Web 里新建会话默认是 `standard` preset，它自带 `@deepseek-ai/dsh-compaction-basic` 作为 compaction 服务，插件按既有语义**主动让位**（`_supersededByPreset`），此时 `summaryImage` 完全不参与，检查点一定是纯文本。判断方法：会话日志 `session` 事件的 `agentPreset` 字段；要生效就选 `Better Compact` preset，或把 `agent-preset-registry` 的 `default` 指到 `better-compact`。

## 产物与排版

检查点消息由三部分组成：

1. 一条 caption 文本块（固定文案，说明摘要正文在下面图片里）：

   ```
   The checkpoint summary above this line is rendered as the image(s) below: read the continuation state from the image text.
   ```

2. 每页一个 image 块（`{ type: 'image', attachment }`），由 `ctx.attachments.saveImages()` 登记后引用。

   渲染器交出的是灰阶 PNG，但落盘由宿主 `dsh-attachment-local` 归一化：无 alpha 通道的图一律转 **JPEG**（有 alpha 才 WebP），并按部署的 `normalizedImageMaxDimension` 缩放。所以附件对象里读到的是 860×h 的 JPEG，`attachment.name` 仍保留 `compaction-summary-1.png` 这种名字。实机核对过：等宽高对比的 JPEG 文本仍清晰可读，视觉模型 OCR 没有压力；要看渲染器原始 PNG 用 `scripts/summary-image-probe.mjs`。
3. 摘要正文**不再**作为文本块进入上下文；provider 的原始输出仍完整保存在 `rawOutput`，Web 轨迹面板可读全文。

页面：

- 白底（#fff）深字（#111）PNG，画布宽 **860px**，左右内边距 44px（可用宽 772px），高度随行数变化。
- 页眉 13px：`better-compact <mode> checkpoint · <sessionId>`，页眉下一条分隔线；右下角 13px 页码 `n/total`（#555）。
- 正文两档排版，同一请求只用其中一档：

  | 档 | 字号 / 行高 | 每页行数 | 满页高度 | 何时使用 |
  |---|---|---|---|---|
  | 默认 | 16px / 25px | 40 | 1114px | 默认档排出的页数不超过页数上限 |
  | 紧凑 | 14px / 22px | 48 | 1170px | 默认档超上限时整份正文重排一次，尽量让检查点不被截断 |

- 最多 **2 页**（`SUMMARY_IMAGE_MAX_PAGES`）。两档都放不下时，末页最后一行放省略标注，正文因此让出一行（40/48 → 39/47）：

  ```
  … (N more line(s) omitted; the full checkpoint text stays in the session record)
  ```

- 换行：Latin 词不拆断，CJK 与 emoji 等全宽字符可在任意处折行；`\t` 展开成 4 空格。
- 编码：**不用 canvas 的 `toBuffer('image/png')`**，而是自写 8-bit 灰阶 PNG（`node:zlib` `deflateSync` level 9 + 自算 CRC32）。页面本身只用灰阶，灰阶无损且体积远小于 Skia 输出的未过滤 RGBA。有效性由单元测试用 `loadImage` 解码往返验证。
- 硬预算（测试守住）：单页 ≤ 450 KiB、合计 ≤ 900 KiB、合计像素 ≤ 3,932,160（上游请求预算 2048² = 4,194,304 与 1 MiB 字节目标之下留余量）。
- 字体：正文 `monospace` 优先，CJK 兜底族按 `Microsoft YaHei` → `Noto Sans SC` → `Noto Sans CJK SC` → `PingFang SC` → `SimHei` → `SimSun` 探测；全部探不到时在 Windows 注册 `C:\Windows\Fonts\msyh.ttc`。
- 渲染依赖 `@napi-rs/canvas`（dependencies，各平台预编译原生包）。它只在真正渲染时惰性 `import()`：从不开启 `summaryImage` 的宿主不加载原生模块，打包产物里也保持 external 说明符。

## 失败语义（fail-closed）

开启后任何一环不成立都**抛 `LlmError`，`code = BETTER_COMPACT_IMAGE`，让这次压缩失败**，绝不静默退回文本检查点。四种情况：

1. 宿主的 `attachments` 服务缺失。
2. 渲染失败：`@napi-rs/canvas` 加载失败，或找不到任何 CJK 字体（宁可失败也不出豆腐块）。
3. `saveImages()` 存图失败。
4. 会话当前模型**明确声明**不接受 image 输入（`inputModalities` 存在且不含 `image`）。

两条只警告、不失败：

- 模型图像能力**未知**（`inputModalities` 未声明）→ 记警告后照常附加。未知不等于不支持，为此中止压缩更糟。
- 合计像素超过上游 2048² 预算 → 记警告。adapter 可能把图片 offload 成占位文本，那时丢的是整个检查点。

排查入口：压缩事件 `compaction/end.error` 的 `code`/`message`；宿主日志前缀 `better-compact:`（页数、字节数、总像素都在里面）。

## 成本与限制

- **每轮重放都重新付费**：检查点每轮请求都会重放，图片每轮重新计视觉 token（单页约 800–1600），比同长度文本摘要贵。只有在「让检查点肉眼可读」确实值得时才开。
- **别指望它省 token**：上游的 shrink check 只按 JSON 结构价估算 image 块，不会真的按图片内容计费，因此图片检查点的**真实负载可能高于**文本检查点。开它换来的是可读性，不是更少 token。
- **页数上限来自上游预算**：请求版本受 2048×2048 像素预算与 1 MiB 字节目标约束，超预算的图片会被 offload 成占位文本——正好是检查点最不能丢的东西，所以页数封在 2，并靠紧凑排版把内容尽量塞进上限。
- **需要系统 CJK 字体**：容器/精简镜像里通常没有，会直接失败（见上一节第 2 条）。装 `fonts-noto-cjk` 一类字体包即可。
- **只改检查点的呈现形式**：阈值、保留、预算与 preview 的计算方式不变，开或关都不会让会话更早/更晚触发压缩。

## 本地可视化检查

`scripts/summary-image-probe.mjs` 用真实渲染器把一段示例摘要渲染到系统临时目录，打印每页路径、字节数、像素尺寸，并汇总总像素与上游预算的对比。不需要 DSH profile、不需要会话、不调模型，也不参与 `npm test`。

```sh
node scripts/summary-image-probe.mjs                  # 默认档，2 页
node scripts/summary-image-probe.mjs --max-pages 1    # 触发紧凑排版重排
node scripts/summary-image-probe.mjs --long --max-pages 1   # 触发省略标注
```

Node 直接跑 `.ts` 源码（原生类型擦除）；该 Node 版本不能 import `.ts` 时走仓库的 loader：

```sh
node --import tsx scripts/summary-image-probe.mjs
```

实测（Windows + Microsoft YaHei，示例摘要 2488 字符 / 45 行）：

```
$ node scripts/summary-image-probe.mjs
page 1/2  image/png  860x1114  103.5 kB  %TEMP%\bc-summary-image-<id>\compaction-summary-1.png
page 2/2  image/png  860x1014  127.9 kB  %TEMP%\bc-summary-image-<id>\compaction-summary-2.png
total: 2 page(s), 231.3 kB, 1830080 px (pi-ai request budget 4194304 px)

$ node scripts/summary-image-probe.mjs --max-pages 1        # 紧凑档：1170px = 48 行满页
page 1/1  image/png  860x1170  116.1 kB  %TEMP%\bc-summary-image-<id>\compaction-summary-1.png
total: 1 page(s), 116.1 kB, 1006200 px (pi-ai request budget 4194304 px)

$ node scripts/summary-image-probe.mjs --long --max-pages 1 # 6712 字符也压进 1 页，末行是省略标注
page 1/1  image/png  860x1170  116.1 kB  %TEMP%\bc-summary-image-<id>\compaction-summary-1.png
```

检查一次真实压缩到底有没有把图片附进去，读会话日志最直接：

```
$ node scripts/check-checkpoint-images.mjs --home <DSH_HOME> [--session <idPrefix>]
session-bda6e189  (2026-11-14T09:46:49Z)
  seq 29 compaction 1616b4f9: IMAGE ATTACHED (2 image block(s))
    - text(321 chars)
    - text(122 chars)
    - image image/jpeg 860x1114 127727B name=compaction-summary-1.png
    - image image/jpeg 860x639 80240B name=compaction-summary-2.png
    - text(20 chars)
3 checkpoint(s) found, 1 with image block(s), 2 text only
```

日志是 `session.v4.jsonl.zstd`（每次写入一个独立 zstd 帧，所以脚本按帧边界解码，单次解压只得到第一帧）。附件实体在 `<DSH_HOME>/attachments/v1/objects/<sha 前 2 位>/<sha256>`。

打开产物 PNG（probe 输出，未经宿主归一化）即可核对：页眉文案、正文换行（Latin 不断词）、页脚 `n/total`、单页高度是否等于对应档的满页高度，以及末页是否带省略标注。

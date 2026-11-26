# 电路工坊 · Breadboard Lab

> 把电路，搭在浏览器里。

一个**纯前端、无需安装、无需后端**的面包板电路教学网站。拖动标准造型的电阻、LED、按钮和 74HC 逻辑芯片，在 830 孔面包板上连线，实时看到电流、电平和真值表。10 节系统课程 + 24 个元件的完整百科 + 项目工作台 + 可运行的 Arduino 代码实验室 + **WIX1003 Lab 练习关卡** + 独立自由实验空间。

![电路工作台](docs/preview-editor.png)

## 目录

- [功能](#功能)
- [课程与元件](#课程与元件)
- [Lab 练习](#lab-练习)
- [直接部署到 GitHub Pages](#直接部署到-github-pages)
- [本地预览](#本地预览)
- [使用说明](#使用说明)
- [目录结构](#目录结构)
- [仿真说明](#仿真说明)
- [自定义](#自定义)
- [部署检查清单与常见问题](#常见问题)
- [浏览器支持](#浏览器支持)
- [许可证](#许可证)

## 功能

- **真实的面包板连接模型**：830 孔、63 列、4 条电源轨；同一列 A–E / F–J 五孔内部互通；芯片跨接中央凹槽；孔位吸附与自动插入。
- **23 种可拖拽元件**：电阻、LED、按钮、电位器、电容、滑动开关、蜂鸣器、可调电源、9V / 3V / 1.5V 电池、7 种 74HC 逻辑芯片、Arduino Uno、micro:bit、直流电机、舵机、振动电机。
- **24 篇元件百科**：每种元件都有标准 SVG 造型、参数表、引脚说明、使用方法、注意事项和一个小实验。
- **10 节系统课程**：从“认识面包板”到“半加器”和“双条件报警器”，每课包含动手步骤、原理拆解、公式/真值表、常见错误、随堂测验。
- **项目工作台**：8 个可直接打开的示例项目、最近编辑记录、空白画布和按难度分类的入门路径。
- **Lab 练习关卡**：根据 WIX1003《Computer Systems & Organization》的 Lab 01 与 Lab 02 制作，共 10 个关卡。前 8 关是可直接观察的参考练习，电路已经接好；最后两关是**空白终验**——没有零件、没有导线，需要自己从元件库摆放并完成 Lab 的最终交付。每一关都有原理、操作步骤、空白真值表、错误提示和可展开的提示。
- **Arduino 代码实验室**：底部代码面板支持可视化积木示例和可编辑文本，内置 setup/loop、pinMode、digitalWrite、analogWrite、digitalRead、analogRead、if/else、变量、Serial 与 delay；代码可以真正驱动 D13/D9 的 LED、读取 D2 按钮和 A0 电位器，并带串口监视器。
- **可交互仿真**：LED 限流与亮度、按钮/开关通断、电位器分压、74HC 逻辑门真值表、蜂鸣器、电机、舵机；短路/过流/悬空输入/未供电芯片提示。
- **独立自由实验空间**：空白画布、完整元件库、示例电路，自动保存，可导入/导出 JSON。
- **教学辅助**：任务清单与自动检查、实验进度、课程完成标记、本地自动保存、快捷键帮助。
- **纯静态、零依赖**：HTML + CSS + 原生 JavaScript，所有图形都是手绘 SVG，没有 CDN、没有第三方库、没有构建步骤。
- **响应式**：桌面、平板、手机都能使用；移动端支持双指缩放与拖动平移。

### 教程首页

![教程首页](docs/preview-learn.png)

### 项目工作台

![项目工作台](docs/preview-projects.png)

### Arduino 代码实验室

![代码实验室](docs/preview-code.png)

### Lab 练习关卡

![Lab 练习](docs/preview-labs.png)

![Lab 参考练习](docs/preview-lab-level.png)

![Lab 终验关](docs/preview-lab-final.png)

![Lab 终验空白画布](docs/preview-lab-editor.png)

![Lab 真值表自测](docs/preview-lab-quiz.png)

### 自由实验空间

![自由实验](docs/preview-sandbox.png)

## 课程与元件

| # | 课程 | 核心元件 |
|---|------|----------|
| 01 | 认识面包板 | 面包板、电源、电阻、LED |
| 02 | 电阻与限流 | 电阻色环、欧姆定律 |
| 03 | 按钮与数字输入 | 按钮、滑动开关、下拉电阻 |
| 04 | 电位器与分压 | 电位器、ADC、模拟量 |
| 05 | 电容与 RC 延时 | 电容、时间常数、去耦 |
| 06 | 与门：两个都为 1 | 74HC08 |
| 07 | 或门与非门 | 74HC32、74HC04 |
| 08 | 异或与半加器 | 74HC86、74HC08 |
| 09 | 电机与开发板 | 直流电机、舵机、Arduino、micro:bit |
| 10 | 双条件报警器 | 74HC08、蜂鸣器、组合逻辑项目 |

元件百科覆盖：面包板、电阻、LED、按钮、电位器、电容、滑动开关、蜂鸣器、可调电源、9V 电池、3V 纽扣电池、1.5V 电池、74HC08、74HC32、74HC04、74HC86、74HC02、Arduino Uno R3、micro:bit、直流电机、微型伺服、振动电机。

## 直接部署到 GitHub Pages

压缩包解压后，根目录应该直接看到 `index.html`、`css/`、`js/`、`assets/` 等文件。

### 方式一：网页上传（最简单）

1. 解压 `breadboard-lab-github.zip`。
2. 在 GitHub 新建一个仓库（Public / Private 均可，GitHub Pages 对 Private 仓库有套餐限制）。
3. 点击 **Add file → Upload files**，把解压出来的**所有文件和文件夹**拖进上传区。
   - 必须确保 `index.html` 在**仓库根目录**，而不是 `breadboard-lab/index.html`。
   - 如果浏览器默认隐藏点文件，请确认 `.nojekyll` 也上传了；它不是必需的，但可以避免 GitHub Pages 的 Jekyll 处理。
4. 点击 **Commit changes**。
5. 打开仓库的 **Settings → Pages**。
6. 在 **Build and deployment** 下选择：
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/(root)`
7. 点击 **Save**，等待 1–2 分钟。
8. 打开 `https://<你的用户名>.github.io/<仓库名>/`。

> 如果仓库名就是 `<你的用户名>.github.io`，访问地址是 `https://<你的用户名>.github.io/`。
>
> 这是纯静态站点，不需要 Actions、不需要数据库、不需要环境变量。

### 方式二：命令行

```bash
git init
git add .
git commit -m "feat: Breadboard Lab"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后在 GitHub 仓库里按上面的 **Settings → Pages** 步骤开启 Pages。

### 部署到已有仓库的子目录

本项目的所有资源路径都是**相对路径**，可以直接放在子目录中（例如 `/circuit/`）。只要通过完整路径访问其中的 `index.html`，路由和资源都会正常工作。

### 部署检查清单

上传完成、开启 Pages 后，用下面几项快速确认：

- [ ] 仓库根目录能看到 `index.html`，并且 `css/`、`js/`、`assets/` 与它同级。
- [ ] 打开站点后能看到三栏工作台：顶部导航、左边面包板、右边元件库。
- [ ] 点击「开始模拟」后，默认电路的红色 LED 亮起，底部显示 `模拟中 · LED × 1 · 12.6 mA`。
- [ ] 打开 `#/learn` 能看到 10 张课程卡片；打开 `#/parts` 能看到 22 张元件卡片。
- [ ] 手机访问时底部导航正常，页面没有横向滚动条。

### 更新站点

以后修改文件后重新上传或 push 即可，GitHub Pages 会自动重新发布。建议不要直接修改线上生成的文件，保留这份压缩包作为可回滚的版本。

## 常见问题

**页面打开是 404，或者显示的是 README？**
说明 `index.html` 没有在 Pages 实际发布的目录根层。检查 **Settings → Pages** 里选的分支和文件夹，或者把 `index.html` 移到仓库根目录。

**页面能打开，但没有样式 / 元件图标？**
通常是只上传了 `index.html`，漏掉了 `css/`、`js/`、`assets/`。请保持压缩包解压后的目录结构整体上传。

**刷新后路由 404？**
本项目使用 hash 路由（地址中带 `#/`），刷新时只会请求根目录的 `index.html`。如果你把站点放在子目录，请确认访问的是子目录下的 `index.html`，而不是仓库根目录。

**本地保存的电路去哪了？**
自动保存使用浏览器的 `localStorage`，它和**域名 + 路径**绑定。`file://`、`localhost`、GitHub Pages 的域名各自独立；切换环境时请用「导出电路 JSON」迁移。

**为什么电容在仿真里不亮 / 没有延时？**
电容按直流稳态开路处理。课程中的 RC 延时用公式、示意图和真实实验建议讲解，不提供瞬态波形仿真。详见[仿真说明](#仿真说明)。

**可以用在自己的课堂 / 项目里吗？**
可以。项目采用 MIT 许可证，允许修改、再发布和商业使用。建议保留一份自己的版本以便持续维护。

## 本地预览

**推荐**用本地静态服务器打开（尤其是需要测试剪贴板、存储等浏览器能力时）：

```bash
cd breadboard-lab
python -m http.server 8080
```

然后打开 <http://localhost:8080>。

也可以直接双击 `index.html`：本项目没有 `fetch` / ES module 依赖，大多数现代浏览器用 `file://` 也能运行。部分浏览器会限制 `file://` 下的 `localStorage`，此时自动保存会降级，但页面仍可正常使用。

## 使用说明

### 搭建电路

- **添加元件**：从右侧元件库拖到画布，或点击卡片快速添加。元件靠近面包板时会自动吸附到孔位。
- **移动 / 旋转**：拖动元件本体；选中后点击工具栏「旋转」或按 `R`。
- **连线**：从元件的引脚拖到另一个引脚或面包板孔；也可以先点击一个引脚，再点击目标点（两次点击）。
- **删除**：选中后按 `Delete`，或切换到删除工具点击元件/导线。
- **撤销 / 重做**：`Ctrl/⌘ + Z` / `Ctrl/Shift + Z`。
- **模拟**：点击「开始模拟」，然后点击按钮或滑动开关观察变化。

### 保存与导出

- 项目会**自动保存在当前浏览器**的 localStorage 中。
- 「更多 → 导出电路 JSON」可以备份或分享；「导入电路 JSON」可以恢复。
- 课程页的「标记本课完成」会记录在本地，不影响电路文件。

### 快捷键

| 操作 | 快捷键 |
|------|--------|
| 选择 / 连线 / 删除工具 | `V` / `W` / `X` |
| 删除选中项 | `Delete` / `Backspace` |
| 撤销 / 重做 | `Ctrl/⌘ + Z` / `Ctrl/Shift + Z` |
| 复制选中元件 | `Ctrl/⌘ + D` |
| 旋转 90° | `R` |
| 开始 / 暂停模拟 | `S` |
| 缩放 | 滚轮 / `+` / `-` |
| 适应画布 | `0` |
| 取消连线 / 关闭面板 / 取消选择 | `Esc` |

### 移动端

- 单指拖动空白处平移画布，双指捏合缩放。
- 点击右下角「元件库」打开面板；添加元件后会自动关闭。
- 任务卡默认折叠，点击标题栏展开。

### Lab 练习

点击顶部导航 **Lab练习**，会看到两条关卡线：

- **Lab 01 · Electronics**：电源/面包板/LED → 74HC20 NAND → 74HC04 NOT → 74HC21 AND → 74HC86 XOR → 74HC32 OR，共 6 个参考练习，加 1 个空白终验。
- **Lab 02 · Combinational Circuit Design**：半加器 → 全加器，共 2 个参考练习，加 1 个空白终验。

前 8 个参考练习的电路已经接好，适合先运行观察、理解标准做法，再尝试自己复现。最后两关是终验：**画布为空，没有任何零件**；你需要自己打开元件库，摆放芯片、开关、电阻、LED 和电源，独立完成 Lab 01 的五片芯片验证台或 Lab 02 的全加器。

真值表的输出列始终是空的：先自己填，再点「检查我的真值表」。检查只会标出哪几行不对；想不出来时可以点「给我一个提示」。参考练习的接线表默认折叠；终验关不提供完整接线表，只给思路提示。

> 74HC20 / 74HC21 是 4 输入门。Lab 01 只验证 A/B 两列，所以关卡会教你将未使用的 C/D 接 VCC；这也是 CMOS 芯片处理多余输入的正确方式。

### Arduino 代码实验室

打开右下角的 **项目 → Arduino 编程**，或在 Arduino 电路里点击工具栏的 **代码**：

1. **积木**视图展示当前示例的结构，适合先理解程序流程。
2. **文本**视图是可编辑的 Arduino 子集，点击「运行」后代码会实时控制电路。
3. Arduino 模板已经把 D13、D9 接到 LED，D2 接到按钮，A0 接到电位器；串口输出显示在右侧监视器。
4. 关闭代码面板不会停止运行；重新打开可查看串口。点击「停止」或主界面的「暂停模拟」会结束运行。

当前教学子集支持：

```cpp
int value = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  value = analogRead(A0);
  if (digitalRead(2) == LOW) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  analogWrite(9, value / 4);
  Serial.println(value);
  delay(100);
}
```

支持 `if/else`、变量、算术与比较、`pinMode`、`digitalWrite`、`digitalRead`、`analogRead`、`analogWrite`、`Serial.begin`、`Serial.print/println`、`delay`、`millis`、`map`、`constrain`、`abs`。不支持 `for`、`while`、指针、数组和自定义函数；仍可完成闪烁、按钮、调光、呼吸灯、串口等项目。

## 目录结构

```text
breadboard-lab/
├── index.html                  # 应用外壳、SVG 图标精灵
├── manifest.webmanifest        # PWA 清单
├── css/
│   ├── base.css                # 设计系统、顶栏、按钮、模态框
│   ├── app.css                 # 工作台、面包板、元件库、属性面板
│   ├── learn.css               # 教程、课程详情、元件百科、项目工作台
│   └── labs.css                # Lab 练习关卡列表、详情与教程弹窗
├── js/
│   ├── parts.js                # 24 个元件的百科数据
│   ├── lessons.js              # 10 节课程内容
│   ├── labs.js                 # WIX1003 Lab 01 / Lab 02 的 10 个关卡数据与终验进度
│   ├── art.js                  # 标准造型 SVG（图标 + 画布元件 + 封面）
│   ├── engine.js               # 面包板几何、网表、直流求解、逻辑门、Arduino I/O、模板
│   ├── code.js                 # Arduino 教学子集解析器、运行器、代码示例
│   ├── editor.js               # 画布交互、拖拽、连线、属性、代码面板、任务、存档
│   ├── views.js                # 项目工作台、教程页、课程页、元件百科、模态框、进度
│   └── app.js                  # Hash 路由与应用入口
├── assets/                     # favicon、PWA 图标
├── docs/                       # README 截图
├── .nojekyll
├── LICENSE
└── README.md
```

## 仿真说明

这是一个**教学用简化仿真器**，不是 SPICE：

- 使用改进节点法（MNA）求解直流工作点，支持电阻网络、LED 分段线性模型、按钮/开关、电位器、电机/蜂鸣器负载、由理想电压源驱动的 74HC 逻辑门。
- 逻辑门输出按 150Ω 输出阻抗建模，输入高/低阈值约为供电电压的一半；未用输入悬空会给出提示。
- 电容按**直流稳态开路**处理。课程中关于 RC 充放电的内容通过公式与示意图讲解，不提供瞬态波形仿真。
- 舵机角度用信号电压做简化映射，真实器件需要 50Hz PWM。
- 电源与导线为理想连接；短路检测基于求解电流超过阈值。
- 支持 74HC08 / 74HC32 / 74HC04 / 74HC86 / 74HC02 / 74HC20 / 74HC21 逻辑芯片；4 输入门在 Lab 01 中通过把未使用的 C/D 接高来验证 2 输入真值表。
- Arduino 代码按真实时间执行，输出引脚状态作为电压源（带 120Ω 输出阻抗）参与求解；`analogWrite` 用平均电压近似 PWM，不模拟真实脉冲。
- 代码实验室当前只支持 D2 / D9 / D13 / A0 四个教学引脚，不模拟定时器、中断、串口接收和完整 Arduino 库。
- 仿真结果用于理解概念和验证接线，不应用于真实器件的电气设计/安全评估。

## 自定义

- **配色与字体**：`css/base.css` 顶部的 CSS 变量。
- **增加元件**：在 `js/parts.js` 添加百科数据，在 `js/engine.js` 的 `DEFS` 中定义引脚和仿真属性，在 `js/art.js` 添加标准造型。编辑器与元件库会自动读取列表。
- **增加课程**：在 `js/lessons.js` 添加对象；`parts` 字段引用元件 id，`experiment.template` 引用 `engine.js` 中的实验模板。
- **增加实验模板**：在 `js/engine.js` 的 `Templates` 中定义场景和连线，`TASKS` 中定义任务步骤检查键。
- **Logo / 图标**：替换 `assets/favicon.svg`、`assets/icon-192.png`、`assets/icon-512.png`。

## 浏览器支持

支持现代 Chrome、Edge、Safari、Firefox（建议最近两年内的版本）。需要：

- Pointer Events、ResizeObserver、CSS 自定义属性
- localStorage（不支持时自动降级为不保存）
- SVG 与 CSS backdrop-filter（不支持时仅影响毛玻璃效果）

## 许可证

MIT License。可以用于个人学习、课堂教学和商业项目。SVG 元件图形与课程文字均随项目提供。

## 致谢

- 所有元件造型、插图、图标与界面图形均为本项目手绘 SVG，无第三方素材。
- 电路求解器与交互逻辑为纯前端原生实现，无第三方运行时依赖。
- 面向所有第一次点亮 LED 的人。

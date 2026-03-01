# 🇫🇷 Le Vocabulaire — 法语单词学习 Web 应用

## 产品需求文档（PRD）v1.3

> 纯前端 · Cloudflare Pages 部署 · 个人工具

-----

## 关键决策摘要

|决策项  |结论                        |
|-----|--------------------------|
|单词库来源|✅ 内置词汇（静态 JSON，只读）        |
|发音方案 |✅ Web Speech API（免费，浏览器原生）|
|测验题型 |✅ 看法语选英文 + 拼写/填空          |
|技术架构 |✅ 纯前端，localStorage 持久化    |
|部署平台 |✅ Cloudflare Pages + 自定义域名|

-----

## 1. 产品概述

Le Vocabulaire 是一款运行于浏览器的法语单词自学工具，面向个人用户使用。整个应用为纯前端架构，无需后端服务器，可直接部署到 Cloudflare Pages。用户学习进度存储于浏览器 localStorage，完全离线可用。

### 1.1 核心目标

- 通过卡片翻转、发音练习、答题测验三种模式帮助用户记忆内置法语词汇
- 零后端、零成本、一键部署，适合个人开发者自行托管
- 无需注册账号，学习进度自动保存在本地

### 1.2 范围说明（Out of Scope）

- ❌ 不支持用户自定义添加/编辑单词（内置词库只读）
- ❌ 不支持账号系统或云端数据同步
- ❌ 不支持第三方 TTS API（如 Google Cloud、Azure）
- ❌ 不支持「看中文选法语」题型

-----

## 2. 功能模块总览

|模块|功能名称  |优先级  |简述                      |
|--|------|-----|------------------------|
|M1|单词卡片翻转|P0 核心|正面法文，翻转查看英文/中文释义 + 例句   |
|M2|发音练习  |P1 重要|Web Speech API 朗读单词，支持跟读|
|M3|测验模式  |P1 重要|两种题型：看法语选英文 + 拼写填空      |
|M4|学习统计  |P2 增值|今日进度、掌握率、连续学习天数         |

-----

## 3. 功能详细需求

### 3.1 M1 — 单词卡片翻转

**用户故事**

作为用户，我希望看到一张卡片显示法语单词，点击后翻转到背面查看释义，并能标记自己是否记住，以此进行系统复习。

**功能需求**

- 卡片正面：法语单词（大字）+ 词性标注（n. / v. / adj. 等）
- 卡片背面：英文释义 + 音标（IPA）+ 一条法/英对照例句
- 点击卡片任意位置触发 CSS 3D 翻转动画（约 600ms）
- 翻转后显示底部操作栏：「✓ 记住了」（绿色）和「✗ 没记住」（红色）
- 点击任一按钮后自动跳转下一张，进度条同步更新
- 右上角常驻 🔊 按钮，随时点击播放发音
- 支持手动「上一张 / 下一张」导航
- 支持筛选：「全部单词」/ 「仅复习未掌握的」

**掌握状态机**

|状态            |触发条件        |说明          |
|--------------|------------|------------|
|未学习 `new`     |初始状态        |从未翻转过此卡片    |
|学习中 `learning`|点击「没记住」     |出现在「未掌握」复习列表|
|已掌握 `mastered`|连续点击「记住了」3 次|从未掌握列表移除    |

-----

### 3.2 M2 — 发音练习

**用户故事**

作为用户，我希望听到法语单词的正确发音，并能跟读练习，以训练口音和加深记忆。

**TTS 播放（已确认：Web Speech API）**

- 使用 `window.speechSynthesis` 朗读单词，语言设为 `fr-FR`
- 点击 🔊 按钮触发朗读；支持正常速率（1x）和慢速（0.7x）切换
- 朗读期间按钮显示加载态，朗读完毕后恢复

**跟读自评（可选，Chrome 专属）**

- 使用 `window.SpeechRecognition`，语言设为 `fr-FR`
- 点击 🎤 后录音，识别结果与目标单词比对（忽略大小写）
- 反馈：匹配 ✅ / 接近 🟡 / 差异较大 ❌

**降级处理**

若浏览器不支持 SpeechSynthesis，在 🔊 按钮旁显示提示：「当前浏览器不支持语音，建议使用 Chrome」。跟读功能同理降级隐藏。

-----

### 3.3 M3 — 测验模式

**用户故事**

作为用户，我希望通过答题检验记忆效果，并在结束后看到成绩报告和错题列表。

**测验配置（开始前弹窗）**

- 题目数量：10 题 / 20 题 / 全部
- 词库范围：全部单词 / 仅「学习中」/ 仅某个主题
- 题型混合比例：默认选择题 50% + 拼写题 50%

**题型 A：看法语 → 选英文（4 选 1）**

|项目|规则                         |
|--|---------------------------|
|题面|显示法语单词（含词性），点击 🔊 可收听发音     |
|选项|4 个英文释义，1 个正确，3 个从同词性词中随机抽取|
|反馈|选中后立即变色：正确绿色，错误红色并高亮正确答案   |
|计分|答对 +1，答错 0，错误词自动标记为「待复习」   |

**题型 B：拼写 / 填空**

|项目|规则                            |
|--|------------------------------|
|题面|显示英文释义 + 词性，点击 🔊 可收听发音作为提示    |
|输入|用户键入法语单词，提供变音符辅助按钮（é à ù ç ê…）|
|判断|忽略大小写；变音符必须正确（é ≠ e）          |
|提示|可选点击「提示」显示首字母，扣 0.5 分         |
|反馈|提交后高亮差异字符，显示正确答案              |

**变音符辅助键盘**

|类型   |字符                          |
|-----|----------------------------|
|带重音元音|é è ê ë  à â  ù û  î ï  ô  ÿ|
|特殊字符 |ç  œ  æ                     |

**成绩报告**

- 显示：总分、正确率、答题用时、最长连续答对数
- 错题列表：本次答错单词（法语 + 英文），点击可跳到卡片复习
- 操作：「再来一次」/ 「复习错题」/ 「返回首页」

-----

### 3.4 M4 — 学习统计

学习数据完全存储于 localStorage，无需后端。

- 今日已学单词数 / 今日目标（默认 20 词）
- 全库掌握率：已掌握词数 / 总词数 × 100%
- 连续学习天数（Streak）：每日完成至少 1 次卡片或测验即记录
- 各主题掌握率分布（进度条形式）

-----

## 4. 内置词库规格

词库以静态 JSON 文件打包进前端代码，用户无法修改（只读）。

### 4.1 词条数据结构

```json
{
  "id": "fr_0001",
  "fr": "bonjour",
  "en": "hello; good morning",
  "pos": "interj.",
  "ipa": "/bɔ̃.ʒuʁ/",
  "example_fr": "Bonjour, comment allez-vous ?",
  "example_en": "Hello, how are you?",
  "theme": "Greetings & Politeness"
}
```

### 4.2 主题与词量规划（A1–A2 级，约 414 词）

> **v1 范围**：首版覆盖 414 个高频词（A1 核心 + 部分 A2），仅提供英文释义。

|主题 (Theme)                |词数|示例                             |
|--------------------------|--|-------------------------------|
|Greetings & Politeness    |20|bonjour / merci / excusez-moi  |
|Numbers                   |30|un / vingt / cent / mille      |
|Colors                    |14|rouge / bleu / vert / clair    |
|Time & Dates              |35|lundi / janvier / matin / hier |
|Family & People           |25|père / mère / ami / enfant     |
|Food & Drinks             |40|pain / eau / café / fromage    |
|Transport & Places        |30|gare / voiture / rue / ville   |
|Common Verbs              |70|être / avoir / aller / faire   |
|Adjectives                |40|grand / petit / beau / nouveau |
|Function Words            |30|mais / avec / sur / pour / très|
|Body & Health             |20|tête / main / médecin / douleur|
|House & Objects           |25|maison / chambre / lit / clé   |
|Clothing & Shopping       |20|chemise / robe / prix / argent |
|Weather & Nature          |15|soleil / pluie / mer / arbre   |

-----

## 5. 技术方案

### 5.1 技术选型

|层次  |选型                     |理由                       |
|----|-----------------------|-------------------------|
|框架  |Vue 3 (Composition API)|轻量，无服务端依赖，生态成熟           |
|构建  |Vite                   |启动快，dist 直接静态托管          |
|样式  |原生 CSS + CSS 变量        |零依赖，精细控制翻转动画             |
|状态管理|Pinia                  |管理学习状态，持久化到 localStorage |
|语音  |Web Speech API         |免费，无需 API Key，Chrome 支持最佳|
|数据  |静态 JSON + localStorage |词库随包，进度本地存储              |
|部署  |Cloudflare Pages       |免费，全球 CDN，与自有域名无缝集成      |

### 5.2 推荐目录结构

```
le-vocabulaire/
├── public/
│   ├── favicon.ico
│   └── _redirects          # Cloudflare Pages SPA 路由配置
├── src/
│   ├── data/
│   │   └── words.json      # 内置词库（约 200 词，只读）
│   ├── components/
│   │   ├── FlashCard.vue   # 卡片翻转组件（M1）
│   │   ├── AudioBtn.vue    # 发音按钮组件（M2）
│   │   ├── QuizMode.vue    # 测验主容器（M3）
│   │   ├── QuizChoice.vue  # 题型 A：选择题
│   │   ├── QuizSpelling.vue# 题型 B：拼写填空
│   │   ├── QuizResult.vue  # 成绩报告
│   │   └── StatsPanel.vue  # 学习统计（M4）
│   ├── stores/
│   │   └── wordStore.js    # Pinia store（学习状态 + localStorage）
│   ├── utils/
│   │   ├── speech.js       # TTS / STT 封装（含降级处理）
│   │   └── quiz.js         # 出题逻辑（随机抽词、干扰项生成）
│   ├── App.vue             # 根组件，顶部导航 Tab
│   └── main.js
├── index.html
├── vite.config.js
└── package.json
```

### 5.3 localStorage 数据设计

|Key              |内容                                       |
|-----------------|-----------------------------------------|
|`lv_word_status` |`Map<id, {status, streak, lastReviewed}>`|
|`lv_quiz_history`|最近 20 次测验成绩（日期、得分、用时、错题 ids）             |
|`lv_streak`      |`{count, lastDate}` 连续学习天数               |
|`lv_settings`    |用户偏好（语速、每日目标词数、题型比例）                     |

-----

## 6. 页面与交互设计

### 6.1 整体布局

- 单页应用（SPA），顶部固定导航栏，三个主 Tab：📚 卡片 / ✏️ 测验 / 📊 统计
- 无需登录，直接进入学习
- 响应式：支持 375px（手机）→ 1440px（桌面）

### 6.2 卡片模式

- 中央单张卡片占屏幕主体
- 卡片上方：进度条 + 「第 X / N 张」+ 筛选下拉
- 卡片右上角：🔊 发音按钮（常驻）
- 翻转后底部浮现：✓ 记住了 | ✗ 没记住
- 移动端：左右滑动翻页（左滑=下一张，右滑=上一张）

### 6.3 测验模式

- Step 1 配置弹窗 → Step 2 答题界面 → Step 3 成绩报告
- 答题界面：顶部进度条 + 题目区 + 选项/输入区 + 变音符辅助键盘
- 每题答完显示 1.5s 反馈色后自动跳下一题

-----

## 7. 非功能需求

### 7.1 性能

- 首屏加载 < 2 秒（Vite 打包 + Cloudflare 全球 CDN）
- 词库 JSON < 100KB，一次加载后缓存内存中

### 7.2 浏览器兼容性

|浏览器        |支持程度  |备注                 |
|-----------|------|-------------------|
|Chrome 90+ |✅ 完全支持|TTS + 跟读均可用，主力目标浏览器|
|Firefox 88+|🟡 部分支持|TTS 可用，跟读不支持       |
|Safari 14+ |🟡 部分支持|TTS 可用，跟读不支持       |
|移动端 Chrome |✅ 完全支持|推荐移动端使用 Chrome     |

-----

## 8. 部署方案：Cloudflare Pages + 自定义域名

你已有 Cloudflare 账号和自己的域名，是最省事的部署方案：免费、全球 CDN、域名绑定无缝，DNS 已在 Cloudflare 无需额外配置。

### 8.1 为什么选 Cloudflare Pages

|特性      |说明                             |
|--------|-------------------------------|
|免费额度    |每月 500 次构建，无限带宽，个人项目完全够用       |
|全球 CDN  |300+ 节点，静态资源加载极快               |
|自动 HTTPS|绑定域名后自动签发 SSL 证书               |
|Git 集成  |push 代码自动触发构建部署                |
|域名集成    |域名已在 Cloudflare DNS，绑定子域名只需 1 步|

### 8.2 部署流程

**Step 1：确认本地构建**

```bash
npm run build
# 产物在 dist/ 目录，确认无报错
```

**Step 2：推送到 GitHub**

```bash
git init
git add .
git commit -m "init: le-vocabulaire"
git remote add origin https://github.com/你的用户名/le-vocabulaire.git
git push -u origin main
```

**Step 3：Cloudflare Pages 创建项目**

1. Cloudflare Dashboard → Workers & Pages → Create application → Pages
1. 选 Connect to Git，授权 GitHub，选择仓库
1. 构建配置：

|配置项                   |填写内容           |
|----------------------|---------------|
|Framework preset      |Vue            |
|Build command         |`npm run build`|
|Build output directory|`dist`         |
|Root directory        |`/`（默认）        |

1. 点击「Save and Deploy」，约 1-2 分钟完成，获得临时域名 `*.pages.dev`

**Step 4：绑定自定义域名**

1. 进入项目 → Custom domains → Set up a custom domain
1. 输入子域名，如 `french.yourdomain.com`
1. 因域名已托管在 Cloudflare DNS，系统自动添加 CNAME，点确认即生效（< 1 分钟）
1. SSL 证书自动签发，HTTPS 无需额外配置

**Step 5：后续更新**

```bash
# 每次修改代码只需：
git add .
git commit -m "feat: 更新词库"
git push
# Cloudflare Pages 自动检测并重新构建，约 1-2 分钟上线
```

### 8.3 SPA 路由说明

本项目不使用 Vue Router，所有页面切换通过组件条件渲染实现，因此**不需要** `_redirects` 文件。

### 8.4 推荐子域名

|域名                     |适用场景         |
|-----------------------|-------------|
|`french.yourdomain.com`|推荐，语义清晰      |
|`vocab.yourdomain.com` |备选，未来可扩展其他语言 |
|`learn.yourdomain.com` |备选，可做学习工具集合入口|

-----

## 9. 开发里程碑

|阶段|优先级|目标      |交付物                                               |
|--|---|--------|--------------------------------------------------|
|P0|必须 |项目基础    |Vite + Vue 3 初始化，words.json，localStorage 工具函数     |
|P1|必须 |卡片模式（M1）|FlashCard 组件，翻转动画，掌握状态持久化                         |
|P2|必须 |发音模块（M2）|TTS 播放封装，语速切换，跟读识别，降级处理                           |
|P3|必须 |测验模式（M3）|选择题 + 拼写题，变音符键盘，成绩报告                              |
|P4|增值 |学习统计（M4）|今日进度、掌握率、Streak 天数                                |
|P5|打磨 |移动端 + 部署|滑动手势，响应式微调，`_redirects`，Cloudflare Pages 上线 + 绑定域名|

-----

## 10. 后续迭代（当前版本不做）

- 间隔重复算法（SM-2）：根据遗忘曲线自动安排复习计划
- 用户自定义单词（需考虑 localStorage 存储上限）
- 暗黑模式
- 升级 TTS 方案（Google Cloud TTS，音质更佳）
- PWA 安装到桌面

-----

*文档结束 · v1.3 · 2026-03*
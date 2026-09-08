# 屏幕自适应尺寸与容器规范

本文档记录当前前端项目中与屏幕自适应相关的主要尺寸设置，重点覆盖 `container-middle`、其他容器类、Tailwind 断点、常见组件尺寸策略，以及后续修改时需要注意的风险点。

## 核心文件

- `tailwind.config.js`：定义全局 Tailwind 扩展、`.container-middle` / `.container-small` / `.container-mini` 等自定义容器。
- `src/style/tailwind.css`：定义全局 Tailwind 层、`--header-bottom`、基础工具类。
- `src/style.css`：全局 reset、`box-sizing`、iOS 输入框字号保护。
- 高频使用组件：`src/layouts/Header.vue`、`src/layouts/Footer.vue`、`src/components/CommonBanner.vue`、`src/components/Shop/ProductCardsGrid.vue`、`src/components/Shop/ProductCard.vue`、`src/components/Sale/SaleFilter.vue`。

## Tailwind 断点

项目没有覆盖 Tailwind 默认断点，因此默认断点仍然可用：

| 前缀 | 最小宽度 | 当前项目里的典型用途 |
| --- | ---: | --- |
| `sm` | `640px` | 手机到小平板的间距、图片缩略图尺寸、表单布局微调 |
| `md` | `768px` | 平板布局、部分过滤栏/轮播可见数量切换 |
| `lg` | `1024px` | 大平板/小桌面布局、banner 高度、模块间距 |
| `xl` | `1280px` | 桌面导航、桌面页脚、商品详情桌面三栏布局 |
| `2xl` | `1536px` | Header logo、搜索框等超宽桌面微调 |

此外，项目使用了一些 Tailwind arbitrary breakpoint：

- `min-[650px]`：Footer 的单列/两列切换点。
- `min-[1028px]`：Reviews 新列表中过滤栏显示控制。
- `max-[649px]`、`max-[420px]` 等：局部移动端细节修正。

建议：新增全局断点前优先复用默认断点；只有组件确实存在视觉临界宽度时，再使用 arbitrary breakpoint。

## 容器类

### `.container-middle`

定义位置：`tailwind.config.js`

当前配置：

```js
'.container-middle': {
  maxWidth: '1520px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1rem',
  paddingRight: '1rem',
  '@screen md': {
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
  },
  '@screen lg': {
    paddingLeft: '2rem',
    paddingRight: '2rem',
  },
  '@screen xl': {
    paddingLeft: '3rem',
    paddingRight: '3rem',
  },
  '@media (min-width: 1440px) and (max-width: 1599px)': {
    paddingLeft: '6rem',
    paddingRight: '6rem',
  },
  '@media (min-width: 1600px)': {
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
}
```

行为说明：

| 屏幕宽度 | 容器外宽 | 左右 padding | 内容可用宽度估算 |
| --- | ---: | ---: | ---: |
| `<768px` | `100%` | `16px` | `viewport - 32px` |
| `768px - 1023px` | `100%` | `24px` | `viewport - 48px` |
| `1024px - 1279px` | `100%` | `32px` | `viewport - 64px` |
| `1280px - 1439px` | `100%` | `48px` | `viewport - 96px` |
| `1440px - 1599px` | `100%` | `96px` | `viewport - 192px` |
| `>=1600px` | `min(1520px, viewport)` | `16px` | `container - 32px` |

用途：

- 当前 Vue 源码中 `container-middle` 是主容器，扫描到约 124 次使用。
- 常用于页面主体、商品详情页、Sale 页面、Reviews、Footer、用户中心、Checkout 等。
- 适合大多数页面主内容，因为它提供统一最大宽度、居中和响应式左右留白。

注意点：

- `1440px - 1599px` 被单独加大 padding 到 `96px`，这是笔记本宽度的重点适配。
- `1600px` 开始 padding 会从 `96px` 回到 `16px`，视觉上会出现一次横向空间跳变：内容区域从约 `1407px`（1599 宽时）变为 `1488px`（1600 宽且容器 1520 时）。
- 如果某个模块在 `1440px - 1599px` 依赖非常宽的内容区，可能会被这段 padding 压窄。

### `.container-small`

定义：

```js
'.container-small': {
  maxWidth: '1320px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1rem',
  paddingRight: '1rem',
}
```

用途：

- 当前主要在 `src/views/Sale-backup.vue` 使用。
- 宽度小于 `container-middle`，适合较窄的旧版列表或内容页。

### `.container-mini`

定义：

```js
'.container-mini': {
  maxWidth: '1200px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1rem',
  paddingRight: '1rem',
}
```

用途：

- 当前主要用于 `src/views/Sofas/MaggisCollection.vue`、`src/views/Testimonials.vue` 和 Reviews 旧样式标题。
- 适合正文密度较高、需要收窄阅读宽度的模块。

### Tailwind `.container`

`tailwind.config.js` 中也扩展了 Tailwind 内置 `container`：

```js
container: {
  center: true,
  padding: '1rem',
  screens: {
    xl: '1720px',
  },
}
```

用途：

- Header 内部导航：`src/layouts/Header.vue`
- Trade hero 内部文案：`src/views/Trade.vue`
- 少数媒体展示组件：`HomeImageGallery.vue`、`VideoGallery.vue`

注意：`.container` 与 `.container-middle` 不是同一个体系。`.container` 最大宽度可到 `1720px`，比 `container-middle` 更宽，适合 Header 这类需要更大横向空间的区域。

## 全局尺寸变量

`src/style/tailwind.css` 定义：

```css
:root {
  --header-bottom: 102px;
}
```

含义：

- Header 由 `28px` 公告栏 + `74px` 主导航组成，总高度为 `102px`。
- 页面常用 `pt-[var(--header-bottom,102px)]` 给固定头部预留顶部空间。
- 商品详情页、Sale 页、部分政策页会用它计算 sticky top 或滚动锚点。

修改 Header 高度时，必须同步检查：

- `--header-bottom`
- `Header.vue` 中公告栏 `h-[28px]` 与主导航 `h-[74px]`
- `SaleFilter.vue` 中 `sticky top-[74px]` 和 `STICKY_TOP_OFFSET = 74`
- 商品详情页中的 `xl:top-[calc(var(--header-bottom,102px)+24px)]`

## 常见组件尺寸策略

### Header

文件：`src/layouts/Header.vue`

- 公告栏高度：`28px`
- 主导航高度：`74px`
- 桌面导航从 `xl` (`1280px`) 开始显示；移动端工具栏在 `xl:hidden` 下显示。
- 桌面 logo：`180px` / `190px` / `230px` 等按 `sm`、`xl`、`2xl` 调整。
- 移动端菜单抽屉：`size="min(86vw, 380px)"`，最大不超过 `380px`。

### Footer

文件：`src/layouts/Footer.vue`

- `<650px`：单列折叠。
- `650px - 1279px`：两列平板布局。
- `>=1280px`：桌面 flex 横向布局，列宽分别约 `260px`、`320px`、`356px`，订阅区 flex 填充。
- JS 里用 `window.matchMedia('(min-width: 1280px)')` 同步桌面展开状态。

### CommonBanner

文件：`src/components/CommonBanner.vue`

- 桌面端从 `xl` 开始显示 PC banner，图片使用 `w-full h-auto object-contain`。
- 移动端 banner 使用固定最小高度：
  - 默认 `min-h-[480px]`
  - `sm:min-h-[620px]`
  - `lg:min-h-[720px]`
- 标题大量使用 `clamp()`，例如 `text-[clamp(54px,14vw,88px)]`，让 banner 文案随屏幕渐变。
- Home video banner 通过一张透明占位图片撑开真实图片比例，再用绝对定位的视频/图片覆盖。

### 商品列表网格

文件：`src/components/Shop/ProductCardsGrid.vue`

当前规则：

- `<640px`：1 列，`gap: 32px`
- `640px - 1279px`：2 列，`gap: clamp(16px, 3vw, 28px)`
- `>=1280px`：3 列，每列固定 `420px`，`justify-content: space-between`

风险点：

- `>=1280px` 时三列固定宽度合计 `1260px`。
- `container-middle` 在 `1280px` 宽时内容区约 `1184px`，在 `1440px` 宽时内容区约 `1248px`，都小于 `1260px`。
- 因此 `1280px - 1451px` 附近可能出现横向溢出或布局挤压。若要优化，可考虑将桌面列改为 `repeat(3, minmax(0, 420px))` 或在 `>=1280px` 先保持 2 列，到更宽屏再切 3 列。

### 商品卡片

文件：`src/components/Shop/ProductCard.vue`

- 桌面卡片固定总高 `450px`。
- 桌面图片区域固定 `252px`。
- `<1280px` 后卡片改为 flex 纵向布局，图片用 `aspect-ratio: 14 / 9`，卡片高度自然撑开。
- `<640px` 时 wrapper 和 shell 都使用 `height: auto`。
- 颜色选择器和标题区域大量使用 `min-width: 0`、`overflow-hidden`、`line-clamp` 防止文本或色块撑爆布局。

### 商品详情页

文件：`src/views/Shop/ProductDetail.vue`

- 页面顶部用 `pt-[var(--header-bottom,102px)]` 避开固定 Header。
- 核心布局在 `xl` 之前为单列；`xl` 起切为三栏：
  - 缩略图栏：`106px`
  - 主图栏：`590px`
  - 信息栏：`minmax(280px, 1fr)`
- 主图移动端使用 `aspect-square`；桌面端固定 `590px` 高，并 sticky。
- 缩略图尺寸随断点变化：`72px`、`86px`、`96px`、`106px`。

### Sale Filter

文件：`src/components/Sale/SaleFilter.vue`

- 外层 `sticky top-[74px]`，跟 Header 主导航高度绑定。
- 未 sticky 时外层使用 `container-middle`；sticky 后表面宽度变为 `100%`，内部再按状态套 `container-middle`。
- 移动端按钮、字号、chip 宽高大量使用 `clamp()`，例如：
  - `min-h-[clamp(40px,5vw,50px)]`
  - `text-[clamp(10px,4vw,12px)]`
  - `w-[clamp(76px,23vw,100px)]`
- 桌面过滤栏在 `md` 起显示；额外过滤面板使用 `md:block lg:hidden`，也就是主要服务平板宽度。

### 购物车侧边栏

文件：`src/components/ShoppingCart/ShoppingCartSide.vue`

- Element Plus drawer 基础 `size="90vw"`。
- 类名里同时出现 `!w-[90vw]`、`!max-w-[327px]`、`sm:!w-[420px]`、`!max-w-none`。
- 这组类表达的意图大概率是：手机接近 `90vw`，小屏上限约 `327px`，`sm` 以上宽度约 `420px`。

注意：`!max-w-[327px]` 和 `!max-w-none` 同时存在，实际优先级受 Tailwind 生成顺序影响。后续若整理这里，建议改成更明确的断点类，避免最大宽度互相抵消。

### 轮播组件

文件：`src/components/Slider/BaseSlider.vue`、`src/components/Slider/MediaSlider.vue`

`BaseSlider` 默认可见数量：

- `>=1024px`：4 个
- `>=768px`：3 个
- `<768px`：2 个

`MediaSlider` 会覆盖部分规则：

- 图片数量为 2 或 3 且全是图片时，直接按实际数量展示。
- `<768px` 强制展示 2 个，避免单个媒体卡过宽。
- 未传 `visibleCount` 的桌面默认展示 3 个。
- `stackOnMobile` 在 `<768px` 时把轮播轨道变为纵向/单项宽度，主要用于带 caption 的媒体内容。

## 视口单位与 `clamp()`

项目常见模式：

- `clamp(min, vw, max)`：用于标题、按钮、间距、移动端过滤栏。
- `h-[100vw]`：用于 Trade 页面移动端 hero，让高度等于屏幕宽度。
- `min-h-screen` / `min-h-[calc(100vh_-_...)]`：用于整屏或首屏模块。
- `max-h-[94dvh]` / `84dvh`：Reviews 表单弹窗使用动态视口高度，适配移动端浏览器地址栏变化。
- `aspect-square` / `aspect-[x/y]`：用于商品图、媒体卡、优惠券卡等固定比例元素。

建议：

- 图片/卡片优先用 `aspect-ratio` 保持比例，而不是只写固定高度。
- 文案字号使用 `clamp()` 时要设置合理上限，避免桌面过大。
- 移动端高度优先考虑 `dvh`，尤其是弹窗、抽屉、全屏交互。

## 修改建议与检查清单

调整 `container-middle` 前检查：

- 商品列表三列宽度是否仍能放进内容区。
- Header、Footer 是否需要同步横向留白。
- Sale sticky filter 未吸顶/吸顶状态是否仍对齐。
- 商品详情页三栏布局是否在 `1280px - 1440px` 之间溢出。

新增页面时建议：

- 页面主内容默认使用 `container-middle`。
- 长正文/窄内容使用 `container-mini`。
- Header 类、全屏 banner、需要超宽排布的模块才考虑 `.container` 或自定义最大宽度。
- 移动端优先从 1 列布局开始，再逐步加 `sm` / `md` / `lg` / `xl`。
- 对商品卡、优惠券、视频、图片墙这类固定比例内容，优先使用 `aspect-*`。

QA 建议覆盖宽度：

- `375px`：常见手机。
- `390px` / `430px`：iPhone 主流宽度。
- `768px`：平板竖屏。
- `1024px`：平板横屏 / 小桌面。
- `1280px`：桌面布局刚切换点，重点检查商品三列。
- `1440px`：笔记本重点适配宽度，当前 `container-middle` padding 最大。
- `1536px`：接近 2xl，检查 Header 右侧空间。
- `1600px`：`container-middle` padding 恢复点，重点检查视觉跳变。
- `1920px`：常规大屏。

## 当前结论

当前项目的主响应式策略是：页面外层用 `container-middle` 控制全局最大宽度与留白，组件内部再用 Tailwind 默认断点、局部 arbitrary breakpoint、`clamp()`、`aspect-ratio`、`matchMedia` 做细节适配。

整体体系已经比较完整，但需要重点留意两个地方：

- `container-middle` 在 `1440px - 1599px` 与 `>=1600px` 之间存在明显 padding 切换。
- 商品列表桌面三列固定 `420px`，在部分刚进入桌面布局的宽度下可能超过 `container-middle` 的实际内容宽度。

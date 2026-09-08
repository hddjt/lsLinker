/**
 * 动态效果配置
 *
 * `glass-rain`（雨打玻璃）本质是一个 WebGL2 全屏叠层：
 * 项目侧只负责承载 canvas 并透传参数，真正的光影管线在 npm 包 `raindrop-fx` 中
 * （多 Pass：雨滴高度图 → 折射 + Lambertian 阴影 + Blinn-Phong 高光）。
 *
 * 参数说明：
 * - `opts` 直接透传给 `raindrop-fx` 的 `RaindropFX` 构造器 / `options`
 * - `opts.background` 为折射用的底色，运行时会绘制成与页面背景相近的 canvas 贴图
 * - `css` 作用在 canvas 上，用于与底层 CSS 背景合成视觉微调
 */
export const glassRainEffect = {
  id: 6,
  type: 'glass-rain',
  name: '雨打玻璃',
  enabled: true,
  opts: {
    /* 折射基础强度 */
    refractBase: 0.35,
    /* 折射随雨滴大小缩放 */
    refractScale: 0.65,
    /* 雨滴融合混合模式：smoother | harder */
    raindropCompose: 'smoother',
    /* 雨滴密度与尺寸：深色背景下默认值会偏淡 */
    spawnInterval: [0.06, 0.12],
    spawnSize: [24, 56],
    spawnLimit: 1400,
    dropletsPerSeconds: 900,
    dropletSize: [6, 18],
    smoothRaindrop: [0.94, 0.985],
    /* 背景高斯模糊步数（桌面端） */
    backgroundBlurSteps: 3,
    /* 移动端模糊步数（降低开销） */
    backgroundBlurStepsMobile: 2,
    /* 关闭包自带雾化层，避免整体发灰 */
    mist: false,
    /* 折射背景：深色纯色贴图颜色 */
    background: '#04131d',
    /* 深色界面需要一点高光，否则雨滴只剩很浅的暗纹 */
    raindropDiffuseLight: [0.24, 0.38, 0.36],
    raindropShadowOffset: 0.66,
    raindropSpecularLight: [0.28, 0.42, 0.38],
    raindropSpecularShininess: 180,
    raindropLightBump: 0.72,
  },
  css: {
    opacity: 0.78,
    filter: 'saturate(1.18) contrast(1.1)',
  },
}

export const effects = [glassRainEffect]

export function getEffect(type) {
  return effects.find((e) => e.type === type) ?? null
}

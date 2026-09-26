# 圣诞街角 · Three.js 微缩商店

## 最简单的打开方法

双击本文件夹中的「圣诞商店.html」，选择 Edge 或 Chrome 打开即可。这个文件已包含 Three.js、控制器、样式和全部场景代码，不需要安装程序、不需要启动服务，也不依赖网络图片或字体。浏览器需要支持 WebGL，并开启硬件加速。

## 当前预览

正在运行的开发预览：http://localhost:3000/
下次需要修改项目时，双击「启动预览.cmd」，使用窗口显示的 Local 地址。预览期间保持窗口打开。

## 操作

- 电脑：鼠标左键拖动旋转，滚轮缩放。
- 手机：单指旋转，双指捏合缩放。
- 点击「初始视角」复位。
- 键盘：先聚焦场景，再用左右方向键旋转，+ / - 缩放，Home 复位。

## 第一版内容

正方形雪地底座、木结构商店、积雪坡屋顶、烟囱、玻璃橱窗、店内陈列、招牌、红白遮阳棚、绿色店门、花环、姜饼人、圣诞树、礼盒、邮筒、围栏和暖光路灯。全部由 Three.js 几何体和代码纹理构建。复杂人物和动物动画尚未添加。

## 后续修改

- scene/christmas.ts：共享的三维模型、灯光和交互。
- app/page.tsx：开发预览页面。
- app/globals.css：页面排版和样式。
- scene/standalone.ts：独立 HTML 入口。
- scripts/export-html.mjs：将场景打包为一个 HTML 文件。

修改后运行 `node scripts/export-html.mjs` 重新生成「圣诞商店.html」。独立 HTML 是导出快照，不会随源文件自动更新。

验证：TypeScript 检查、生产构建、预览 HTTP 响应均通过。已生成约 600 KB 的独立 HTML。没有执行浏览器截图或自动交互测试。

当前开发框架的安装审计曾报告 11 项依赖漏洞（含 8 项高危），未执行强制升级；正式发布开发项目之前应处理审计。独立 HTML 不包含开发服务器。

昼夜切换：右上角按钮可切换白天与夜晚，光照柔和过渡。夜晚店内、招牌、屋顶与四周灯串发光。后墙涂鸦已移除，雪人新增红色毛线帽，侧招牌改为 Merry Christmas。系统开启减少动态效果时会直接切换。

天气：晴天飘枫叶并逐渐铺满棕红落叶；阴天云层飘入并减弱阳光；雪天持续飘雪，地面与坡屋顶形成连续雪层。天气和昼夜可独立组合，切换后的地面覆盖需要数秒逐渐完成。

阴天更新：云团不规则分散漂浮，室外圣诞树、花圈与侧面吊牌轻微风摆，伴随小雨、地面涟漪和淡水印。切换后逐渐退场，减少动态效果设置会停用持续运动。

角色：门前偏右新增静态低多边形驯鹿，棕色毛发、奶油色口鼻和肚皮、绿色围巾、红绳金铃与分叉鹿角。脚底随地面雪层高度贴合，未添加角色动作。

Typography: reference-style alternatives, not the original commercial font files. UI: Jacquarda Bastarda 9; shop signs: Berkshire Swash. Source: Google Fonts. Fonts are embedded for offline use; OFL licenses are in public/fonts.

Latest typography: Henny Penny for the title and Coiny for weather/time/reset controls and the footer shop name; reference-style open-source alternatives, embedded for offline use. Shop sign lettering remains unchanged. Reindeer now has only a white handlebar moustache.

驯鹿互动：白天晴天默认立即挥手5秒，跟随鼠标/触摸；随后走到门口开门、进店，在橱窗内看向外面10秒，再出门返回，休息5秒重复。切换阴天、雪天或夜晚停止并回到起点，回到白天晴天重新开始。Reset view只调整相机，刷新页面从第一次挥手开始。

## Current reindeer routine
Day + Sunny starts at the indoor window: exit through the door, walk to the street, wave for 7 seconds while tracking pointer/touch, show the warm pixel dialogue for 10 seconds and fade for 0.8 seconds, return indoors, watch through the window for 5 seconds, then repeat. This replaces all previous route timings. The right arm rotates around a fixed shoulder socket; both hooves use the modeled floor and stair heights.


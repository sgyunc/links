# FRDLINK

个人博客友链（友情链接）展示页。纯静态实现，无需后端即可部署到任意静态托管（GitHub Pages、Vercel、自有服务器等）。

## 文件结构

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面主体：友链卡片、分类/年份筛选、搜索、状态检测、明暗模式、复制友链、申请表单 |
| `links.js` | 友链数据（名称、网址、简介、头像、分类、加入年份） |
| `submit.php` | 友链申请接收接口（可选，需 PHP 空间；部署后申请直接入库） |
| `applications.json` | 申请接口自动生成的待审列表（部署 submit.php 后出现） |
| `favicon.ico` | 站点图标 |
| `links.js.bak` | 早期数据备份（确认无误后可删除） |

## 功能特性

- 友链卡片网格展示（头像懒加载 + 失败自动兜底：先尝试站点 `/favicon.ico`，再落占位图）
- **分类筛选**（博客/导航/论坛/其他）+ **年份筛选** 双标签行，标签支持键盘方向键
- 关键词实时搜索（250ms 防抖），无结果时友好提示
- 站点在线状态检测（10 秒超时、20 分钟本地缓存），显示**最近检测时间与响应耗时**，区分在线/失联/检测失败
- **只看失联筛选 + 失联自动排后**：一键筛出失联站点，在线站点始终排前面，方便定期清理
- **单卡手动刷新**：每张卡片可绕过缓存立即重新检测单个站点
- **复制友链**：单卡复制 Markdown（`[站名](网址)`）；导航栏**一键复制全部友链**整份列表
- **明暗模式**：右上角月亮/太阳按钮切换，跟随系统偏好，选择持久化（图标为内联 SVG，无外部依赖）
- 友链申请：URL/邮箱格式校验、**已收录网站查重**、**蜜罐 + 30 秒限频防垃圾**；通过在线接口（默认 `api.frdlink.link` 的 `submit.php`）直接 POST 入库，**不支持邮件客户端方式**
- **SEO 预渲染**：内置无脚本静态友链列表（`<noscript>`），无 JS 环境也能看到全部内容
- 分享优化：内置 Open Graph / description / theme-color meta
- 外部链接统一 `rel="noopener noreferrer"`，XSS 输出转义

## 使用说明

1. **修改友链数据**：编辑 `links.js`，按现有格式追加/删除条目。字段说明：
   - `name`：站点名称
   - `url`：站点地址（建议 https）
   - `desc`：站点简介
   - `avatar`：站点头像图片 URL
   - `category`：分类（博客 / 导航 / 论坛 / 其他，可自定义）
   - `joinYear`：加入年份（用于年份筛选）
2. **站点配置**：编辑 `index.html` 顶部的「站点配置」区块：
   - `API_KEY` / `PROXY_API`：站点在线状态检测接口，默认 `https://api.frdlink.link/links/link_checker.php`（GET `?action=check&key=...&url=...`，返回含 `alive` 字段的 JSON）
   - `SUBMIT_URL`：申请提交接口（**必填**，默认 `https://api.frdlink.link/links/submit.php`，POST JSON，返回 `{ok, message}`）。**不支持邮件方式**：留空 `""` 时申请按钮会提示"提交功能暂未配置"；也可改为 Formspree 等第三方表单服务地址
   - 两个接口均已部署在 `api.frdlink.link`（检测 = `links/link_checker.php`，提交 = `links/submit.php`，CORS 已开启，静态页可直接跨域调用）
3. **本地预览**：直接用浏览器打开 `index.html`，或运行 `npx serve .` 启动本地服务。提交功能依赖在线接口，本地打开时可直接调用远程接口测试。
4. **部署方式一：纯静态 + 远程接口（推荐）**：`index.html` + `links.js` + `favicon.ico` 上传到任意静态托管（GitHub Pages、Vercel 等），提交与检测都走 `api.frdlink.link` 的远程接口（CORS 已开），无需任何后端。
5. **部署方式二：静态页面 + 自建 PHP**：页面主体放纯静态托管，把 `submit.php` 单独上传到你的 PHP 空间，并把 `index.html` 的 `SUBMIT_URL` 改为该 PHP 的完整地址。`submit.php` 已开启跨域；建议把 `links.js` 也同步上传到 PHP 空间同目录，保证服务端查重准确。
6. **部署方式三：同目录 PHP**：`index.html` 与 `submit.php` 同目录部署在 PHP 空间，`SUBMIT_URL` 填 `"submit.php"`，申请自动写入同目录 `applications.json`。
   - 方式二/三共用待审列表 `applications.json`：定期查看、确认后把条目加入 `links.js` 即可；可选编辑 `submit.php` 顶部配置开启 `mail()` 邮件通知（这是管理员收通知，与页面提交方式无关）。

## 安全提示

- 页面为纯静态站点，`API_KEY` 会明文暴露在前端源码中。这是静态站直连第三方检测接口的固有限制；若该接口有配额或费用，请改为服务端代理转发（前端只调用不含 key 的接口）。
- 提交接口 `SUBMIT_URL` 若指向第三方表单服务，注意其防垃圾策略；申请内容默认未加密传输时请使用 https 地址。
- `submit.php` 已内置蜜罐、按 IP 限频、URL/邮箱校验与查重，但仍建议：定期查看 `applications.json` 人工确认后再加入 `links.js`；不要把它当作万能反垃圾方案，极端情况下可配合空间自带防火墙（如宝塔的 CC 防护）使用。

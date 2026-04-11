# Homepage (VitePress)

这个仓库已迁移为 VitePress 架构。

## 开发

```bash
npm install
npm run docs:dev
```

## 构建

```bash
npm run docs:build
npm run docs:preview
```

## 内容目录

- docs/index.md: 首页
- docs/blog/index.md: 博客
- docs/projects/index.md: 项目
- docs/.vitepress/config.mts: 站点配置
- docs/.vitepress/theme/custom.css: 自定义样式

## GitHub Pages 发布

如果使用 GitHub Actions，部署目录应为 `docs/.vitepress/dist`（由 `vitepress build docs` 生成）。

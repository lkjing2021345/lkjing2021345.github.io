# 博客写作目录

文章都写在 `content/post/` 下，一个 `.md` 文件就是一篇文章。

## 日常流程

```bash
cd ~/blog

# 1. 新建文章（自动生成 front matter，默认草稿）
tools/new-post.sh "我的新文章"

# 2. 写内容
nvim content/post/我的新文章.md

# 3. 本地预览（能看到草稿）
tools/preview.sh          # 打开 http://localhost:1313/

# 4. 发布：把 front matter 里的 draft 改成 false，然后
tools/publish.sh "post: 我的新文章"
```

推送后 GitHub Actions 会自动构建并部署到 <https://lkjing2021345.github.io/>，不需要本地生成 `public/`。

## Front matter 说明

```toml
+++
title = '文章标题'
date = '2026-11-07T10:00:00+08:00'
draft = false                 # true 时只在本地预览可见
image = '/img/fufu.jpg'       # 可选，文章头图
categories = ['技术']          # 可选
tags = ['Rust', '笔记']        # 可选
summary = '一句话摘要'         # 可选
+++
```

## 约定

- 文件名用中文/英文都行，会直接成为 URL 的一部分。
- 图片放 `static/img/`，正文里用 `/img/xxx.png` 引用。
- 数学公式用 `$...$` / `$$...$$`（主题已启用 KaTeX）。
- 代码块正常使用 ``` 围栏，标注语言即可高亮。

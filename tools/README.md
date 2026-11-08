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

## 插入图片

图片放 `static/img/`，正文里用 `/img/文件名` 引用（`static/` 本身不会出现在 URL 里）。

**方式一：命令行复制 + 自动生成 Markdown**

```bash
tools/add-image.sh ~/Pictures/screenshot.png
# 已复制 -> static/img/screenshot.png
# Markdown:  ![screenshot](/img/screenshot.png)
# 带图注:    {{< figure src="/img/screenshot.png" title="图片说明" >}}
```

把输出的那一行粘到文章里即可；重名会自动加 `-1`、`-2` 后缀。

**方式二：手动**，把图片丢进 `static/img/`（或 `static/illustration/`），然后写：

```markdown
![图片描述](/img/screenshot.png)
```

**带图注（推荐，主题会渲染成 figcaption）**

```markdown
{{< figure src="/img/screenshot.png" title="图 1：这里是图注" >}}
```

**文章专属图片（页面包）**：把文章改成文件夹形式也能放图，图片和 `index.md` 同级：

```
content/post/我的文章/
├── index.md
└── screenshot.png
```

正文里用相对路径 `![描述](screenshot.png)`。文章不多、图片较多时这种方式更好管理；否则用上面的 `static/img/` 就够了。

## 约定

- 文件名用中文/英文都行，会直接成为 URL 的一部分。
- 数学公式用 `$...$` / `$$...$$`（主题已启用 KaTeX）。
- 代码块正常使用 ``` 围栏，标注语言即可高亮。

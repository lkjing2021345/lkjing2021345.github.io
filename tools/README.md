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

### 最快：直接粘贴剪贴板里的图片

截图或复制图片后，不用先存文件：

- **在 nvim 里**：按 `<A-i>`（Alt+i，普通/插入模式都行）或 `<Space>ip`，
  图片自动存进 `static/img/pasted-时间戳.png`，并在文章末尾插入 `![](/img/...)`。
- **在终端里**：`bpaste`（= `tools/clipboard-image.sh`）打印 Markdown；
  `bpaste --append 文章.md` 直接追加到文章末尾；`bpaste --append-latest` 追加到最新修改的文章。
- 默认会把宽度超过 1600px 的图缩小，`--no-resize` 可关闭。

### 在 Obsidian 里编辑（Ctrl+V 直接粘贴）

仓库已经预置了 `.obsidian/app.json`，用它当 vault 打开即可：

1. Obsidian → 左下角「打开其他仓库」→「打开文件夹作为仓库」→ 选 `~/blog`
2. 直接把截图/图片 `Ctrl+V` 粘进文章，Obsidian 会自动：
   - 把图片存到 `static/img/`
   - 插入 `![](static/img/Pasted%20image%20....png)`
3. Hugo 侧有 `layouts/_markup/render-image.html`，会把 `static/img/...`、`../static/img/...` 统一改写成 `/img/...`，所以线上路径是对的，Obsidian 里也能正常预览。

预置的关键设置：附件目录 `static/img`、使用 Markdown 链接、新链接格式「仓库内绝对路径」。如果 Obsidian 里粘贴的图片没有进 `static/img`，检查「设置 → 文件与链接 → 新附件的默认位置」。

> 想让 Obsidian 的图片名也变成 `pasted-时间戳`，可以装社区插件 **Paste image rename**；不装也能正常用，只是名字是 `Pasted image 2026...`。

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

#!/usr/bin/env bash
# 新建一篇文章（默认 draft，只在本地预览可见）
# 用法: tools/new-post.sh "文章标题"
set -euo pipefail
cd "$(dirname "$0")/.."

if [ $# -lt 1 ]; then
  echo "用法: tools/new-post.sh \"文章标题\""
  exit 1
fi

title="$*"
date=$(date '+%Y-%m-%dT%H:%M:%S%:z')
slug=$(printf '%s' "$title" | tr ' /\\:*?"<>|' '-')
file="content/post/${slug}.md"

if [ -e "$file" ]; then
  echo "文章已存在: $file"
  exit 1
fi

mkdir -p content/post
cat > "$file" <<EOF
+++
title = '${title}'
date = '${date}'
draft = true
categories = ['技术']
tags = []
summary = ''
+++

在这里开始写正文。

EOF

echo "已创建: $file"
echo "写完把 draft 改成 false，再运行 tools/publish.sh 发布。"

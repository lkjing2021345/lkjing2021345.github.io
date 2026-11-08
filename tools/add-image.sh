#!/usr/bin/env bash
# 把本地图片复制进博客的 static/img/，并打印可直接粘贴的 Markdown
# 用法: tools/add-image.sh 图片1 [图片2 ...]
set -euo pipefail
cd "$(dirname "$0")/.."

if [ $# -lt 1 ]; then
  echo "用法: tools/add-image.sh 图片1 [图片2 ...]"
  exit 1
fi

mkdir -p static/img

for src in "$@"; do
  if [ ! -f "$src" ]; then
    echo "跳过（不是文件）: $src" >&2
    continue
  fi

  base=$(basename "$src")
  name="${base%.*}"
  ext="${base##*.}"
  dest="static/img/$base"
  i=1
  while [ -e "$dest" ]; do
    dest="static/img/${name}-${i}.${ext}"
    i=$((i + 1))
  done

  cp -- "$src" "$dest"
  url="/${dest#static/}"
  echo "已复制 -> $dest"
  echo "Markdown:  ![${name}](${url})"
  echo "带图注:    {{< figure src=\"${url}\" title=\"图片说明\" >}}"
  echo
done

#!/usr/bin/env bash
# 把剪贴板里的图片保存到 static/img/，并输出可插入文章的 Markdown
#
# 用法:
#   tools/clipboard-image.sh                 # 输出 ![](/img/pasted-xxx.png)
#   tools/clipboard-image.sh --url           # 只输出图片 URL
#   tools/clipboard-image.sh --append 文章.md  # 直接追加到指定文章末尾
#   tools/clipboard-image.sh --append-latest   # 追加到最新修改的文章末尾
#   tools/clipboard-image.sh --no-resize     # 不缩小图片（默认宽度上限 1600px）
set -euo pipefail
cd "$(dirname "$0")/.."

mode="markdown"
target_file=""
max_width=1600

while [ $# -gt 0 ]; do
  case "$1" in
    --url) mode="url"; shift ;;
    --append)
      target_file="${2:?--append 需要一个文件路径}"; shift 2 ;;
    --append-latest)
      target_file=$(ls -t content/post/*.md 2>/dev/null | head -1 || true)
      [ -n "$target_file" ] || { echo "content/post/ 里没有文章" >&2; exit 1; }
      shift ;;
    --no-resize) max_width=0; shift ;;
    -h|--help)
      sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "未知参数: $1" >&2; exit 1 ;;
  esac
done

# ---- 选择剪贴板后端 ----
if [ -n "${WAYLAND_DISPLAY:-}" ] && command -v wl-paste >/dev/null 2>&1; then
  backend="wayland"
  targets=$(wl-paste --list-types 2>/dev/null || true)
  clip_get() { wl-paste --type "$1" 2>/dev/null; }
elif [ -n "${DISPLAY:-}" ] && command -v xclip >/dev/null 2>&1; then
  backend="x11"
  targets=$(xclip -selection clipboard -t TARGETS -o 2>/dev/null || true)
  clip_get() { xclip -selection clipboard -t "$1" -o 2>/dev/null; }
else
  echo "没有可用的剪贴板工具（需要 xclip 或 wl-paste）" >&2
  exit 1
fi

mkdir -p static/img
stamp=$(date '+%Y%m%d-%H%M%S')
new_path() {
  local e="$1"
  local p="static/img/pasted-${stamp}.${e}"
  local i=1
  while [ -e "$p" ]; do p="static/img/pasted-${stamp}-${i}.${e}"; i=$((i + 1)); done
  printf '%s' "$p"
}

saved=""

# ---- 情况一：剪贴板里是图片数据 ----
if printf '%s\n' "$targets" | grep -qx 'image/png'; then
  saved=$(new_path png); clip_get image/png > "$saved"
elif printf '%s\n' "$targets" | grep -qx 'image/jpeg'; then
  saved=$(new_path jpg); clip_get image/jpeg > "$saved"
elif printf '%s\n' "$targets" | grep -qx 'image/gif'; then
  saved=$(new_path gif); clip_get image/gif > "$saved"
elif printf '%s\n' "$targets" | grep -qx 'image/bmp'; then
  saved=$(new_path png); clip_get image/bmp | magick png:- "$saved"
fi

# ---- 情况二：剪贴板里是图片文件（文件管理器里 Ctrl+C 的图片）----
if [ -z "$saved" ] && printf '%s\n' "$targets" | grep -qx 'text/uri-list'; then
  uri=$(clip_get text/uri-list | head -1 | tr -d '\r')
  case "$uri" in
    file://*)
      path=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.unquote(urllib.parse.urlparse(sys.argv[1]).path))' "$uri")
      case "${path,,}" in
        *.png|*.jpg|*.jpeg|*.gif|*.bmp|*.webp|*.svg)
          saved=$(new_path "${path##*.}"); cp -- "$path" "$saved" ;;
      esac ;;
  esac
fi

if [ -z "$saved" ]; then
  echo "剪贴板里没有图片（复制一张图或截图后再试）" >&2
  exit 1
fi

# ---- 缩小过大的图片，避免仓库变胖 ----
if [ "$max_width" -gt 0 ] && [ "${saved##*.}" != "svg" ] && command -v magick >/dev/null 2>&1; then
  w=$(magick identify -format '%w' "$saved" 2>/dev/null || echo 0)
  if [ "${w:-0}" -gt "$max_width" ]; then
    magick "$saved" -resize "${max_width}x>" "$saved"
    echo "已缩放到 ${max_width}px 宽" >&2
  fi
fi

url="/${saved#static/}"
markdown="![](${url})"

# ---- 输出 / 追加 ----
if [ -n "$target_file" ]; then
  # 保证图片单独成段
  [ -s "$target_file" ] && [ -n "$(tail -c 1 "$target_file")" ] && printf '\n' >> "$target_file"
  printf '\n%s\n' "$markdown" >> "$target_file"
  echo "已保存图片: $saved" >&2
  echo "已插入到: $target_file" >&2
fi

if [ "$mode" = "url" ]; then
  echo "$url"
else
  echo "$markdown"
fi

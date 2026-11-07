#!/usr/bin/env bash
# 提交并推送到 GitHub，推送后 GitHub Actions 会自动构建并部署 Pages
# 用法: tools/publish.sh ["提交说明"]
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "$(git status --porcelain)" ]; then
  echo "没有需要提交的改动。"
  exit 0
fi

# 提醒还有未发布（draft = true）的文章
drafts=$(grep -rl '^draft = true' content/post 2>/dev/null || true)
if [ -n "$drafts" ]; then
  echo "注意：以下草稿仍是 draft = true，不会出现在线上："
  echo "$drafts"
  echo
fi

msg="${1:-post: $(date '+%Y-%m-%d %H:%M') 更新博客}"
git add -A
git commit -m "$msg"
git push origin main

echo
echo "已推送。GitHub Actions 构建约 1~2 分钟，之后访问 https://lkjing2021345.github.io/"

#!/usr/bin/env bash
# 本地预览（包含 draft 草稿），默认 http://localhost:1313/
# 用法: tools/preview.sh [端口]
set -euo pipefail
cd "$(dirname "$0")/.."

port="${1:-1313}"
hugo server --buildDrafts --navigateToChanged --port "$port"

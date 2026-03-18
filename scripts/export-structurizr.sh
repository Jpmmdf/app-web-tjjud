#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
WORKSPACE_FILE="$ROOT_DIR/docs/architecture/structurizr/workspace.dsl"
OUTPUT_DIR="$ROOT_DIR/docs/assets/structurizr"

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

docker run --rm \
  -v "$ROOT_DIR:/workspace" \
  structurizr/cli \
  export \
  -w /workspace/docs/architecture/structurizr/workspace.dsl \
  -f static \
  -o /workspace/docs/assets/structurizr

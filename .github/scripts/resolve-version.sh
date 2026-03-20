#!/usr/bin/env bash
set -euo pipefail

PREFIX="${1:?prefix is required}"
BUMP_LEVEL="${2:-patch}"
COMMIT_REF="${3:-HEAD}"
COMMIT_SHA="$(git rev-parse "$COMMIT_REF")"
TAG_PATTERN="${PREFIX}v*"

commit_tag="$(git tag --points-at "$COMMIT_SHA" --list "$TAG_PATTERN" | LC_ALL=C sort -V | tail -n 1 || true)"

if [[ -n "$commit_tag" ]]; then
  echo "version=${commit_tag#${PREFIX}v}"
  echo "tag_name=$commit_tag"
  echo "reused=true"
  exit 0
fi

latest_tag="$(git tag --list "$TAG_PATTERN" | LC_ALL=C sort -V | tail -n 1 || true)"

if [[ -z "$latest_tag" ]]; then
  next_version="1.0.0"
else
  latest_version="${latest_tag#${PREFIX}v}"

  if [[ ! "$latest_version" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    echo "::error::A tag $latest_tag nao segue o formato semantico esperado." >&2
    exit 1
  fi

  major="${BASH_REMATCH[1]}"
  minor="${BASH_REMATCH[2]}"
  patch="${BASH_REMATCH[3]}"

  case "$BUMP_LEVEL" in
    patch)
      patch=$((patch + 1))
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    *)
      echo "::error::Nivel de incremento invalido: $BUMP_LEVEL" >&2
      exit 1
      ;;
  esac

  next_version="${major}.${minor}.${patch}"
fi

echo "version=$next_version"
echo "tag_name=${PREFIX}v$next_version"
echo "reused=false"

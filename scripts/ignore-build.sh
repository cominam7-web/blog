#!/bin/bash

# Vercel Ignored Build Step
# src/posts/ 내 MD 파일만 변경된 경우 빌드를 스킵합니다.
# 종료코드 0 = 빌드 스킵, 1 = 빌드 진행

echo "🔍 Checking if build is needed..."

# 변경된 파일 목록 확인
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD 2>/dev/null)

if [ -z "$CHANGED_FILES" ]; then
  echo "✅ No changed files detected. Proceeding with build."
  exit 1
fi

echo "Changed files:"
echo "$CHANGED_FILES"

# src/posts/ 외의 파일이 변경되었는지 확인
NON_POST_CHANGES=$(echo "$CHANGED_FILES" | grep -v '^src/posts/' | grep -v '^blog-app/src/posts/')

if [ -z "$NON_POST_CHANGES" ]; then
  echo "⏭️ Only post MD files changed. Skipping build."
  exit 0
else
  echo "🔨 Code changes detected. Proceeding with build."
  echo "Non-post changes:"
  echo "$NON_POST_CHANGES"
  exit 1
fi

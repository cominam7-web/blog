#!/bin/bash

# Vercel Ignored Build Step
# Make.com이 4개 카테고리(h,l,e,t)를 순차 커밋할 때
# 마지막 커밋(-t.md)에서만 빌드하고, 나머지는 스킵합니다.
# 코드 변경(컴포넌트, 설정 등)은 항상 빌드합니다.
# 종료코드 0 = 빌드 스킵, 1 = 빌드 진행

echo "Checking if build is needed..."

CHANGED_FILES=$(git diff --name-only HEAD^ HEAD 2>/dev/null)

if [ -z "$CHANGED_FILES" ]; then
  echo "No changed files detected. Proceeding with build."
  exit 1
fi

echo "Changed files:"
echo "$CHANGED_FILES"

# 코드 변경(src/posts 외)이 있으면 무조건 빌드
NON_POST_CHANGES=$(echo "$CHANGED_FILES" | grep -v '^src/posts/')

if [ -n "$NON_POST_CHANGES" ]; then
  echo "Code changes detected. Proceeding with build."
  exit 1
fi

# posts만 변경된 경우: 어떤 포스트든 빌드 진행
# (Make.com에서 일부 route만 성공해도 빌드 되도록)
echo "Post changes detected. Proceeding with build."
exit 1

#!/usr/bin/env bash

set -uo pipefail

pass_count=0
warning_count=0
failure_count=0

report_pass() {
  pass_count=$((pass_count + 1))
  printf '[통과] %s\n' "$1"
}

report_warning() {
  warning_count=$((warning_count + 1))
  printf '[경고] %s\n' "$1"
}

report_failure() {
  failure_count=$((failure_count + 1))
  printf '[실패] %s\n' "$1"
}

print_section() {
  printf '\n%s\n' "$1"
}

check_content() {
  file="$1"
  pattern="$2"
  description="$3"

  if grep -Eiq "$pattern" "$file"; then
    report_pass "$description"
  else
    report_failure "$description"
  fi
}

if ! repository_root="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  printf '[실패] Git 저장소 안에서 실행해야 합니다.\n'
  exit 1
fi

cd "$repository_root" || exit 1

printf '채용 파이프라인 보드 제출 상태를 검사합니다.\n'

print_section '1. 필수 파일'

for file in README.md PROMPTS.md DECISIONS.md AGENTS.md scripts/validate-submission.sh; do
  if [[ -f "$file" ]]; then
    report_pass "$file 파일이 있습니다."
  else
    report_failure "$file 파일이 없습니다."
  fi
done

print_section '2. README.md 필수 내용'

if [[ -f README.md ]]; then
  check_content README.md '실행 방법|설치 및 실행' '설치 및 실행 방법이 설명되어 있습니다.'
  check_content README.md '기술 스택' '선택한 기술 스택이 설명되어 있습니다.'
  check_content README.md 'MSW|Mock API|mock API' 'Mock API 방식이 설명되어 있습니다.'
else
  report_warning 'README.md가 없어 내용 검사를 건너뜁니다.'
fi

print_section '3. PROMPTS.md 기록 구조'

if [[ -f PROMPTS.md ]]; then
  check_content PROMPTS.md '프롬프트 원문|프롬프트 [0-9]+' '실제 프롬프트 기록 항목이 있습니다.'
  check_content PROMPTS.md 'AI 출력 요지' 'AI 출력 요지 항목이 있습니다.'
  check_content PROMPTS.md '리뷰 및 검증|리뷰 / 검증' '리뷰 및 검증 항목이 있습니다.'
else
  report_warning 'PROMPTS.md가 없어 내용 검사를 건너뜁니다.'
fi

print_section '4. DECISIONS.md 기록 구조'

if [[ -f DECISIONS.md ]]; then
  check_content DECISIONS.md '요구사항에 대한 가정' '모호한 요구사항에 대한 가정 항목이 있습니다.'
  check_content DECISIONS.md '완료하지 못한 기능' '완료하지 못한 기능 기록 항목이 있습니다.'

  decision_count="$(grep -Ec '^## 결정 [0-9]+\.' DECISIONS.md || true)"
  if (( decision_count >= 3 && decision_count <= 5 )); then
    report_pass "주요 설계 결정이 ${decision_count}개 기록되어 있습니다."
  else
    report_warning "주요 설계 결정은 최종 제출 시 3~5개가 권장됩니다. 현재 ${decision_count}개입니다."
  fi
else
  report_warning 'DECISIONS.md가 없어 내용 검사를 건너뜁니다.'
fi

print_section '5. 커밋 기록'

commit_count="$(git rev-list --count HEAD 2>/dev/null || printf '0')"
if (( commit_count > 1 )); then
  report_pass "커밋이 ${commit_count}개로 분리되어 있습니다."
else
  report_warning "현재 커밋이 ${commit_count}개입니다. 최종 제출 전 기능별 커밋이 필요합니다."
fi

invalid_commits="$(git log --format='%s' 2>/dev/null | grep -Ev '^(feat|fix|refactor|test|docs|chore)\([^)]+\): .+' || true)"
if [[ -z "$invalid_commits" ]]; then
  report_pass '커밋 제목이 type(scope): 한글 요약 형식을 따릅니다.'
else
  report_warning '권장 형식과 다른 커밋 제목이 있습니다.'
  printf '%s\n' "$invalid_commits"
fi

print_section '6. Mock API 구현 흔적'

if [[ -f package.json ]]; then
  if grep -Eiq '"msw"' package.json; then
    report_pass 'MSW 의존성이 등록되어 있습니다.'
  else
    report_failure 'package.json에서 MSW 의존성을 찾지 못했습니다.'
  fi

  if grep -REq --exclude-dir=node_modules '200|800|delay\(' src 2>/dev/null; then
    report_pass '네트워크 지연 구현 흔적을 찾았습니다.'
  else
    report_warning 'src에서 200~800ms 네트워크 지연 구현을 확인하지 못했습니다.'
  fi

  if grep -REq --exclude-dir=node_modules '0\.15|15/100|15%' src 2>/dev/null; then
    report_pass '약 15% 실패율 구현 흔적을 찾았습니다.'
  else
    report_warning 'src에서 약 15% 실패율 구현을 확인하지 못했습니다.'
  fi
else
  report_warning '아직 package.json이 없어 Mock API 검사를 건너뜁니다.'
fi

print_section '7. 자동 검증 명령'

run_package_script() {
  script_name="$1"
  description="$2"

  if node -e "const p=require('./package.json'); process.exit(p.scripts?.['$script_name'] ? 0 : 1)"; then
    if npm run "$script_name"; then
      report_pass "$description 명령이 통과했습니다."
    else
      report_failure "$description 명령이 실패했습니다."
    fi
  else
    report_warning "$description 스크립트가 없어 실행하지 않았습니다."
  fi
}

if [[ -f package.json ]]; then
  run_package_script lint '린트'
  run_package_script typecheck '타입 검사'
  run_package_script test:run '테스트'
  run_package_script build '빌드'
else
  report_warning '아직 package.json이 없어 자동 검증 명령을 실행하지 않았습니다.'
fi

print_section '8. Pull Request 작업 흐름'

current_branch="$(git branch --show-current)"
if git remote get-url origin >/dev/null 2>&1; then
  report_pass 'origin 원격 저장소가 연결되어 있습니다.'
else
  report_warning 'origin 원격 저장소가 없어 Pull Request를 생성할 수 없습니다.'
fi

if [[ "$current_branch" == 'main' && -n "$(git status --porcelain)" ]]; then
  report_failure 'main 브랜치에 직접 변경사항이 있습니다. 기능 브랜치를 먼저 생성해야 합니다.'
elif [[ "$current_branch" == 'main' ]]; then
  report_pass 'main 브랜치 작업 트리가 깨끗합니다.'
else
  report_pass "현재 ${current_branch} 기능 브랜치에서 작업 중입니다."
fi

print_section '9. 작업 트리 상태'

if [[ -z "$(git status --porcelain)" ]]; then
  report_pass '커밋되지 않은 변경사항이 없습니다.'
else
  report_warning '커밋되지 않은 변경사항이 있습니다.'
  git status --short
fi

printf '\n검사 결과: 통과 %d개, 경고 %d개, 실패 %d개\n' "$pass_count" "$warning_count" "$failure_count"

if (( failure_count > 0 )); then
  exit 1
fi

exit 0

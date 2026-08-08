# 채용 파이프라인 보드

채용 담당자가 지원자를 채용 단계별로 조회하고 이동할 수 있는 프론트엔드 과제 프로젝트입니다.

## 설치 및 실행 방법

애플리케이션 초기 설정 후 실제 명령을 기재합니다.

## 주요 기능

구현과 검증을 마친 기능만 기재합니다.

## 기술 스택

- React
- TypeScript
- Vite
- TanStack Query
- MSW
- Vitest
- Testing Library
- CSS Modules

## Mock API

MSW를 사용합니다. 모든 요청에 200~800ms의 무작위 네트워크 지연과 약 15%의 실패를 적용하고, 단계 변경 결과는 새로고침 후에도 유지되도록 구성할 예정입니다.

## 검증 방법

```bash
./scripts/validate-submission.sh
```

`main` 대상 Pull Request를 생성하거나 새 커밋을 푸시하면 GitHub Actions가 제출물 검증을 실행합니다. 애플리케이션 초기화 후에는 `npm ci`, 테스트, 린트, 빌드도 각각 실행하며 `package-lock.json` 또는 필수 npm 스크립트가 없으면 검증에 실패합니다.

테스트와 강제 실패 재현 방법은 구현 후 추가합니다.

## 폴더 구조

애플리케이션 초기 설정 후 실제 구조를 기재합니다.

## 배포 링크

Vercel 프로젝트와 `LeeEugene1/hiring-pipeline-board` GitHub 저장소를 연결했습니다. 아직 애플리케이션이 초기화되지 않아 배포는 생성하지 않았으며, 실제 애플리케이션 배포를 검증한 뒤 URL을 추가합니다.

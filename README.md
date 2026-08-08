# 채용 파이프라인 보드

채용 담당자가 지원자를 채용 단계별로 조회하고 이동할 수 있는 프론트엔드 과제 프로젝트입니다.

## 설치 및 실행 방법

Node.js 22.12 이상이 필요합니다.

```bash
npm install
npm run dev
```

## 주요 기능

- React 애플리케이션과 TanStack Query Provider 구성
- 개발 환경에서 MSW Service Worker 자동 시작
- 린트, 타입 검사, 테스트와 프로덕션 빌드 자동 검증

## 기술 스택

- React
- TypeScript
- Vite
- TanStack Query
- MSW
- Vitest
- Testing Library
- Tailwind CSS
- Lucide React

shadcn/ui는 전체 컴포넌트를 미리 설치하지 않고 상세 패널처럼 접근성 상호작용이 복잡한 기능에서 필요한 컴포넌트만 추가합니다. 클라이언트 화면 상태는 React 내부 상태로 관리하며 Zustand는 사용하지 않습니다.

## Mock API

개발 환경에서 MSW Service Worker를 시작하도록 구성했습니다. 후보자 handler, 200~800ms 무작위 지연, 약 15% 실패와 새로고침 후 저장은 이슈 #5에서 추가합니다.

## 검증 방법

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
./scripts/validate-submission.sh
```

`main` 대상 Pull Request를 생성하거나 새 커밋을 푸시하면 GitHub Actions가 `npm ci` 이후 같은 검증을 실행합니다.

테스트와 강제 실패 재현 방법은 구현 후 추가합니다.

## 폴더 구조

```text
src/
├── app/      # 애플리케이션 화면, Provider와 smoke test
├── mocks/    # MSW browser worker와 handler 진입점
├── test/     # 공통 테스트 설정
├── index.css # Tailwind CSS 진입점과 전역 기본값
└── main.tsx  # MSW 시작과 React 마운트
```

## 배포 링크

Vercel 프로젝트와 `LeeEugene1/hiring-pipeline-board` GitHub 저장소를 연결했습니다. 연결 후 자동 배포는 생성됐지만 아직 애플리케이션 진입점이 없어 공개 URL이 404를 반환합니다. 실제 애플리케이션 배포를 검증한 뒤 URL을 추가합니다.

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
- 서류검토, 면접, 처우협의, 최종합격, 불합격 단계 보드
- 좁은 화면에서 단계 순서를 유지하는 가로 스크롤 레이아웃
- TanStack Query로 조회한 지원자를 현재 단계별 카드로 분류
- 카드에 지원자 이름, 직무, 지원일과 현재 단계 표시
- MSW 기반 후보자 조회·단계 변경 API
- 200명의 후보자 seed와 `localStorage` 영속 저장
- 모든 API 요청의 200~800ms 지연과 기본 15% 실패 시뮬레이션
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

실제 백엔드가 없으므로 브라우저에서 MSW Service Worker를 시작합니다. 배포 빌드에서도 기본 활성화되며 실제 API를 연결할 때는 `VITE_ENABLE_MSW=false`로 비활성화할 수 있습니다.

| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/api/candidates` | 저장된 후보자 목록 조회 |
| `PATCH` | `/api/candidates/:candidateId/stage` | `{ "stage": "interview" }` 형식으로 단계 변경 |

모든 요청에는 200~800ms의 무작위 지연과 약 15% 실패가 적용됩니다. 후보자 목록은 `hiring-pipeline:candidates` 키로 저장되어 새로고침 후에도 유지됩니다.

### 실패 복구 확인

브라우저 개발자 도구 Console에서 실패 모드를 설정할 수 있습니다.

```js
// 모든 요청 실패
localStorage.setItem('hiring-pipeline:mock-failure-mode', 'always')

// 모든 요청 성공
localStorage.setItem('hiring-pipeline:mock-failure-mode', 'never')

// 기본 15% 무작위 실패로 복귀
localStorage.removeItem('hiring-pipeline:mock-failure-mode')
```

seed 데이터로 초기화하려면 저장된 후보자를 제거한 뒤 새로고침합니다.

```js
localStorage.removeItem('hiring-pipeline:candidates')
location.reload()
```

## 검증 방법

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
./scripts/validate-submission.sh
```

`main` 대상 Pull Request를 생성하거나 새 커밋을 푸시하면 GitHub Actions가 `npm ci` 이후 같은 검증을 실행합니다.

테스트는 단계 순서와 개수, 카드 필드, 지원자 중복 여부, Mock API 조회 연결을 검증합니다. 강제 실패 모드는 위의 `localStorage` 설정으로 재현할 수 있습니다.

## 폴더 구조

```text
src/
├── app/      # 애플리케이션 화면, Provider와 smoke test
├── data/     # 후보자 seed와 localStorage 저장 계층
├── features/ # 보드 등 사용자 기능
├── mocks/    # MSW handler와 네트워크 정책
├── test/     # 공통 테스트 설정
├── types/    # 후보자와 채용 단계 타입
├── index.css # Tailwind CSS 진입점과 전역 기본값
└── main.tsx  # MSW 시작과 React 마운트
```

## 배포 링크

Vercel 프로젝트와 `LeeEugene1/hiring-pipeline-board` GitHub 저장소를 연결했습니다. 연결 후 자동 배포는 생성됐지만 아직 애플리케이션 진입점이 없어 공개 URL이 404를 반환합니다. 실제 애플리케이션 배포를 검증한 뒤 URL을 추가합니다.

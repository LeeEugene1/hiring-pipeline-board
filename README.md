# 채용 파이프라인 보드

채용 담당자가 지원자를 채용 단계별로 조회하고 이동할 수 있는 프론트엔드 과제 프로젝트입니다.

- 배포: [hiring-pipeline-board.vercel.app](https://hiring-pipeline-board.vercel.app)
- 요구사항 해석과 기술 선택: [DECISIONS.md](./DECISIONS.md)
- AI 협업 및 검증 기록: [PROMPTS.md](./PROMPTS.md)

## 설치 및 실행 방법

Node.js 22.12 이상이 필요합니다.

```bash
npm install
npm run dev
```

## 주요 기능

- 서류검토, 면접, 처우협의, 최종합격, 불합격의 다섯 단계 칸반 보드
- 이름, 직무, 지원일과 현재 단계를 표시하는 지원자 카드 200건
- 전체 단계 선택 메뉴와 인접 단계 이동 버튼
- 마우스와 키보드를 지원하는 단계 변경
- 응답 전 즉시 이동하는 낙관적 업데이트와 실패 시 정확한 rollback
- Mock API 저장, 새로고침 이후 상태 유지와 카드별 오류 피드백
- 좁은 화면에서도 단계 순서를 유지하는 보드 내부 가로 스크롤

## 지원자 단계 이동

- 가운데 단계 선택 메뉴에서 모든 채용 단계로 자유롭게 이동할 수 있습니다.
- 왼쪽·오른쪽 버튼으로 인접한 이전·다음 단계로 바로 이동할 수 있습니다.
- 첫 단계의 왼쪽 버튼과 마지막 단계의 오른쪽 버튼은 비활성화됩니다.
- `Tab`으로 버튼에 접근하고 `Enter` 또는 `Space`로 실행할 수 있습니다. 단계 메뉴 안에서는 방향키와 `Enter`를 사용합니다.
- 단계를 선택하면 응답 전에 카드를 새 컬럼으로 이동합니다. PATCH가 실패하면 변경 직전 컬럼으로 rollback하고 카드에 오류 메시지를 표시합니다.

DnD 대신 명시적 액션을 선택한 배경과 트레이드오프는 [DECISIONS.md](./DECISIONS.md#결정-4-명시적-액션-버튼으로-단계를-이동한다)에 기록했습니다.

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| 애플리케이션 | React, TypeScript, Vite |
| 서버 상태 | TanStack Query |
| Mock API | MSW, localStorage |
| 스타일과 UI | Tailwind CSS, Radix UI Dropdown Menu, Lucide React |
| 테스트 | Vitest, Testing Library |

후보자 API 상태는 TanStack Query가 관리하고 화면 전용 상태는 React 내부 상태로 유지합니다. 별도 전역 상태 라이브러리는 사용하지 않습니다.

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

강제 실패 상태에서 단계를 변경하면 카드가 먼저 이동하고 200~800ms 뒤 이전 컬럼으로 복구됩니다. `Mock API 요청에 실패했습니다.` 메시지가 복구된 카드에 표시되면 낙관적 업데이트의 실패 흐름이 정상입니다.

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

테스트는 단계 순서와 개수, 카드 필드, 지원자 중복 여부, Mock API 조회 연결, 좌우 버튼 경계, 키보드 단계 선택, 응답 전 즉시 이동, 실패 rollback과 다른 후보자 상태 보존을 검증합니다. 강제 실패 모드는 위의 `localStorage` 설정으로 재현할 수 있습니다.

## 폴더 구조

```text
src/
├── app/      # 애플리케이션 화면, Provider와 smoke test
├── data/     # 후보자 seed와 localStorage 저장 계층
├── features/ # 보드, 지원자 카드와 단계 이동 기능
├── mocks/    # MSW handler와 네트워크 정책
├── test/     # 공통 테스트 설정
├── types/    # 후보자와 채용 단계 타입
├── index.css # Tailwind CSS 진입점과 전역 기본값
└── main.tsx  # MSW 시작과 React 마운트
```

## 제외 범위와 후속 작업

같은 컬럼 안에서 카드의 위·아래 순서를 변경하는 기능은 필수 요구사항이 아니므로 #7에서 제외했습니다. 구현 범위와 논의 내용은 [#20 컬럼 내 지원자 카드 순서 변경 구현](https://github.com/LeeEugene1/hiring-pipeline-board/issues/20)에서 관리합니다.

## 배포

[Vercel 배포 페이지](https://hiring-pipeline-board.vercel.app)는 GitHub 저장소와 연결되어 있으며 현재 HTTP 200 응답을 확인했습니다. Pull Request마다 Preview 배포와 자동 검증을 실행합니다.

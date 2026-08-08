import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'
import { AppProviders } from './AppProviders'

function QueryClientProbe() {
  const client = useQueryClient()

  return <span>{client ? 'Query Client 연결됨' : 'Query Client 없음'}</span>
}

describe('애플리케이션 초기 구성', () => {
  it('채용 파이프라인 화면을 렌더링한다', () => {
    render(
      <AppProviders client={new QueryClient()}>
        <App />
      </AppProviders>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: '채용 파이프라인' }),
    ).toBeInTheDocument()
  })

  it('TanStack Query Provider를 연결한다', () => {
    render(
      <AppProviders client={new QueryClient()}>
        <QueryClientProbe />
      </AppProviders>,
    )

    expect(screen.getByText('Query Client 연결됨')).toBeInTheDocument()
  })
})

import { beforeEach, describe, expect, it } from 'vitest'

import {
  FAILURE_RATE,
  MAX_NETWORK_DELAY_MS,
  MIN_NETWORK_DELAY_MS,
  MOCK_FAILURE_MODE_KEY,
  getMockFailureMode,
  getRandomNetworkDelay,
  shouldFailRequest,
  shouldSimulateFailure,
} from './networkPolicy'

describe('Mock API 네트워크 정책', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('200ms부터 800ms 사이의 지연을 만든다', () => {
    expect(getRandomNetworkDelay(() => 0)).toBe(MIN_NETWORK_DELAY_MS)
    expect(getRandomNetworkDelay(() => 1)).toBe(MAX_NETWORK_DELAY_MS)
  })

  it('무작위 값의 하위 15%에서 실패한다', () => {
    expect(shouldSimulateFailure(() => FAILURE_RATE - 0.001)).toBe(true)
    expect(shouldSimulateFailure(() => FAILURE_RATE)).toBe(false)
  })

  it('쿼리 문자열로 실패 모드를 결정적으로 제어한다', () => {
    const failureRequest = new Request(
      'http://localhost/api/candidates?mockFailure=always',
    )
    const successRequest = new Request(
      'http://localhost/api/candidates?mockFailure=never',
    )

    expect(shouldFailRequest(failureRequest, () => 1)).toBe(true)
    expect(shouldFailRequest(successRequest, () => 0)).toBe(false)
  })

  it('localStorage 설정으로 전체 요청의 실패 모드를 제어한다', () => {
    localStorage.setItem(MOCK_FAILURE_MODE_KEY, 'always')

    expect(
      getMockFailureMode(new Request('http://localhost/api/candidates')),
    ).toBe('always')
  })
})

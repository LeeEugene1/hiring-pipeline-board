export const MIN_NETWORK_DELAY_MS = 200
export const MAX_NETWORK_DELAY_MS = 800
export const FAILURE_RATE = 0.15
export const MOCK_FAILURE_MODE_KEY = 'hiring-pipeline:mock-failure-mode'

export type MockFailureMode = 'always' | 'never' | 'random'

type FailureModeStorage = Pick<Storage, 'getItem'>

export function getRandomNetworkDelay(random = Math.random) {
  const normalizedRandom = Math.min(Math.max(random(), 0), 1)
  const delayRange = MAX_NETWORK_DELAY_MS - MIN_NETWORK_DELAY_MS + 1

  return Math.min(
    MIN_NETWORK_DELAY_MS + Math.floor(normalizedRandom * delayRange),
    MAX_NETWORK_DELAY_MS,
  )
}

export function shouldSimulateFailure(random = Math.random) {
  return random() < FAILURE_RATE
}

export function getMockFailureMode(
  request: Request,
  storage: FailureModeStorage = localStorage,
): MockFailureMode {
  const queryMode = new URL(request.url).searchParams.get('mockFailure')

  if (queryMode === 'always' || queryMode === 'never') {
    return queryMode
  }

  const storedMode = storage.getItem(MOCK_FAILURE_MODE_KEY)

  return storedMode === 'always' || storedMode === 'never'
    ? storedMode
    : 'random'
}

export function shouldFailRequest(
  request: Request,
  random = Math.random,
  storage: FailureModeStorage = localStorage,
) {
  const mode = getMockFailureMode(request, storage)

  if (mode === 'always') {
    return true
  }

  if (mode === 'never') {
    return false
  }

  return shouldSimulateFailure(random)
}

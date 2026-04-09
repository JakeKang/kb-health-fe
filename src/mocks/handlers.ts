import { http, HttpResponse } from 'msw'
import type {
  AuthTokenResponse,
  DashboardResponse,
  DeleteTaskResponse,
  ErrorResponse,
  TaskDetailResponse,
  TaskItem,
  TaskListResponse,
  TaskStatus,
  UserResponse,
} from '@/types/api'

const PAGE_SIZE = 10
const TOTAL_PAGES = 6
const LAST_PAGE_SIZE = 5
const TOTAL_TASKS = (TOTAL_PAGES - 1) * PAGE_SIZE + LAST_PAGE_SIZE

// 삭제된 ID를 메모리에 유지해 같은 mock 세션 안에서는 목록/상세/삭제 응답이 서로 어긋나지 않게 합니다.
export const deletedTaskIds = new Set<string>()

// 상태 변경을 메모리에 저장해 새로고침 없이도 목록·상세·대시보드가 동일한 값을 반환합니다.
const statusOverrides = new Map<string, TaskStatus>()

const unauth = () => HttpResponse.json({ errorMessage: 'Unauthorized' } satisfies ErrorResponse, { status: 401 })
const requireAuth = (req: Request) => req.headers.get('Authorization')?.startsWith('Bearer ')

function parseTaskNumber(id: string): number | null {
  const match = /^task-(\d+)$/.exec(id)
  if (!match) return null
  const n = Number(match[1])
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_TASKS ? n : null
}

function statusForIndex(i: number): TaskStatus {
  return i % 3 === 0 ? 'DONE' : 'TODO'
}

const taskTitlePrefixes = [
  '아침 복약 체크',
  '걷기 목표 점검',
  '건강검진 결과 정리',
  '식단 기록 업데이트',
  '수면 시간 확인',
  '물 섭취량 기록',
  '운동 계획 조정',
  '병원 예약 확인',
  '스트레칭 루틴 체크',
  '영양제 재고 확인',
]

const taskTitleSuffixes = [
  '마무리하기',
  '메모 남기기',
  '오늘 기준으로 정리하기',
  '다음 일정과 함께 확인하기',
  '체크리스트 업데이트',
]

const taskMemoTemplates = [
  '앱에 기록한 건강 데이터를 보고 필요한 후속 메모를 정리합니다.',
  '오늘 일정 안에서 바로 실행할 수 있도록 우선순위를 다시 맞춥니다.',
  '놓친 항목이 없는지 확인하고 필요한 경우 담당자와 공유할 내용을 남깁니다.',
  '짧게라도 진행 상황을 남겨서 다음 확인 시점을 쉽게 이어갈 수 있게 합니다.',
  '완료 여부만 보지 말고 다음 행동이 필요한지도 함께 정리합니다.',
]

function titleForTask(n: number): string {
  const prefix = taskTitlePrefixes[(n - 1) % taskTitlePrefixes.length]
  const suffix = taskTitleSuffixes[Math.floor((n - 1) / taskTitlePrefixes.length) % taskTitleSuffixes.length]
  return `${prefix} ${suffix}`
}

function memoForTask(n: number): string {
  const template = taskMemoTemplates[(n - 1) % taskMemoTemplates.length]
  return `${template} (${n}번 할 일)`
}

function registerDatetimeForTask(n: number): string {
  const baseDate = Date.UTC(2026, 3, 9, 8, 30, 0)
  const offsetHours = (n - 1) * 7
  return new Date(baseDate - offsetHours * 60 * 60 * 1000).toISOString()
}

function taskItemFromNumber(n: number, i: number): TaskItem {
  return {
    id: `task-${n}`,
    title: titleForTask(n),
    memo: memoForTask(n),
    status: statusOverrides.get(`task-${n}`) ?? statusForIndex(i),
  }
}

function taskDetailFromNumber(n: number): TaskDetailResponse {
  const pageLocalIndex = (n - 1) % PAGE_SIZE
  return {
    title: titleForTask(n),
    memo: memoForTask(n),
    registerDatetime: registerDatetimeForTask(n),
    status: statusOverrides.get(`task-${n}`) ?? statusForIndex(pageLocalIndex),
  }
}

function pageSizeFor(page: number): number {
  return page === TOTAL_PAGES ? LAST_PAGE_SIZE : PAGE_SIZE
}

function taskItemsForPage(page: number): TaskItem[] {
  return Array.from({ length: pageSizeFor(page) }, (_, i) => {
    const n = parseTaskNumber(`task-${(page - 1) * PAGE_SIZE + i + 1}`)
    return n ? taskItemFromNumber(n, i) : null
  }).filter((v): v is TaskItem => v !== null).filter((item) => !deletedTaskIds.has(item.id))
}

function dashboardFromTaskDataset(): DashboardResponse {
  const tasks = Array.from({ length: TOTAL_PAGES }, (_, i) => taskItemsForPage(i + 1)).flat()
  const numOfDoneTask = tasks.filter((task) => task.status === 'DONE').length

  return {
    numOfTask: tasks.length,
    numOfRestTask: tasks.length - numOfDoneTask,
    numOfDoneTask,
  }
}

const VALID_EMAIL = 'test@example.com'
const VALID_PASSWORD = 'Password1'
const MOCK_REFRESH_TOKEN = 'mock.refresh.token'
let latestRefreshToken = MOCK_REFRESH_TOKEN

export const handlers = [
  http.post('/api/sign-in', async ({ request }) => {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
      return HttpResponse.json({ errorMessage: 'Invalid request body' } satisfies ErrorResponse, { status: 400 })
    }
    if (body.email !== VALID_EMAIL || body.password !== VALID_PASSWORD) {
      return HttpResponse.json({ errorMessage: '이메일 또는 비밀번호가 올바르지 않습니다.' } satisfies ErrorResponse, { status: 400 })
    }
    latestRefreshToken = MOCK_REFRESH_TOKEN
    const response: AuthTokenResponse = { accessToken: 'mock.access.token', refreshToken: MOCK_REFRESH_TOKEN }
    return HttpResponse.json(response, { status: 200, headers: { 'Set-Cookie': `token=${latestRefreshToken}; Path=/; SameSite=Lax` } })
  }),

  // mock 인증도 앱과 같은 규칙을 따라 refresh는 쿠키, 보호 API 호출은 Bearer 헤더를 사용합니다.
  http.post('/api/refresh', ({ cookies }) => {
    if (!cookies.token || cookies.token !== latestRefreshToken) return unauth()
    latestRefreshToken = MOCK_REFRESH_TOKEN
    const response: AuthTokenResponse = { accessToken: 'new.access.token', refreshToken: latestRefreshToken }
    return HttpResponse.json(response, { status: 200, headers: { 'Set-Cookie': `token=${latestRefreshToken}; Path=/; SameSite=Lax` } })
  }),

  http.get('/api/user', ({ request }) => {
    if (!requireAuth(request)) return unauth()
    return HttpResponse.json({ name: '김건강', memo: 'KB헬스 직원입니다.' } satisfies UserResponse)
  }),

  http.get('/api/dashboard', ({ request }) => {
    if (!requireAuth(request)) return unauth()
    return HttpResponse.json(dashboardFromTaskDataset())
  }),

  http.get('/api/task', ({ request }) => {
    if (!requireAuth(request)) return unauth()
    const requestedPage = Number(new URL(request.url).searchParams.get('page'))
    const page = Number.isInteger(requestedPage) && requestedPage >= 1 ? requestedPage : 1
    const data = taskItemsForPage(page)
    return HttpResponse.json({ data, hasNext: page < TOTAL_PAGES } satisfies TaskListResponse)
  }),

  http.get('/api/task/:id', ({ request, params }) => {
    if (!requireAuth(request)) return unauth()
    const id = String(params.id)
    const n = parseTaskNumber(id)
    // 이미 삭제된 항목은 상세에서도 같은 404를 돌려 목록/삭제 흐름과 결과를 맞춥니다.
    if (!n || deletedTaskIds.has(id)) {
      return HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다.' } satisfies ErrorResponse, { status: 404 })
    }
    return HttpResponse.json(taskDetailFromNumber(n))
  }),

  http.patch('/api/task/:id', async ({ request, params }) => {
    if (!requireAuth(request)) return unauth()
    const id = String(params.id)
    const n = parseTaskNumber(id)
    if (!n || deletedTaskIds.has(id)) {
      return HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다.' } satisfies ErrorResponse, { status: 404 })
    }
    const body = await request.json().catch(() => null) as { status?: unknown } | null
    if (!body?.status || (body.status !== 'TODO' && body.status !== 'DONE')) {
      return HttpResponse.json({ errorMessage: 'Invalid status' } satisfies ErrorResponse, { status: 400 })
    }
    statusOverrides.set(id, body.status as TaskStatus)
    return HttpResponse.json({ success: true } satisfies DeleteTaskResponse)
  }),

  http.delete('/api/task/:id', ({ request, params }) => {
    if (!requireAuth(request)) return unauth()
    const id = String(params.id)
    const n = parseTaskNumber(id)
    if (!n || deletedTaskIds.has(id)) {
      return HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다.' } satisfies ErrorResponse, { status: 404 })
    }
    deletedTaskIds.add(id)
    return HttpResponse.json({ success: true } satisfies DeleteTaskResponse)
  }),
]

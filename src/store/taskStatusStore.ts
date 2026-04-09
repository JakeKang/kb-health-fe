import { create } from 'zustand'

import type { DashboardResponse, TaskItem, TaskStatus } from '@/types/api'

type TaskStatusOverlayState = {
  seedStatusByTaskId: Record<string, TaskStatus>
  statusByTaskId: Record<string, TaskStatus>
  seedTaskStatuses: (tasks: TaskItem[]) => void
  setTaskStatus: (taskId: string, status: TaskStatus) => void
  clearTaskStatus: (taskId: string) => void
}

function overlayTaskItemsStatus(
  tasks: TaskItem[],
  statusByTaskId: Record<string, TaskStatus>,
): TaskItem[] {
  // 목록 API 원본은 유지하고, 상세에서 바꾼 상태만 렌더링 직전에 덮어써 세션 내 일관성을 맞춥니다.
  let hasChanges = false

  const overlaidTasks = tasks.map((task) => {
    const overlaidStatus = statusByTaskId[task.id]

    if (!overlaidStatus || overlaidStatus === task.status) {
      return task
    }

    hasChanges = true
    return { ...task, status: overlaidStatus }
  })

  return hasChanges ? overlaidTasks : tasks
}

function applyTaskStatusOverlayToDashboard(
  dashboard: DashboardResponse,
  seedStatusByTaskId: Record<string, TaskStatus>,
  statusByTaskId: Record<string, TaskStatus>,
): DashboardResponse {
  // 서버 대시보드 수치는 원본 seed 상태와 현재 overlay 상태의 차이만큼만 보정합니다.
  let numOfRestTask = dashboard.numOfRestTask
  let numOfDoneTask = dashboard.numOfDoneTask
  let hasChanges = false

  for (const [taskId, currentStatus] of Object.entries(statusByTaskId)) {
    const seedStatus = seedStatusByTaskId[taskId]

    if (!seedStatus || seedStatus === currentStatus) {
      continue
    }

    hasChanges = true

    if (seedStatus === 'TODO' && currentStatus === 'DONE') {
      numOfRestTask -= 1
      numOfDoneTask += 1
      continue
    }

    if (seedStatus === 'DONE' && currentStatus === 'TODO') {
      numOfRestTask += 1
      numOfDoneTask -= 1
    }
  }

  if (!hasChanges) {
    return dashboard
  }

  return {
    ...dashboard,
    numOfRestTask,
    numOfDoneTask,
  }
}

function formatTaskStatusLabel(status: TaskStatus): string {
  return status === 'DONE' ? '완료' : '해야할 일'
}

const useTaskStatusStore = create<TaskStatusOverlayState>((set) => ({
  seedStatusByTaskId: {},
  statusByTaskId: {},
  seedTaskStatuses: (tasks) => {
    set((state) => {
      let hasChanges = false
      const nextSeedStatusByTaskId = { ...state.seedStatusByTaskId }
      const nextStatusByTaskId = { ...state.statusByTaskId }

      for (const task of tasks) {
        // 첫 조회 시점의 상태를 seed로 고정해 두어 이후 상세 화면 변경과 비교 기준으로 사용합니다.
        if (nextSeedStatusByTaskId[task.id]) {
          continue
        }

        hasChanges = true
        nextSeedStatusByTaskId[task.id] = task.status
        nextStatusByTaskId[task.id] ??= task.status
      }

      if (!hasChanges) {
        return state
      }

      return {
        seedStatusByTaskId: nextSeedStatusByTaskId,
        statusByTaskId: nextStatusByTaskId,
      }
    })
  },
  setTaskStatus: (taskId, status) => {
    set((state) => {
      if (state.statusByTaskId[taskId] === status) {
        return state
      }

      return {
        statusByTaskId: {
          ...state.statusByTaskId,
          [taskId]: status,
        },
      }
    })
  },
  clearTaskStatus: (taskId) => {
    set((state) => {
      if (!state.statusByTaskId[taskId] && !state.seedStatusByTaskId[taskId]) {
        return state
      }

      const nextStatusByTaskId = { ...state.statusByTaskId }
      const nextSeedStatusByTaskId = { ...state.seedStatusByTaskId }

      delete nextStatusByTaskId[taskId]
      delete nextSeedStatusByTaskId[taskId]

      return {
        seedStatusByTaskId: nextSeedStatusByTaskId,
        statusByTaskId: nextStatusByTaskId,
      }
    })
  },
}))

function useTaskStatus(taskId: string): TaskStatus | undefined {
  return useTaskStatusStore((state) => state.statusByTaskId[taskId])
}

export {
  applyTaskStatusOverlayToDashboard,
  formatTaskStatusLabel,
  overlayTaskItemsStatus,
  useTaskStatus,
  useTaskStatusStore,
}

import { beforeEach, describe, expect, it } from 'vitest'

import {
  applyTaskStatusOverlayToDashboard,
  overlayTaskItemsStatus,
  useTaskStatusStore,
} from './taskStatusStore'
import type { TaskItem } from '../types/api'

function makeTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    id: 'task-1',
    title: '할 일',
    memo: '메모',
    status: 'TODO',
    ...overrides,
  }
}

describe('taskStatusStore overlay behavior', () => {
  beforeEach(() => {
    useTaskStatusStore.setState({
      seedStatusByTaskId: {},
      statusByTaskId: {},
    })
  })

  it('seeds unseen list tasks into both seed and current status maps for the first render', () => {
    const tasks = [makeTask(), makeTask({ id: 'task-2', status: 'DONE' })]

    useTaskStatusStore.getState().seedTaskStatuses(tasks)

    expect(useTaskStatusStore.getState()).toMatchObject({
      seedStatusByTaskId: {
        'task-1': 'TODO',
        'task-2': 'DONE',
      },
      statusByTaskId: {
        'task-1': 'TODO',
        'task-2': 'DONE',
      },
    })
  })

  it('keeps shared current status after list seed so detail and list resolve the same task state', () => {
    const seededTask = makeTask({ id: 'shared-task', status: 'TODO' })

    useTaskStatusStore.getState().seedTaskStatuses([seededTask])
    useTaskStatusStore.getState().setTaskStatus('shared-task', 'DONE')
    useTaskStatusStore.getState().seedTaskStatuses([seededTask])

    const state = useTaskStatusStore.getState()
    const overlaidTasks = overlayTaskItemsStatus([seededTask], state.statusByTaskId)

    expect(state.seedStatusByTaskId['shared-task']).toBe('TODO')
    expect(state.statusByTaskId['shared-task']).toBe('DONE')
    expect(overlaidTasks).toEqual([{ ...seededTask, status: 'DONE' }])
  })

  it('decrements rest and increments done when a seeded TODO becomes DONE', () => {
    const dashboard = {
      numOfTask: 4,
      numOfRestTask: 3,
      numOfDoneTask: 1,
    }

    const overlaidDashboard = applyTaskStatusOverlayToDashboard(
      dashboard,
      {
        todoToDone: 'TODO',
        unchanged: 'TODO',
      },
      {
        todoToDone: 'DONE',
        unchanged: 'TODO',
        unseeded: 'DONE',
      },
    )

    expect(overlaidDashboard).toEqual({
      numOfTask: 4,
      numOfRestTask: 2,
      numOfDoneTask: 2,
    })
    expect(overlaidDashboard).not.toBe(dashboard)
  })

  it('increments rest and decrements done when a seeded DONE becomes TODO', () => {
    const dashboard = {
      numOfTask: 4,
      numOfRestTask: 1,
      numOfDoneTask: 3,
    }

    expect(
      applyTaskStatusOverlayToDashboard(
        dashboard,
        {
          doneToTodo: 'DONE',
        },
        {
          doneToTodo: 'TODO',
        },
      ),
    ).toEqual({
      numOfTask: 4,
      numOfRestTask: 2,
      numOfDoneTask: 2,
    })
  })
})

import { useLayoutEffect, useMemo } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import { getTasks } from '@/api'
import { overlayTaskItemsStatus, useTaskStatusStore } from '@/store/taskStatusStore'

const tasksInfiniteQueryKey = ['tasks'] as const

function useInfiniteTasks() {
  const seedTaskStatuses = useTaskStatusStore((state) => state.seedTaskStatuses)
  const statusByTaskId = useTaskStatusStore((state) => state.statusByTaskId)
  const query = useInfiniteQuery({
    queryKey: tasksInfiniteQueryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await getTasks(pageParam)

      // 페이지를 받아오는 즉시 최초 status를 seed로 저장해 상세/대시보드 overlay 기준을 마련합니다.
      seedTaskStatuses(response.data.data)

      return response.data
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
  })

  useLayoutEffect(() => {
    const seededTasks = query.data?.pages.flatMap((page) => page.data) ?? []

    if (seededTasks.length === 0) {
      return
    }

    seedTaskStatuses(seededTasks)
  }, [query.data, seedTaskStatuses])

  const data = useMemo(() => {
    if (!query.data) {
      return query.data
    }

    let hasChanges = false
    const pages = query.data.pages.map((page) => {
      // 캐시 원본을 직접 바꾸지 않고, 렌더링용 데이터에만 overlay를 입혀 query 일관성을 유지합니다.
      const overlaidTasks = overlayTaskItemsStatus(page.data, statusByTaskId)

      if (overlaidTasks === page.data) {
        return page
      }

      hasChanges = true
      return {
        ...page,
        data: overlaidTasks,
      }
    })

    return hasChanges ? { ...query.data, pages } : query.data
  }, [query.data, statusByTaskId])

  return {
    ...query,
    data,
  }
}

export { tasksInfiniteQueryKey, useInfiniteTasks }

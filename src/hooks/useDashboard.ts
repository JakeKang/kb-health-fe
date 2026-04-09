import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getDashboard } from '@/api'
import {
  applyTaskStatusOverlayToDashboard,
  useTaskStatusStore,
} from '@/store/taskStatusStore'

const dashboardQueryKey = ['dashboard'] as const

type UseDashboardOptions = {
  enabled?: boolean
}

function useDashboard({ enabled = true }: UseDashboardOptions = {}) {
  const seedStatusByTaskId = useTaskStatusStore((state) => state.seedStatusByTaskId)
  const statusByTaskId = useTaskStatusStore((state) => state.statusByTaskId)
  const query = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: () => getDashboard().then((response) => response.data),
    enabled,
  })

  const data = useMemo(() => {
    if (!query.data) {
      return query.data
    }

    // 상세에서 바꾼 상태가 있으면 대시보드 통계도 같은 overlay 기준으로 다시 계산합니다.
    return applyTaskStatusOverlayToDashboard(
      query.data,
      seedStatusByTaskId,
      statusByTaskId,
    )
  }, [query.data, seedStatusByTaskId, statusByTaskId])

  return {
    ...query,
    data,
  }
}

export { dashboardQueryKey, useDashboard }

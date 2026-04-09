import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { getTask } from '@/api'

const taskQueryKey = (id: string) => ['task', id] as const

function useTask(id: string) {
  return useQuery({
    queryKey: taskQueryKey(id),
    queryFn: () => getTask(id).then((response) => response.data),
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        return false
      }

      return failureCount < 3
    },
  })
}

export { taskQueryKey, useTask }

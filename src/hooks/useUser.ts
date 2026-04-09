import { useQuery } from '@tanstack/react-query'

import { getUser } from '@/api'

const userQueryKey = ['user'] as const

function useUser() {
  return useQuery({
    queryKey: userQueryKey,
    queryFn: () => getUser().then((response) => response.data),
  })
}

export { userQueryKey, useUser }

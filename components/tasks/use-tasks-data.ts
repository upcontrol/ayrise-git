import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useTasksData() {
  const { data, error, mutate } = useSWR('/api/tasks', fetcher)

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    refetch: mutate
  }
}
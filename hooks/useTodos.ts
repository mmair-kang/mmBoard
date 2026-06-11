'use client'
// 수정: Auto — 2026-06-11

import { sortTodoItems } from '@/lib/todoFormat'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const todosSwrKey = '/api/todos' as const

export interface TodoItem {
  id: number
  content: string
  dueDate: string | null
  dueTime: string | null
  createdAt: string
}

async function todosFetcher(): Promise<TodoItem[]> {
  const rows = await swrJsonFetch<TodoItem[]>(todosSwrKey, '할 일 목록을 불러오지 못했습니다.')
  return sortTodoItems(rows)
}

export function useTodos() {
  const swr = useSWR<TodoItem[]>(todosSwrKey, todosFetcher)

  return {
    items: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}

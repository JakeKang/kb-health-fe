import { useEffect, useMemo, useRef } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';

import { TaskCard } from '@/components/common/TaskCard';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useInfiniteTasks } from '@/hooks/useInfiniteTasks';
import type { TaskItem } from '@/types/api';

const skeletonRows = [
  'loading-row-1',
  'loading-row-2',
  'loading-row-3',
  'loading-row-4',
  'loading-row-5',
  'loading-row-6',
];

type TaskListRowProps = {
  task: TaskItem;
  onOpenTask: (id: string) => void;
};

function TaskListRow({ task, onOpenTask }: TaskListRowProps) {
  return (
    <TaskCard
      id={task.id}
      memo={task.memo}
      status={task.status}
      title={task.title}
      className='min-w-0'
      onClick={() => onOpenTask(task.id)}
    />
  );
}

function TaskListSkeleton() {
  return (
    <ul aria-label='할 일 목록 로딩 중' className='space-y-4'>
      {skeletonRows.map((rowKey) => (
        <li key={rowKey}>
          <Card className='border border-border/70 bg-card/95 shadow-sm'>
            <div className='space-y-3 p-6'>
              <Skeleton className='h-6 w-20 rounded-full' />
              <Skeleton className='h-6 w-56' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function TaskListPage() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useInfiniteTasks();

  const tasks = useMemo(
    () => data?.pages.flatMap((page: { data: TaskItem[] }) => page.data) ?? [],
    [data],
  );
  // The extra row is a virtual sentinel: it keeps next-page loading inside the list without rendering every item.
  const rowCount = hasNextPage ? tasks.length + 1 : tasks.length;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 188,
    overscan: 6,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    // When the sentinel row enters the viewport, fetch the next page once and let React Query own the merge.
    const lastVirtualRow = virtualRows[virtualRows.length - 1];

    if (!lastVirtualRow || !hasNextPage || isFetchingNextPage) {
      return;
    }

    if (lastVirtualRow.index >= tasks.length - 1) {
      void fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    tasks.length,
    virtualRows,
  ]);

  const handleOpenTask = (id: string) => {
    void navigate({ to: '/task/$id', params: { id } });
  };

  return (
    <main aria-labelledby='task-list-heading' className='w-full space-y-4 sm:space-y-6'>
      <header className='space-y-1 sm:space-y-2'>
        <h1
          id='task-list-heading'
          className='text-xl font-semibold tracking-tight sm:text-3xl'>
          할 일 목록
        </h1>
        <p className='text-sm text-muted-foreground'>
          지금 진행 중인 할 일을 빠르게 훑어보고, 필요한 항목을 눌러 상세 내용을
          확인해 보세요.
        </p>
      </header>

      {isPending ? <TaskListSkeleton /> : null}

      {isError ? (
        <Card
          aria-live='polite'
          className='border border-destructive/20 bg-destructive/5 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-base text-destructive'>
              할 일 목록 로딩 오류
            </CardTitle>
            <CardDescription className='text-sm text-destructive/80'>
              할 일 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!isPending && !isError ? (
        <section
          aria-busy={isFetchingNextPage}
          aria-label='가상 스크롤 할 일 목록'
          className='space-y-3'>
          <div
            ref={scrollContainerRef}
            data-scroll-container='true'
            className='h-[calc(100dvh-var(--gnb-height)-theme(spacing.48))] min-h-64 overflow-y-auto rounded-xl border border-border/70 bg-card/40 p-2 shadow-sm'>
            <ul
              className='relative'
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
              {virtualRows.map((virtualRow) => {
                const task = tasks[virtualRow.index];
                const isLoaderRow = virtualRow.index >= tasks.length;

                return (
                  <li
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={
                      isLoaderRow ? undefined : rowVirtualizer.measureElement
                    }
                    className='absolute left-0 top-0 w-full px-2 py-2'
                    style={{ transform: `translateY(${virtualRow.start}px)` }}>
                    {task ? (
                      <TaskListRow task={task} onOpenTask={handleOpenTask} />
                    ) : (
                      <div className='flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-background/70 px-4 text-center text-sm text-muted-foreground'>
                        {isFetchingNextPage
                          ? '다음 할 일을 불러오고 있습니다.'
                          : '스크롤을 내려 다음 할 일을 이어서 확인하세요.'}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {isFetchingNextPage ? (
            <p aria-live='polite' className='text-sm text-muted-foreground'>
              추가 할 일을 불러오고 있습니다.
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

export default TaskListPage;

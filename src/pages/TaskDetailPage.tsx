import { useState } from 'react';

import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { ChevronLeft, Trash2 } from 'lucide-react';

import { deleteTask, updateTaskStatus } from '@/api';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { dashboardQueryKey } from '@/hooks/useDashboard';
import { tasksInfiniteQueryKey } from '@/hooks/useInfiniteTasks';
import { taskQueryKey, useTask } from '@/hooks/useTask';
import {
  formatTaskStatusLabel,
  useTaskStatusStore,
} from '@/store/taskStatusStore';
import type { TaskListResponse, TaskStatus } from '@/types/api';

const taskStatusOptions: TaskStatus[] = ['TODO', 'DONE'];

function getStatusBadgeClassName(status: TaskStatus): string {
  return status === 'DONE'
    ? 'border-success/20 bg-success/10 text-success'
    : 'border-primary/20 bg-primary/15 text-foreground';
}

function formatRegisterDatetime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function TaskDetailPage(): JSX.Element {
  const { id } = useParams({ from: '/shell/protected/task/$id' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, error, isError, isPending } = useTask(id);
  const clearTaskStatus = useTaskStatusStore((state) => state.clearTaskStatus);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  if (isPending) return <Spinner />;

  if (isError) {
    const is404 = isAxiosError(error) && error.response?.status === 404;
    return (
      <main className='flex w-full items-center justify-center py-6'>
        <EmptyState
          className='min-h-80 justify-center rounded-2xl border border-dashed border-border/80 bg-card/90 px-4 py-6 shadow-sm'
          title={
            is404
              ? '찾으시는 할 일이 없습니다'
              : '상세 정보를 불러오지 못했습니다'
          }
          description={
            is404
              ? `이미 삭제되었거나 잘못된 주소일 수 있습니다.`
              : '잠시 후 다시 시도하거나 목록으로 돌아가 다른 할 일을 확인해 주세요.'
          }
          action={{
            label: '목록으로 돌아가기',
            onClick: () => void navigate({ to: '/task' }),
          }}
        />
      </main>
    );
  }

  const handleStatusChange = async (newStatus: TaskStatus): Promise<void> => {
    if (isStatusUpdating) return;
    setIsStatusUpdating(true);
    try {
      await updateTaskStatus(id, newStatus);
      // overlay 제거 + 목록 캐시 직접 업데이트 → overlay 없어도 캐시에서 즉시 반영
      clearTaskStatus(id);
      queryClient.setQueryData<InfiniteData<TaskListResponse>>(
        tasksInfiniteQueryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((task) =>
                task.id === id ? { ...task, status: newStatus } : task,
              ),
            })),
          };
        },
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: taskQueryKey(id) }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
      ]);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    // 삭제는 확인 모달 뒤에서만 수행하고, 성공 시 목록/상세/대시보드 캐시를 정리한 뒤 목록으로 돌아갑니다.
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteTask(id);
      clearTaskStatus(id);
      await queryClient.cancelQueries({
        queryKey: tasksInfiniteQueryKey,
        exact: true,
      });
      await queryClient.cancelQueries({
        queryKey: taskQueryKey(id),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: tasksInfiniteQueryKey,
        exact: true,
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      setIsDeleteOpen(false);
      await navigate({ to: '/task', replace: true });
      queryClient.removeQueries({ queryKey: taskQueryKey(id), exact: true });
    } catch (caughtError) {
      console.error('할 일 삭제 실패:', caughtError);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <main
        aria-labelledby='task-detail-heading'
        className='mx-auto w-full max-w-3xl space-y-3 sm:space-y-5'>
        <div className='flex flex-row items-center justify-between gap-3'>
          <Button
            type='button'
            variant='outline'
            className='rounded-md'
            onClick={() => void navigate({ to: '/task' })}>
            <ChevronLeft aria-hidden='true' className='size-4' />
            목록으로
          </Button>
          <Button
            aria-label='할 일 삭제'
            disabled={isDeleting}
            type='button'
            variant='destructive'
            className='rounded-md'
            onClick={() => setIsDeleteOpen(true)}>
            <Trash2 aria-hidden='true' className='size-4' />
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </div>

        <Card className='rounded-2xl border border-border/70 bg-card/95 shadow-sm'>
          <CardHeader className='gap-2 border-b border-border/60 pb-3 sm:gap-4 sm:pb-5'>
            <div className='space-y-2 sm:space-y-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  className='border-border/70 bg-muted/40 text-muted-foreground'>
                  상세 보기
                </Badge>
                <Badge
                  variant='outline'
                  className={getStatusBadgeClassName(data.status)}>
                  현재 상태 · {formatTaskStatusLabel(data.status)}
                </Badge>
              </div>
              <CardTitle
                id='task-detail-heading'
                className='text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl'>
                {data.title}
              </CardTitle>
              <CardDescription className='leading-6'>
                필요한 정보만 빠르게 확인하고 여기서 바로 상태를 정리할 수
                있습니다.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className='space-y-4 pt-4 sm:space-y-6 sm:pt-6'>
            <section
              aria-labelledby='task-memo-heading'
              className='space-y-2 sm:space-y-3'>
              <h2
                id='task-memo-heading'
                className='text-sm font-semibold text-foreground'>
                메모
              </h2>
              <div className='min-h-28 whitespace-pre-wrap rounded-2xl border border-border/70 bg-muted/20 p-4 text-[14px] leading-7 text-foreground sm:min-h-56 sm:p-5 sm:text-[15px] sm:leading-8'>
                {data.memo || '메모가 없습니다.'}
              </div>
            </section>

            <section
              aria-labelledby='task-register-heading'
              className='space-y-2 sm:space-y-3'>
              <h2
                id='task-register-heading'
                className='text-sm font-semibold text-foreground'>
                등록 일시
              </h2>
              <div className='rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm text-foreground shadow-sm sm:px-5 sm:py-4'>
                {formatRegisterDatetime(data.registerDatetime)}
              </div>
            </section>

            <section
              aria-labelledby='task-status-heading'
              className='space-y-2 sm:space-y-3'>
              <div className='space-y-1'>
                <h2
                  id='task-status-heading'
                  className='text-sm font-semibold text-foreground'>
                  상태 변경
                </h2>
                <p className='text-sm text-muted-foreground'>
                  현재 진행 상태에 맞게 한 번만 선택하면 바로 반영됩니다.
                </p>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                {taskStatusOptions.map((status) => {
                  const isSelected = data.status === status;

                  return (
                    <Button
                      key={status}
                      type='button'
                      variant={isSelected ? 'default' : 'outline'}
                      aria-pressed={isSelected}
                      disabled={isStatusUpdating}
                      className='h-auto min-h-16 flex-col items-start rounded-2xl px-4 py-3 text-left sm:min-h-24 sm:py-4'
                      onClick={() => void handleStatusChange(status)}>
                      <span className='text-sm font-semibold'>
                        {formatTaskStatusLabel(status)}
                      </span>
                      <span className='text-xs opacity-80'>
                        {status === 'TODO'
                          ? '아직 처리 전이거나 다시 확인이 필요한 상태'
                          : '할 일을 마쳐서 완료로 정리한 상태'}
                      </span>
                    </Button>
                  );
                })}
              </div>

              <p className='text-sm text-muted-foreground'>
                현재 상태는{' '}
                <span className='font-medium text-foreground'>
                  {formatTaskStatusLabel(data.status)}
                </span>
                입니다.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        taskId={id}
        onClose={() => {
          if (!isDeleting) setIsDeleteOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default TaskDetailPage;

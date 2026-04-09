import {
  Badge,
} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatTaskStatusLabel } from '@/store/taskStatusStore';
import type { TaskStatus } from '@/types/api';

type TaskCardProps = {
  id: string;
  title: string;
  memo: string;
  status: TaskStatus;
  onClick?: () => void;
  className?: string;
};

function TaskCard({ id, title, memo, status, onClick, className }: TaskCardProps) {
  const isInteractive = Boolean(onClick);
  const isDone = status === 'DONE';

  const cardContent = (
    <Card
      size='sm'
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border/60 bg-background/95 shadow-sm transition-all duration-200',
        isInteractive &&
          'cursor-pointer hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus-within:border-primary/40',
      )}>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.10),transparent_30%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100' />

      <CardContent className='relative p-5 sm:p-6'>
        <div className='space-y-3'>
          <div className='flex items-start justify-between gap-3'>
            <Badge
              variant='outline'
              className={cn(
                'border px-2.5 py-1 text-xs font-semibold',
                isDone
                  ? 'border-success/20 bg-success/10 text-success'
                  : 'border-primary/20 bg-primary/15 text-foreground',
              )}>
              {formatTaskStatusLabel(status)}
            </Badge>
          </div>

          <CardTitle className='line-clamp-2 text-lg font-semibold leading-7 tracking-tight text-foreground'>
            {title}
          </CardTitle>
          <p className='line-clamp-3 text-sm leading-6 text-muted-foreground'>
            {memo || '메모가 없습니다.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (isInteractive) {
    return (
      <button
        type='button'
        data-task-card='true'
        aria-label={`할 일 열기: ${title} (${id})`}
        onClick={onClick}
        className={cn('w-full text-left outline-none', className)}>
        {cardContent}
      </button>
    );
  }

  return (
    <article data-task-card='true' className={cn('w-full', className)}>
      {cardContent}
    </article>
  );
}

export { TaskCard };

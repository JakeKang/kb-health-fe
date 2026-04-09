import type { LucideIcon } from 'lucide-react';

import { Link } from '@tanstack/react-router';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  to?: '/task';
  className?: string;
};

function StatCard({ icon: Icon, label, value, to, className }: StatCardProps) {
  const formattedValue = new Intl.NumberFormat('ko-KR').format(value);
  const isInteractive = Boolean(to);

  const card = (
    <Card
      aria-label={`${label}: ${formattedValue}`}
      className={cn(
        'relative overflow-hidden rounded-lg border border-border/60 bg-background/95 shadow-sm transition-all duration-200',
        isInteractive &&
          'hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus-within:border-primary/40',
        className,
      )}>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_32%)]' />

      <CardHeader className='relative flex flex-row items-start justify-between gap-4 pb-4'>
        <div className='space-y-3'>
          <div className='inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground'>
            {label}
          </div>

          <div className='space-y-1'>
            <CardTitle className='text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
              {formattedValue}
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              현재 기준으로 집계된 항목입니다.
            </p>
          </div>
        </div>

        <div className='flex size-12 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/10 text-primary shadow-sm'>
          <Icon aria-hidden='true' className='size-5' />
        </div>
      </CardHeader>
      <CardContent className='relative pb-5 text-sm text-muted-foreground'>
        {isInteractive
          ? '카드를 눌러 할 일 목록으로 바로 이동하세요.'
          : '현재 기준으로 집계된 항목입니다.'}
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link
        to={to}
        className='block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
        {card}
      </Link>
    );
  }

  return card;
}

export { StatCard };

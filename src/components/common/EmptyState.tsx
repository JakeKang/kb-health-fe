import { FileX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type EmptyStateAction = {
  label: string;
  onClick: () => void;
};

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
};

function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      role='alert'
      aria-live='polite'
      className={cn(
        'mx-auto w-full max-w-2xl border border-dashed border-border/70 bg-card/80 text-center shadow-sm',
        className,
      )}>
      <CardHeader className='items-center gap-3 px-6 pt-8 text-center sm:px-8'>
        <div className='mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground'>
          <FileX aria-hidden='true' className='size-7' />
        </div>
        <div className='space-y-1'>
          <CardTitle className='text-lg font-semibold'>{title}</CardTitle>
          {description ? (
            <CardDescription className='mx-auto max-w-md text-sm leading-6'>
              {description}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>
      {action ? (
        <CardContent className='flex justify-center px-6 pb-8 sm:px-8'>
          <Button onClick={action.onClick} type='button'>
            {action.label}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}

export { EmptyState };

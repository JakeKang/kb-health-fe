import { FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  taskId: string | number;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

function ConfirmDeleteModal({ isOpen, taskId, onClose, onConfirm }: ConfirmDeleteModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const normalizedTaskId = String(taskId);
  const canConfirm = confirmationText.trim() === normalizedTaskId;
  const hasError = confirmationText.length > 0 && !canConfirm;

  useEffect(() => {
    if (!isOpen) { setConfirmationText(''); setIsSubmitting(false); }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!canConfirm || isSubmitting) return;
    try { setIsSubmitting(true); await onConfirm(); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className='overflow-hidden rounded-lg border border-border/60 bg-background/95 p-0 shadow-xl backdrop-blur-xl sm:max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader className='px-6 pb-4 pt-6 sm:px-8'>
            <DialogTitle className='text-left text-xl font-semibold tracking-tight text-foreground'>
              할 일을 삭제할까요?
            </DialogTitle>
            <DialogDescription className='text-left text-sm leading-6 text-muted-foreground'>
              삭제를 진행하려면 아래 입력란에
              <span className='mx-1 rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground'>
                {normalizedTaskId}
              </span>
              를 그대로 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 px-6 pb-6 sm:px-8'>
            <p className='rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive/90'>
              삭제된 데이터는 복구할 수 없습니다.
            </p>
            <div className='space-y-2'>
              <Label htmlFor='confirm-input'>삭제 확인용 ID</Label>
              <Input
                id='confirm-input'
                autoComplete='off'
                placeholder={normalizedTaskId}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.currentTarget.value)}
                aria-invalid={hasError}
                aria-describedby='confirm-help'
className={cn(
'h-11 rounded-md',
hasError && 'border-destructive focus-visible:ring-destructive/20'
)}
              />
              <p id='confirm-help' className={cn('text-xs', hasError ? 'text-destructive' : 'text-muted-foreground')}>
                {hasError ? '입력값이 일치하지 않습니다.' : '입력값이 일치해야 삭제 버튼이 활성화됩니다.'}
              </p>
            </div>
            <div className='flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end'>
              <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting} className='rounded-md'>
                취소
              </Button>
              <Button type='submit' variant='destructive' disabled={!canConfirm || isSubmitting} className='min-w-24 rounded-lg'>
                {isSubmitting ? '삭제 중...' : '삭제하기'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ConfirmDeleteModal };

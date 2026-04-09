import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import {
  ArrowRight,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn,
  Mail,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import { signIn } from '@/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInSchema, type SignInFormValues } from '@/lib/schema/auth';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { ErrorResponse } from '@/types/api';

type ErrorModalState = {
  open: boolean;
  message: string;
};

const defaultErrorModalState: ErrorModalState = {
  open: false,
  message: '',
};

function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const closeSessionExpiredDialog = useAuthStore(
    (state) => state.closeSessionExpiredDialog,
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState<ErrorModalState>(
    defaultErrorModalState,
  );

  useEffect(() => {
    closeSessionExpiredDialog();
  }, [closeSessionExpiredDialog]);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
      isValid,
    },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const shouldShowEmailError = Boolean(errors.email);

  const shouldShowPasswordError = Boolean(errors.password);

  const handleErrorModalChange = (open: boolean): void => {
    setErrorModal((previousState) =>
      open ? previousState : defaultErrorModalState,
    );
  };

  const onSubmit = async (values: SignInFormValues): Promise<void> => {
    try {
      setErrorModal(defaultErrorModalState);

      const response = await signIn(values);

      setTokens(response.data.accessToken, response.data.refreshToken);
      await navigate({ to: '/', replace: true });
    } catch (error) {
      const message = isAxiosError<ErrorResponse>(error)
        ? (error.response?.data?.errorMessage ?? '로그인에 실패했습니다.')
        : '알 수 없는 오류가 발생했습니다.';

      setErrorModal({
        open: true,
        message,
      });
    }
  };

  return (
    <>
      <main className='relative flex min-h-dvh items-center justify-center overflow-hidden bg-muted/20 px-4 py-10 sm:px-6 lg:px-8'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_34%)]' />

        <section aria-label='로그인' className='relative z-10 w-full max-w-md'>
          <div className='mb-6 space-y-3 text-center'>
            <div className='mx-auto flex size-14 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/20'>
              <LogIn aria-hidden='true' className='size-5' />
            </div>
            <div className='space-y-2'>
              <h1 className='text-3xl font-semibold tracking-tight text-foreground'>
                KB Health 로그인
              </h1>
              <p className='text-sm leading-6 text-muted-foreground'>
                등록된 계정으로 로그인하고 오늘의 건강 할 일 현황을 확인하세요.
              </p>
            </div>
          </div>

          <Card className='overflow-hidden rounded-lg border border-border/60 bg-background/90 shadow-2xl backdrop-blur-xl'>
            <CardHeader className='space-y-1 border-b border-border/60 pb-5'>
              <CardTitle className='text-xl font-semibold'>계정 인증</CardTitle>
              <CardDescription>
                이메일과 비밀번호를 입력해 서비스를 이용하세요.
              </CardDescription>
            </CardHeader>

            <CardContent className='p-6 sm:p-8'>
              <form
                aria-label='로그인 폼'
                className='space-y-5'
                noValidate
                onSubmit={handleSubmit(onSubmit)}>
                <div className='space-y-2'>
                  <Label htmlFor='email'>이메일</Label>
                  <div className='relative'>
                    <Mail
                      aria-hidden='true'
                      className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
                    />
                    <Input
                      id='email'
                      type='email'
                      inputMode='email'
                      autoComplete='email'
                      autoCapitalize='none'
                      spellCheck={false}
                      placeholder='test@example.com'
                      aria-invalid={shouldShowEmailError}
                      aria-describedby={
                        shouldShowEmailError ? 'email-error' : undefined
                      }
                      className={cn(
                        'h-11 rounded-xl pl-10',
                        shouldShowEmailError &&
                          'border-destructive focus-visible:ring-destructive/20',
                      )}
                      {...register('email')}
                    />
                  </div>

                  {shouldShowEmailError ? (
                    <p
                      id='email-error'
                      role='alert'
                      aria-live='polite'
                      className='text-sm text-destructive'>
                      {errors.email?.message}
                    </p>
                  ) : null}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='password'>비밀번호</Label>

                  <div className='relative'>
                    <LockKeyhole
                      aria-hidden='true'
                      className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
                    />

                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='current-password'
                      placeholder='비밀번호를 입력하세요'
                      aria-invalid={shouldShowPasswordError}
                      aria-describedby={
                        shouldShowPasswordError ? 'password-error' : undefined
                      }
                      className={cn(
                        'h-11 rounded-xl pl-10 pr-11',
                        shouldShowPasswordError &&
                          'border-destructive focus-visible:ring-destructive/20',
                      )}
                      {...register('password')}
                    />

                    <button
                      type='button'
                      aria-label={
                        showPassword ? '비밀번호 숨기기' : '비밀번호 보기'
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className='absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
                      {showPassword ? (
                        <EyeOff aria-hidden='true' className='size-4' />
                      ) : (
                        <Eye aria-hidden='true' className='size-4' />
                      )}
                    </button>
                  </div>

                  {shouldShowPasswordError ? (
                    <p
                      id='password-error'
                      role='alert'
                      aria-live='polite'
                      className='text-sm text-destructive'>
                      {errors.password?.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  type='submit'
                  disabled={!isValid || isSubmitting}
                  aria-disabled={!isValid || isSubmitting}
                  className='h-11 w-full rounded-xl'>
                  <span className='inline-flex items-center gap-2'>
                    로그인
                    <ArrowRight aria-hidden='true' className='size-4' />
                  </span>
                </Button>

                {/* 테스트 계정 안내 */}
                <div
                  role='note'
                  aria-label='테스트 계정 정보'
                  className='rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm'>
                  <p className='mb-1.5 font-medium text-foreground'>테스트 계정</p>
                  <div className='space-y-0.5 text-muted-foreground'>
                    <p>
                      이메일:{' '}
                      <code className='rounded bg-background px-1 py-0.5 font-mono text-xs'>
                        test@example.com
                      </code>
                    </p>
                    <p>
                      비밀번호:{' '}
                      <code className='rounded bg-background px-1 py-0.5 font-mono text-xs'>
                        Password1
                      </code>
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      <Dialog open={errorModal.open} onOpenChange={handleErrorModalChange}>
        <DialogContent
          showCloseButton={false}
          aria-describedby='sign-in-error-description'
          className='overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur-xl sm:max-w-md'>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--destructive)/0.10),_transparent_40%)]' />

            <DialogHeader className='relative px-6 pb-4 pt-8 text-center sm:px-8'>
              <DialogTitle className='text-xl font-semibold tracking-tight text-foreground'>
                로그인 실패
              </DialogTitle>

              <DialogDescription
                id='sign-in-error-description'
                className='mt-2 text-sm leading-6 text-muted-foreground break-words'>
                {errorModal.message}
              </DialogDescription>
            </DialogHeader>

            <div className='relative px-6 pb-6 pt-2 sm:px-8'>
              <div className='rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive/90'>
                입력한 계정 정보를 다시 확인한 뒤 재시도해주세요.
              </div>

              <Button
                type='button'
                onClick={() => setErrorModal(defaultErrorModalState)}
                className='mt-4 h-11 w-full rounded-xl'>
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SignInPage;

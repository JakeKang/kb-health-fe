import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient();

function RootLayout(): JSX.Element {
  const navigate = useNavigate();
  const isSessionExpiredDialogOpen = useAuthStore(
    (state) => state.isSessionExpiredDialogOpen,
  );
  const closeSessionExpiredDialog = useAuthStore(
    (state) => state.closeSessionExpiredDialog,
  );

  const handleMoveToSignIn = async (): Promise<void> => {
    closeSessionExpiredDialog();
    await navigate({ to: '/sign-in', replace: true });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />

      <Dialog open={isSessionExpiredDialogOpen}>
        <DialogContent
          showCloseButton={false}
          aria-describedby='session-expired-description'
          className='overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur-xl sm:max-w-md'>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_38%)]' />

            <DialogHeader className='relative px-6 pb-4 pt-8 text-center sm:px-8'>
              <DialogTitle className='text-xl font-semibold tracking-tight text-foreground'>
                로그인 또는 권한 확인이 필요합니다
              </DialogTitle>

              <DialogDescription
                id='session-expired-description'
                className='mt-2 text-sm leading-6 text-muted-foreground'>
                로그인 상태를 확인할 수 없거나 현재 화면에 접근할 권한이
                없습니다. 확인 버튼을 누르면 로그인 페이지로 이동해 다시 인증할
                수 있습니다.
              </DialogDescription>
            </DialogHeader>

            <div className='relative px-6 pb-6 pt-2 sm:px-8'>
              <Button
                type='button'
                onClick={() => void handleMoveToSignIn()}
                className='mt-4 h-11 w-full rounded-xl'>
                로그인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 개발 환경 전용 라우터 디버깅 도구입니다. 프로덕션 빌드에서는 렌더링되지 않습니다. */}
      {import.meta.env.DEV ? (
        <TanStackRouterDevtools position='bottom-right' />
      ) : null}
    </QueryClientProvider>
  );
}

export default RootLayout;

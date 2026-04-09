import { useState } from 'react';

import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import {
  CheckSquare,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserCircle2,
} from 'lucide-react';

import { getAuthNavigationItem } from '@/layouts/authNavigation';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

type NavigationItem = {
  to: '/' | '/task';
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    to: '/',
    label: '대시보드',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: '/task',
    label: '할 일',
    icon: CheckSquare,
  },
];

type GNBHeaderProps = {
  onRequestLogout: () => void;
};

function GNBHeader({ onRequestLogout }: GNBHeaderProps): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const authNavigationItem = getAuthNavigationItem(isAuthenticated);
  const AuthIcon = isAuthenticated ? UserCircle2 : LogIn;

  return (
    <header className='fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85'>
      <nav
        aria-label='주요 내비게이션'
        className='mx-auto flex h-(--gnb-height) min-h-(--gnb-height) max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
          <span className='flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <LayoutDashboard aria-hidden='true' className='size-4' />
          </span>
          <span>KB Health</span>
        </Link>

        <div className='flex items-center gap-2'>
          <Link
            className={buttonVariants({ size: 'default', variant: 'ghost' })}
            to={authNavigationItem.to}>
            <AuthIcon aria-hidden='true' className='size-4' />
            <span>{authNavigationItem.label}</span>
          </Link>

          {isAuthenticated ? (
            <Button
              onClick={onRequestLogout}
              size='default'
              type='button'
              variant='ghost'>
              <LogOut aria-hidden='true' className='size-4' />
              <span className='hidden sm:inline'>로그아웃</span>
            </Button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

function AppLayout(): JSX.Element {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleConfirmLogout = async (): Promise<void> => {
    setIsLogoutDialogOpen(false);
    await navigate({ to: '/', replace: true });
    logout();
  };

  return (
    <div className='h-dvh overflow-hidden bg-muted/20'>
      <GNBHeader onRequestLogout={() => setIsLogoutDialogOpen(true)} />

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent
          showCloseButton={false}
          aria-describedby='logout-confirm-description'
          className='overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur-xl sm:max-w-md'>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_38%)]' />

            <DialogHeader className='relative px-6 pb-4 pt-8 text-center sm:px-8'>
              <DialogTitle className='text-xl font-semibold tracking-tight text-foreground'>
                로그아웃할까요?
              </DialogTitle>

              <DialogDescription
                id='logout-confirm-description'
                className='mt-2 text-sm leading-6 text-muted-foreground'>
                현재 계정에서 로그아웃하고 공개 대시보드로 이동합니다.
              </DialogDescription>
            </DialogHeader>

            <div className='relative px-6 pb-6 pt-2 sm:px-8'>
              <div className='rounded-2xl border border-border/70 bg-muted/60 px-4 py-3 text-sm text-muted-foreground'>
                취소하면 지금 보고 있는 화면에 그대로 머무릅니다.
              </div>

              <div className='mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
                <DialogClose
                  render={
                    <Button
                      type='button'
                      variant='outline'
                      className='h-11 rounded-xl'
                    />
                  }>
                  취소
                </DialogClose>
                <Button
                  type='button'
                  onClick={() => void handleConfirmLogout()}
                  className='h-11 rounded-xl'>
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className='mx-auto flex h-full max-w-screen-2xl flex-col pt-(--gnb-height) md:flex-row'>
        <nav
          aria-label='사이드 내비게이션'
          className='fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85 md:sticky md:top-(--gnb-height) md:z-30 md:h-[calc(100dvh-var(--gnb-height))] md:w-(--lnb-width) md:self-start md:border-r md:border-t-0 md:bg-transparent md:backdrop-blur-none'>
          <ul className='grid h-16 grid-cols-2 md:flex md:h-full md:flex-col md:gap-2 md:px-3 md:pb-4 md:pt-4'>
            {navigationItems.map(({ to, label, icon: Icon, exact }) => (
              <li key={to} className='min-w-0 md:w-full'>
                <Link
                  to={to}
                  activeOptions={{ exact }}
                  activeProps={{
                    'aria-current': 'page',
                    className: 'bg-primary/10 text-primary shadow-sm',
                  }}
                  inactiveProps={{
                    className:
                      'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                  }}
                  className={cn(
                    'flex h-full flex-col items-center justify-center gap-1 rounded-none px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground md:min-h-11 md:w-full md:flex-row md:justify-start md:gap-3 md:rounded-xl md:px-4 md:py-3 md:text-sm',
                  )}>
                  <Icon aria-hidden='true' className='size-5 shrink-0' />
                  <span className='truncate'>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className='min-h-0 w-full flex-1 overflow-y-auto px-3 pb-20 pt-4 sm:px-6 sm:pt-6 md:px-6 md:pb-8 md:pt-6 lg:px-8'>
          <div className='mx-auto flex max-w-screen-2xl flex-col md:flex-row'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

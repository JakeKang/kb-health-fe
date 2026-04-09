import { EmptyState } from '@/components/common/EmptyState';
import { Spinner } from '@/components/common/Spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';

function UserPage() {
  const { data, isError, isPending } = useUser();

  if (isPending) {
    return (
      <main aria-label='회원정보' className='space-y-6'>
        <header className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight'>회원정보</h1>
          <p className='text-sm text-muted-foreground'>
            프로필 정보를 불러오고 있습니다.
          </p>
        </header>
        <Spinner />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main aria-label='회원정보' className='space-y-6'>
        <header className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight'>회원정보</h1>
        </header>
        <EmptyState
          title='불러오기 실패'
          description='회원정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
        />
      </main>
    );
  }

  return (
    <main aria-label='회원정보' className='w-full space-y-6'>
      <header className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>회원정보</h1>
        <p className='text-sm text-muted-foreground'>
          로그인한 사용자의 기본 프로필 정보를 조회해 이름과 메모를 한눈에
          확인할 수 있습니다.
        </p>
      </header>

      <Card className='border border-border/70 bg-card/95 shadow-sm'>
        <CardHeader className='gap-3 border-b border-border/60 pb-5'>
          <div className='space-y-1'>
            <CardDescription className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/90'>
              Profile
            </CardDescription>
            <CardTitle className='text-2xl font-semibold tracking-tight'>
              {data.name}
            </CardTitle>
          </div>
          <CardDescription className='leading-6'>
            현재 인증된 계정의 회원정보입니다.
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-4 pt-6'>
          <div className='space-y-2 rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm'>
            <p className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/90'>
              이름
            </p>
            <p className='text-base font-medium text-foreground'>{data.name}</p>
          </div>
          <div className='space-y-2 rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm'>
            <p className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/90'>
              메모
            </p>
            <p className='text-sm leading-7 text-foreground whitespace-pre-wrap'>
              {data.memo || '메모가 없습니다.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default UserPage;

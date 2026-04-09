import type { LucideIcon } from 'lucide-react'

import { Link } from '@tanstack/react-router'

import { CheckCircle2, Clock, ListTodo, LockKeyhole } from 'lucide-react'

import { StatCard } from '@/components/common/StatCard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/hooks/useDashboard'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { DashboardResponse } from '@/types/api'

type DashboardStat = {
  key: keyof DashboardResponse
  label: string
  icon: LucideIcon
}

const dashboardStats: DashboardStat[] = [
  {
    key: 'numOfTask',
    label: '전체 할 일',
    icon: ListTodo,
  },
  {
    key: 'numOfRestTask',
    label: '해야할 일',
    icon: Clock,
  },
  {
    key: 'numOfDoneTask',
    label: '완료한 일',
    icon: CheckCircle2,
  },
]

function DashboardSkeletonCard({ icon: Icon, label }: Pick<DashboardStat, 'icon' | 'label'>) {
  return (
    <Card className="border border-border/70 bg-card/90 shadow-sm transition-transform duration-200">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/90">
            {label}
          </p>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  )
}

function DashboardLockedCard({ icon: Icon, label }: Pick<DashboardStat, 'icon' | 'label'>) {
  return (
    <Card
      aria-disabled="true"
      className="border border-border/70 bg-muted/40 opacity-80 shadow-sm grayscale-[0.15]"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/90">
            {label}
          </p>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground/80">
              로그인 필요
            </CardTitle>
            <CardDescription>로그인 후 대시보드 통계를 확인할 수 있습니다.</CardDescription>
          </div>
        </div>
        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
        <LockKeyhole aria-hidden="true" className="size-4" />
        <span>수치는 로그인한 뒤에만 조회됩니다.</span>
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { data, isError, isPending } = useDashboard({ enabled: isAuthenticated })

  return (
    <main aria-labelledby="dashboard-heading" className="space-y-4 sm:space-y-6">
      <header className="space-y-1 sm:space-y-2">
        <h1 id="dashboard-heading" className="text-xl font-semibold tracking-tight sm:text-3xl">
          대시보드
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAuthenticated
            ? '오늘 처리할 일의 흐름을 한눈에 보고, 원하는 카드에서 바로 목록으로 이동할 수 있습니다.'
            : '로그인하면 오늘의 할 일 현황을 확인하고 바로 목록으로 이어서 볼 수 있습니다.'}
        </p>
      </header>

      {!isAuthenticated ? (
        <>
          <Card aria-live="polite" className="border border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">로그인이 필요합니다</CardTitle>
              <CardDescription className="text-sm">
                현재 대시보드는 잠금 상태입니다. 로그인하면 전체 할 일, 해야 할 일, 완료한 일을 바로 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/sign-in"
                className={cn(buttonVariants(), 'w-fit')}
              >
                로그인하러 가기
              </Link>
            </CardContent>
          </Card>

          <section aria-label="로그인 필요 통계" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {dashboardStats.map(({ icon, label }) => (
              <DashboardLockedCard key={label} icon={icon} label={label} />
            ))}
          </section>
        </>
      ) : isError ? (
        <Card aria-live="polite" className="border border-destructive/20 bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-destructive">대시보드 로딩 오류</CardTitle>
            <CardDescription className="text-sm text-destructive/80">
              대시보드 통계를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
          <section aria-label="할 일 통계" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {isPending
            ? dashboardStats.map(({ icon, label }) => (
                <DashboardSkeletonCard key={label} icon={icon} label={label} />
              ))
            : dashboardStats.map(({ key, icon, label }) => (
                <StatCard
                  key={key}
                  icon={icon}
                  label={label}
                  value={data?.[key] ?? 0}
                  to="/task"
                />
              ))}
        </section>
      )}
    </main>
  )
}

export default DashboardPage

import { Link } from '@tanstack/react-router'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-3xl overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-4 px-6 py-10 text-center sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="mx-auto inline-flex rounded-full border border-border/70 bg-muted/60 px-4 py-1.5 text-sm font-semibold tracking-[0.22em] text-muted-foreground">
            404
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            입력한 주소를 찾지 못했습니다
          </CardTitle>
          <CardDescription className="mx-auto max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            요청한 페이지가 없거나 이동되었습니다. 대시보드로 돌아가 다시 시작해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center px-6 pb-10 sm:px-10 sm:pb-12 lg:px-14 lg:pb-16">
          <Link className={buttonVariants({ size: 'lg' })} to="/">
            대시보드로 가기
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

export default NotFoundPage

import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

type SpinnerProps = {
  className?: string
  label?: string
}

function Spinner({ className, label = "로딩 중" }: SpinnerProps) {
  const statusProps = {
    role: "status",
    "aria-label": label,
  } as const

  return (
    <output
      {...statusProps}
      className={cn("inline-flex items-center justify-center text-primary", className)}
    >
      <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
      <span className="sr-only">{label}</span>
    </output>
  )
}

export { Spinner }

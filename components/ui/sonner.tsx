"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-md group-[.toaster]:rounded-xl group-[.toaster]:font-sans",
          description: "group-[.toast]:text-slate-400 group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-cyan-500 group-[.toast]:text-slate-950 group-[.toast]:font-semibold group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300 group-[.toast]:rounded-lg",
          closeButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400 group-[.toast]:border-slate-700 hover:group-[.toast]:text-white",
          success:
            "group-[.toaster]:border-emerald-500/40 group-[.toaster]:bg-emerald-950/40 text-emerald-300",
          error:
            "group-[.toaster]:border-rose-500/40 group-[.toaster]:bg-rose-950/40 text-rose-300",
          warning:
            "group-[.toaster]:border-amber-500/40 group-[.toaster]:bg-amber-950/40 text-amber-300",
          info:
            "group-[.toaster]:border-cyan-500/40 group-[.toaster]:bg-cyan-950/40 text-cyan-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

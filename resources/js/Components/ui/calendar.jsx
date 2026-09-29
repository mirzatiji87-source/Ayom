"use client"

import * as React from "react"
import { cn } from "cn"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "@/Components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: "w-fit",
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex w-full flex-col gap-4",
        nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between px-1",
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 p-0 select-none disabled:opacity-50"
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 p-0 select-none disabled:opacity-50"
        ),
        month_caption: "flex h-8 w-full items-center justify-center",
        dropdowns: "flex h-8 w-full items-center justify-center gap-1.5 text-sm font-medium",
        dropdown_root: "relative rounded-md",
        dropdown: "absolute inset-0 bg-popover opacity-0",
        caption_label:
          captionLayout === "label"
            ? "text-sm font-medium"
            : "flex items-center gap-1 rounded-md text-sm [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-muted-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "group/day relative h-8 w-8 p-0 text-center text-sm",
        range_start: "rounded-l-md bg-muted",
        range_middle: "rounded-none bg-muted",
        range_end: "rounded-r-md bg-muted",
        today: "rounded-md bg-muted font-semibold text-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("h-4 w-4", className)} {...props} />
          }
          if (orientation === "right") {
            return <ChevronRightIcon className={cn("h-4 w-4", className)} {...props} />
          }
          return <ChevronDownIcon className={cn("h-4 w-4", className)} {...props} />
        },
        DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({ className, day, modifiers, locale, ...props }) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const isSelected =
    modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString(locale?.code)}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        modifiers.range_start && "rounded-l-md bg-primary text-primary-foreground",
        modifiers.range_end && "rounded-r-md bg-primary text-primary-foreground",
        modifiers.range_middle && "rounded-none bg-muted text-foreground",
        modifiers.disabled && "pointer-events-none opacity-30",
        modifiers.outside && "text-muted-foreground opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
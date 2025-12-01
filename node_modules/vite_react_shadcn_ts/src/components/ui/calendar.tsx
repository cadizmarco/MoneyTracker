import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  // Optional convenience prop: list of dates to highlight (also supported via DayPicker's `modifiers`)
  highlightedDates?: (Date | string)[];
};

function Calendar({ className, classNames, showOutsideDays = true, modifiersClassNames, highlightedDates, ...props }: CalendarProps) {
  // Build a default modifiersClassNames mapping so callers can use a modifier key like `hasTx`
  // to mark days with transactions. Consumers (pages) can still pass their own mapping.
  const defaultModifiersClassNames = {
    // Adds a small dot under the day to indicate a transaction exists on that date
    hasTx:
      'relative before:content-["\\00a0"] before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-1 before:rounded-full before:bg-emerald-500',
  } as Record<string, string>;

  const finalModifiersClassNames = { ...(defaultModifiersClassNames || {}), ...(modifiersClassNames || {}) };

  // If highlightedDates is provided, convert to Date objects and expose as a `hasTx` modifier
  const forwardedModifiers = (props.modifiers || {}) as Record<string, any>;
  if (highlightedDates && highlightedDates.length > 0) {
    forwardedModifiers.hasTx = (highlightedDates || []).map((d) => (typeof d === 'string' ? new Date(d) : d));
  }
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      modifiers={forwardedModifiers}
      modifiersClassNames={finalModifiersClassNames}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

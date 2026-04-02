declare module "react-big-calendar" {
  import type { ComponentType } from "react";

  export interface Event {
    title?: string;
    start?: Date;
    end?: Date;
    resource?: unknown;
  }

  export type DateLocalizer = {
    format: (date: Date, format: string, culture?: string) => string;
    parse: (str: string, format: string, culture?: string) => Date;
    startOfWeek: (date: Date, culture?: string) => Date;
    getDay: (date: Date) => number;
    locales?: Record<string, unknown>;
  };

  export function dateFnsLocalizer(config: Record<string, unknown>): DateLocalizer;

  export const Calendar: ComponentType<{
    localizer: DateLocalizer;
    events: Event[];
    startAccessor: string;
    endAccessor: string;
    onRangeChange?: (range: Date[] | { start: Date; end: Date }) => void;
    onNavigate?: (date: Date) => void;
    onSelectEvent?: (event: Event) => void;
    style?: React.CSSProperties;
    eventPropGetter?: (event: Event) => { className?: string; style?: React.CSSProperties };
  }>;
}

"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ChangeTimeFormatInput() {
  const { use24HourFormat, setUse24HourFormat, t } = useCalendar();

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{t("settings.timeFormat")}</p>

      <Select value={use24HourFormat ? "24" : "12"} onValueChange={value => setUse24HourFormat(value === "24")}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="12">{t("timeFormat.12")}</SelectItem>
          <SelectItem value="24">{t("timeFormat.24")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

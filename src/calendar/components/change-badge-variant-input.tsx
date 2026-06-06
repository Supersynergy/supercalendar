"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ChangeBadgeVariantInput() {
  const { badgeVariant, setBadgeVariant, t } = useCalendar();

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{t("settings.badgeVariant")}</p>

      <Select value={badgeVariant} onValueChange={setBadgeVariant}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="dot">{t("badge.dot")}</SelectItem>
          <SelectItem value="colored">{t("badge.colored")}</SelectItem>
          <SelectItem value="mixed">{t("badge.mixed")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

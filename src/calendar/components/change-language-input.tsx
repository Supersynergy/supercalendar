"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { LANGUAGES } from "@/calendar/i18n/locales";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ChangeLanguageInput() {
  const { localeCode, setLocaleCode, t } = useCalendar();

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{t("settings.language")}</p>

      <Select value={localeCode} onValueChange={setLocaleCode}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>

        <SelectContent className="max-h-72">
          {LANGUAGES.map(language => (
            <SelectItem key={language.code} value={language.code}>
              {language.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

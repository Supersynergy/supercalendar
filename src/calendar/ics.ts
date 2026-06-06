import type { IEvent } from "@/calendar/interfaces";

// Minimal RFC 5545 export — enough to import into Apple/Google/Outlook calendars.
function toICSDate(value: string): string {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeICS(value: string): string {
  return (value ?? "").replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");
}

export function eventsToICS(events: IEvent[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SuperSynergy//SuperCalendar//EN", "CALSCALE:GREGORIAN"];

  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:supercalendar-${event.id}@supersynergy.de`,
      `DTSTART:${toICSDate(event.startDate)}`,
      `DTEND:${toICSDate(event.endDate)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(event.description)}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(events: IEvent[], filename = "supercalendar.ics"): void {
  const blob = new Blob([eventsToICS(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

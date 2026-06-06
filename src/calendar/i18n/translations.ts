// UI string catalog. English is the complete source of truth (and fallback);
// every other language overrides the keys it has translated. Date/time wording
// is handled separately by date-fns locales (see ./locales), so this catalog
// only covers static chrome.

const en = {
  today: "Today",
  addEvent: "Add Event",
  "view.day": "View by day",
  "view.week": "View by week",
  "view.month": "View by month",
  "view.year": "View by year",
  "view.agenda": "View by agenda",
  "settings.title": "Calendar settings",
  "settings.badgeVariant": "Change badge variant",
  "settings.timeFormat": "Time format",
  "settings.language": "Language",
  "settings.visibleHours": "Change visible hours",
  "settings.workingHours": "Change working hours",
  "badge.dot": "Dot",
  "badge.colored": "Colored",
  "badge.mixed": "Mixed",
  "timeFormat.12": "12-hour (AM/PM)",
  "timeFormat.24": "24-hour",
  "event.responsible": "Responsible",
  "event.startDate": "Start Date",
  "event.endDate": "End Date",
  "event.description": "Description",
  "event.edit": "Edit",
  "event.hintNavigate": "navigate",
  "event.hintEdit": "edit",
  "dialog.editEvent": "Edit Event",
  "dialog.addEvent": "Add New Event",
  "dialog.title": "Title",
  "dialog.startTime": "Start Time",
  "dialog.endTime": "End Time",
  "dialog.color": "Color",
  "dialog.cancel": "Cancel",
  "dialog.save": "Save changes",
  "dialog.create": "Create Event",
  "dialog.selectOption": "Select an option",
  "dialog.enterTitle": "Enter a title",
  "color.blue": "Blue",
  "color.green": "Green",
  "color.red": "Red",
  "color.yellow": "Yellow",
  "color.purple": "Purple",
  "color.orange": "Orange",
  "color.gray": "Gray",
} as const;

export type TranslationKey = keyof typeof en;

type Catalog = Partial<Record<TranslationKey, string>>;

const de: Catalog = {
  today: "Heute",
  addEvent: "Termin hinzufügen",
  "view.day": "Tagesansicht",
  "view.week": "Wochenansicht",
  "view.month": "Monatsansicht",
  "view.year": "Jahresansicht",
  "view.agenda": "Agenda-Ansicht",
  "settings.title": "Kalendereinstellungen",
  "settings.badgeVariant": "Anzeigevariante ändern",
  "settings.timeFormat": "Zeitformat",
  "settings.language": "Sprache",
  "settings.visibleHours": "Sichtbare Stunden ändern",
  "settings.workingHours": "Arbeitszeiten ändern",
  "badge.dot": "Punkt",
  "badge.colored": "Farbig",
  "badge.mixed": "Gemischt",
  "timeFormat.12": "12 Stunden (AM/PM)",
  "timeFormat.24": "24 Stunden",
  "event.responsible": "Verantwortlich",
  "event.startDate": "Beginn",
  "event.endDate": "Ende",
  "event.description": "Beschreibung",
  "event.edit": "Bearbeiten",
  "event.hintNavigate": "navigieren",
  "event.hintEdit": "bearbeiten",
  "dialog.editEvent": "Termin bearbeiten",
  "dialog.addEvent": "Neuen Termin anlegen",
  "dialog.title": "Titel",
  "dialog.startTime": "Startzeit",
  "dialog.endTime": "Endzeit",
  "dialog.color": "Farbe",
  "dialog.cancel": "Abbrechen",
  "dialog.save": "Änderungen speichern",
  "dialog.create": "Termin erstellen",
  "dialog.selectOption": "Option auswählen",
  "dialog.enterTitle": "Titel eingeben",
  "color.blue": "Blau",
  "color.green": "Grün",
  "color.red": "Rot",
  "color.yellow": "Gelb",
  "color.purple": "Lila",
  "color.orange": "Orange",
  "color.gray": "Grau",
};

// Region variants reuse the base catalog until they need overrides.
const CATALOGS: Record<string, Catalog> = {
  "en-US": en,
  "en-GB": en,
  de,
};

export function translate(code: string, key: TranslationKey): string {
  return CATALOGS[code]?.[key] ?? en[key];
}

export type TranslateFn = (key: TranslationKey) => string;

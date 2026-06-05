import { describe, expect, it } from "vitest";

import { getEventsCount, groupEvents, navigateDate, rangeText } from "@/calendar/helpers";
import type { IEvent } from "@/calendar/interfaces";

function makeEvent(id: number, startDate: string, endDate: string): IEvent {
  return {
    id,
    startDate,
    endDate,
    title: `Event ${id}`,
    color: "blue",
    description: "",
    user: { id: "u1", name: "Test User", picturePath: null },
  };
}

describe("rangeText", () => {
  it("formats a single day for the day view", () => {
    expect(rangeText("day", new Date(2026, 0, 15))).toBe("Jan 15, 2026");
  });

  it("formats a month range for the month view", () => {
    expect(rangeText("month", new Date(2026, 0, 15))).toBe("Jan 1, 2026 - Jan 31, 2026");
  });
});

describe("navigateDate", () => {
  it("moves to the next month", () => {
    expect(navigateDate(new Date(2026, 0, 15), "month", "next").getMonth()).toBe(1);
  });

  it("moves to the previous day", () => {
    expect(navigateDate(new Date(2026, 0, 15), "day", "previous").getDate()).toBe(14);
  });
});

describe("getEventsCount", () => {
  const events = [
    makeEvent(1, "2026-01-05T10:00:00.000Z", "2026-01-05T11:00:00.000Z"),
    makeEvent(2, "2026-01-20T10:00:00.000Z", "2026-01-20T11:00:00.000Z"),
    makeEvent(3, "2026-02-02T10:00:00.000Z", "2026-02-02T11:00:00.000Z"),
  ];

  it("counts only events within the same month", () => {
    expect(getEventsCount(events, new Date(2026, 0, 15), "month")).toBe(2);
  });
});

describe("groupEvents", () => {
  it("packs non-overlapping events into a single column", () => {
    const groups = groupEvents([
      makeEvent(1, "2026-01-05T09:00:00.000Z", "2026-01-05T10:00:00.000Z"),
      makeEvent(2, "2026-01-05T10:00:00.000Z", "2026-01-05T11:00:00.000Z"),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
  });

  it("splits overlapping events into separate columns", () => {
    const groups = groupEvents([
      makeEvent(1, "2026-01-05T09:00:00.000Z", "2026-01-05T11:00:00.000Z"),
      makeEvent(2, "2026-01-05T10:00:00.000Z", "2026-01-05T12:00:00.000Z"),
    ]);

    expect(groups).toHaveLength(2);
  });
});

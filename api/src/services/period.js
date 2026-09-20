export function resolvePeriod({ start, end, timezone = "UTC" } = {}) {
  if (!start && !end) { const finish = new Date(); const begin = new Date(finish); begin.setUTCDate(begin.getUTCDate() - 30); return { start: begin, end: finish, timezone }; }
  if (!start || !end) throw Object.assign(new Error("Both start and end are required."), { code: "INVALID_INPUT" });
  const begin = new Date(start); const finish = new Date(end);
  if (Number.isNaN(begin.valueOf()) || Number.isNaN(finish.valueOf()) || begin >= finish) throw Object.assign(new Error("Invalid or reversed period."), { code: "INVALID_INPUT" });
  if ((finish - begin) > 366 * 24 * 60 * 60 * 1000) throw Object.assign(new Error("Analysis period exceeds 366 days."), { code: "INVALID_INPUT" });
  return { start: begin, end: finish, timezone };
}

export function inPeriod(value, period) { const time = new Date(value); return !Number.isNaN(time.valueOf()) && time >= period.start && time < period.end; }

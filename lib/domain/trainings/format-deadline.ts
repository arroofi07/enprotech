const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

const LONG_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export function formatTrainingDeadline(
  deadline: string | null,
  style: "short" | "long" = "short",
): string | null {
  if (!deadline) {
    return null;
  }

  const [year, month, day] = deadline.split("-");
  if (!year || !month || !day) {
    return deadline;
  }

  const monthIndex = Number(month) - 1;
  const months = style === "long" ? LONG_MONTHS : SHORT_MONTHS;
  const monthLabel = months[monthIndex] ?? month;

  return `${Number(day)} ${monthLabel} ${year}`;
}

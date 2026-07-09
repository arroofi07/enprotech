export function formatModuleRequirement(value: number): string {
  return value > 0 ? `${value}%` : "—";
}

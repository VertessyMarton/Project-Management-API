export function getExclusiveUpperDate(value: string): Date {
  const date = new Date(value);

  if (!value.includes('T')) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return date;
}

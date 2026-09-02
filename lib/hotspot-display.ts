/** Display titles for hotspot UI: part name is primary, substance is secondary. */
export function hotspotTitles(item: {
  label: string;
  partLabel?: string | null;
}): { primary: string; secondary: string | null } {
  const part = item.partLabel?.trim();
  if (part) {
    return { primary: part, secondary: item.label };
  }
  return { primary: item.label, secondary: null };
}

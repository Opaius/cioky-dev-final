import { getComputedColor } from "./getComputedColor";

export function hexToRgb(
  color: string,
  normalize: boolean = false,
): [number, number, number] {
  // Helper to normalize values if needed
  const norm = (value: number) => (normalize ? value / 255 : value);

  // Handle CSS variables
  if (color.startsWith("var(--")) {
    const resolvedColor = getComputedColor(color);
    if (resolvedColor.startsWith("var(--")) {
      console.warn(
        `Could not fully resolve CSS variable: ${color}. Falling back to white.`,
      );
      return [norm(255), norm(255), norm(255)];
    }
    return hexToRgb(resolvedColor, normalize); // recursive call with resolved value
  }

  // Handle rgb(...) strings
  const rgbMatch = color.match(
    /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i,
  );
  if (rgbMatch) {
    return rgbMatch.slice(1).map((v) => norm(parseInt(v))) as [
      number,
      number,
      number,
    ];
  }

  // Validate hex format (#RGB or #RRGGBB)
  const hexMatch = color.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hexMatch) {
    console.error("Invalid hex color:", color);
    return [norm(255), norm(255), norm(255)];
  }

  let hex = hexMatch[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join(""); // expand shorthand
  }

  const int = parseInt(hex, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return [norm(r), norm(g), norm(b)];
}

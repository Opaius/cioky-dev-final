export const getComputedColor = (color: string): string => {
  // Skip computation during server-side rendering
  if (typeof window === "undefined" && typeof document === "undefined")
    return color;

  let colorToConvert = color;

  // If it's a CSS variable, resolve it first
  if (color.startsWith("var(--")) {
    try {
      // Extract the variable name (e.g., '--color-primary' from 'var(--color-primary)')
      const varName = color.substring(4, color.length - 1);
      const resolvedColor = getComputedStyle(
        document.documentElement,
      ).getPropertyValue(varName);

      colorToConvert = resolvedColor.trim();
    } catch (e) {
      console.error("Could not resolve CSS variable:", color, e);
      return "rgb(255, 255, 255)"; // Fallback to white in RGB format
    }
  }

  // Convert to RGB using canvas (forces browser to do the color space conversion)
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "rgb(255, 255, 255)";

    ctx.fillStyle = colorToConvert;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;

    return a === 255
      ? `rgb(${r}, ${g}, ${b})`
      : `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  } catch (e) {
    console.error("Could not convert color to RGB:", colorToConvert, e);
    return "rgb(255, 255, 255)";
  }
};

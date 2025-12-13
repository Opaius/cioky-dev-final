export const getComputedColor = (color: string): string => {
  // Skip computation during server-side rendering
  if (typeof window === "undefined" && typeof document === "undefined")
    return color;

  // Simple cache to avoid repeated getComputedStyle calls
  const cacheKey = color;
  if (getComputedColor.cache.has(cacheKey)) {
    return getComputedColor.cache.get(cacheKey)!;
  }

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
      const fallback = "rgb(255, 255, 255)";
      getComputedColor.cache.set(cacheKey, fallback);
      return fallback;
    }
  }

  // Convert to RGB using canvas (forces browser to do the color space conversion)
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      const fallback = "rgb(255, 255, 255)";
      getComputedColor.cache.set(cacheKey, fallback);
      return fallback;
    }

    ctx.fillStyle = colorToConvert;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;

    const result =
      a === 255
        ? `rgb(${r}, ${g}, ${b})`
        : `rgba(${r}, ${g}, ${b}, ${a / 255})`;

    getComputedColor.cache.set(cacheKey, result);
    return result;
  } catch (e) {
    console.error("Could not convert color to RGB:", colorToConvert, e);
    const fallback = "rgb(255, 255, 255)";
    getComputedColor.cache.set(cacheKey, fallback);
    return fallback;
  }
};

// Add cache as a static property
getComputedColor.cache = new Map<string, string>();

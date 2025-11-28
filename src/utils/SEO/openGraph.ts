// src/utils/generateMetaTags.ts

// Fix 1: Remove the SolidJS-specific import if this is TanStack Router/React
// import type { JSX } from "solid-js";

// If you must keep the SolidJS import, use this for a placeholder type:
type MetaTag = {
  name?: string;
  property?: string;
  content?: string;
  title?: string; // Special case for TanStack Router
  [key: string]: any; // Allow other properties like httpEquiv, etc.
};

// Fix 2: Define the MetaArray as an array of the corrected MetaTag type
// NOTE: We no longer rely on HeadProps['meta'] which was causing the error.
type MetaArray = MetaTag[];

interface MetaInput {
  title: string;
  description: string;
  url: string; // Current page URL (e.g., https://domain.com/ro/)
  image: string; // Absolute URL for social image
  twitterHandle?: string;
  locale?: string; // e.g., 'ro_RO'
}

export const generateMetaTags = (input: MetaInput): MetaArray => {
  const {
    title,
    description,
    url,
    image,
    twitterHandle,
    locale = "ro",
  } = input;

  const metaTags: MetaArray = [
    // 1. Primary SEO Tags (for Google/Search Engines)
    { title: title }, // Special object for the main <title> tag
    { name: "description", content: description },

    // 2. Open Graph Tags (property="og:...")
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:locale", content: locale },
    { property: "og:image", content: image },

    // 3. Twitter Card Tags (name="twitter:...")
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];

  if (twitterHandle) {
    metaTags.push({ name: "twitter:site", content: twitterHandle });
  }

  return metaTags;
};

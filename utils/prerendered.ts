import { translatedPathnames } from "./pathnames";

export const prerenderRoutes = translatedPathnames.flatMap((item) =>
  item.localized.map(([_, path]) => ({
    path,
    prerender: {
      enabled: true,
    },
  })),
);

import { localizeHref } from "@/paraglide/runtime";
import { translatedPathnames } from "./pathnames";

export const prerenderRoutes = translatedPathnames.flatMap((path) =>
  path.localized.flatMap((localizedPath) =>
    localizedPath.map((p) => ({
      path: localizeHref(p),
      prerender: {
        enabled: true,
      },
    })),
  ),
);

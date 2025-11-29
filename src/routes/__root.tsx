import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";

import { HydrationScript } from "solid-js/web";
import { Suspense } from "solid-js";

import styleCss from "../styles.css?url";
import fontsCss from "../fonts.css?url";

import { getLocale } from "../paraglide/runtime";

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [
      { rel: "stylesheet", href: styleCss },
      {
        rel: "preload",
        href: fontsCss,
        as: "style",
      },
      {
        rel: "stylesheet",
        href: fontsCss,
        media: "print",
        onLoad: (e) => {
          (e.currentTarget as HTMLLinkElement).media = "all";
        },
      },
    ],
  }),
  shellComponent: RootComponent,
});

function RootComponent() {
  return (
    <html lang={getLocale()}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <Suspense>
          <Outlet />
          <TanStackRouterDevtools />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}

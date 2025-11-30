import { HeaderNav } from "@/components/header-nav";
import { HeroSection } from "@/components/hero-section";
import {
  BgContainer,
  BgController,
} from "@/components/ui/background-gradient-switch";
import { createFileRoute } from "@tanstack/solid-router";
import { m } from "@/paraglide/messages";
import { generateMetaTags } from "@/utils/SEO/openGraph";
import { getLocale } from "@/paraglide/runtime";
import { lazy } from "solid-js";
import { Suspense } from "solid-js";
import ProjectsSection from "@/components/projects-section";
import ToolsSection from "@/components/tools-section";
export const Route = createFileRoute("/")({
  component: App,
  head: () => {
    const locale = getLocale();
    const host = process.env.VITE_HOST || "http://localhost:3000";
    const metaTags = generateMetaTags({
      title: m.meta_homepage_title(),
      description: m.meta_homepage_description(),
      image: `${host}/og/${locale}-home.png`,
      url: `${host}/`,
    });
    return {
      meta: metaTags,
    };
  },
});

const BentoSection = lazy(() => import("@/components/bento-section"));

function App() {
  return (
    <div>
      <HeaderNav />
      <BgController>
        <HeroSection />
        <BgContainer bgEnd="var(--color-primary)">
          <Suspense>
            <BentoSection />
            <ProjectsSection />
          </Suspense>
        </BgContainer>
        <BgContainer bgEnd="var(--color-secondary)">
          <Suspense>
            <ToolsSection />
          </Suspense>
        </BgContainer>
      </BgController>
    </div>
  );
}

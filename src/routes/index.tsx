import { BentoSection } from "@/components/bento-section";
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

function App() {
  return (
    <div>
      <HeaderNav />
      <BgController>
        <HeroSection />
        <BgContainer bgEnd="var(--color-primary)">
          <BentoSection />
        </BgContainer>
      </BgController>
    </div>
  );
}

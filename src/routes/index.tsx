import { BentoSection } from "@/components/bento-section";
import { HeaderNav } from "@/components/header-nav";
import { HeroSection } from "@/components/hero-section";
import {
  BgContainer,
  BgController,
} from "@/components/ui/background-gradient-switch";
import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({ component: App });

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

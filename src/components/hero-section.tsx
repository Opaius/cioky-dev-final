import Particles from "./ui/particle-bg";
import SplitText from "./ui/split-text";
import GradientText from "./ui/gradient-text";
import { createSignal } from "solid-js";
import { Button } from "./ui/button";
import { m } from "@/paraglide/messages";
export function HeroSection() {
  const [startSecond, setStartSecond] = createSignal(false);
  return (
    <div class="relative h-screen w-full">
      <div class="absolute inset-0 h-full w-full">
        <Particles
          particleColors={[
            "var(--color-secondary)",
            "var(--color-primary)",
            "var(--color-accent)",
          ]}
          particleCount={1000}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={200}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      <div class="flex h-full w-full items-center justify-center px-8 sm:px-16">
        <div class="flex w-full max-w-2xl flex-col items-center justify-center gap-3">
          <SplitText
            class="text-text font-roboto-serif text-4xl font-bold md:text-5xl"
            ease="back.out(1.7)"
            duration={2}
            delay={500}
            splitType="lines"
            onLetterAnimationComplete={() => setStartSecond(true)}
          >
            {m.hero_title()}{" "}
            <span>
              <GradientText
                class="inline-block overflow-visible leading-14 font-bold"
                colors={[
                  "var(--color-primary)",
                  "var(--color-accent)",
                  "var(--color-secondary)",
                  "var(--color-primary)",
                  "var(--color-accent)",
                  "var(--color-secondary)",
                ]}
                animationSpeed={300}
              >
                {m.hero_gradient()}
              </GradientText>
            </span>
          </SplitText>
          <SplitText
            class="text-text font-roboto-serif text-base text-pretty md:text-xl"
            ease="back.out(1.7)"
            duration={2}
            delay={500}
            splitType="lines"
            start={startSecond()}
          >
            {m.hero_description()}
          </SplitText>
          <div class="grid w-full grid-rows-2 gap-3 sm:grid-cols-2 md:grid-rows-1">
            <Button class="font-space-grotesk text-text z-10 w-full rounded-xl font-bold">
              {m.hero_button_resume()}
            </Button>
            <Button
              variant="secondary"
              class="font-space-grotesk text-text z-10 w-full rounded-xl font-bold"
            >
              {m.hero_button_start_project()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

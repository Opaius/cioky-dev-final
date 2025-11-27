import {
  LucideFeather,
  LucidePiggyBank,
  LucideRocket,
  LucideTrendingUp,
} from "lucide-solid";

export function BentoSection() {
  return (
    <div class="grid w-full place-items-center">
      <div class="text-text font-space-grotesk grid max-w-4xl auto-rows-auto grid-cols-1 gap-4 p-8 text-center text-pretty *:size-full *:rounded-xl *:p-6 *:transition-all *:hover:scale-105 sm:grid-cols-2 sm:grid-rows-2 md:grid-cols-3">
        <div class="bg-card gap:2.5 flex flex-col items-center justify-center sm:col-span-2 sm:flex-row sm:gap-8 md:col-span-1 md:row-span-2 md:flex-col">
          <LucideFeather class="size-14 shrink-0 sm:size-21" />
          <h3 class="text-xl font-bold sm:text-3xl">
            Dedicated Focus, Modern Stack
          </h3>
          <p class="text-base leading-6">
            While I'm not a "Senior" developer with 20 years in the field, I
            bring maximum focus and an up-to-date knowledge of the latest, most
            efficient tech. You get reliable, clean code without paying for
            unnecessary legacy experience.{" "}
          </p>
        </div>
        <div class="bg-primary flex flex-col items-center gap-2.5">
          <LucidePiggyBank class="size-14" />
          <h3 class="text-lg font-bold">Zero Overhead = Real Savings</h3>
          <p class="text-base leading-6">
            I don't have an agency office or a sales team—your budget goes
            straight into the build, not into corporate costs.
          </p>
        </div>
        <div class="bg-accent text-background flex flex-col items-center gap-2.5">
          <LucideRocket class="size-14" />
          <h3 class="text-lg font-bold">Streamlined, Predictable Delivery</h3>
          <p class="text-base leading-6">
            We define the scope clearly upfront, and I manage my time to ensure
            a rapid launch that's reliable, not just rushed.
          </p>
        </div>
        <div class="bg-secondary flex flex-col items-center gap-2.5 sm:col-span-2 sm:flex-row sm:gap-8">
          <LucideTrendingUp class="size-14 shrink-0 sm:size-21" />
          <h3 class="text-xl font-bold sm:text-3xl">
            Solutions That Grow With You
          </h3>
          <p class="text-base leading-6">
            Whether you need a simple, solid marketing site or a mid-size web
            app that requires complex data handling, I build platforms that are
            flexible enough to meet your current needs and scale when your
            business is ready.
          </p>
        </div>
      </div>
    </div>
  );
}

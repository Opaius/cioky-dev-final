import {
  LucideFeather,
  LucidePiggyBank,
  LucideRocket,
  LucideTrendingUp,
} from "lucide-solid";
import { m } from "@/paraglide/messages";
export function BentoSection() {
  return (
    <div class="grid w-full place-items-center">
      <div class="text-text font-space-grotesk grid max-w-4xl auto-rows-auto grid-cols-1 gap-4 p-8 text-center text-pretty *:size-full *:rounded-xl *:p-6 *:transition-all *:hover:scale-105 sm:grid-cols-2 sm:grid-rows-2 md:grid-cols-3">
        <div class="bg-card gap:2.5 flex flex-col items-center justify-center sm:col-span-2 sm:flex-row sm:gap-8 md:col-span-1 md:row-span-2 md:flex-col">
          <LucideFeather class="size-14 shrink-0 sm:size-21" />
          <h3 class="text-xl font-bold sm:text-3xl">{m.bento_1_title()}</h3>
          <p class="text-base leading-6">{m.bento_1_description()}</p>
        </div>
        <div class="bg-primary flex flex-col items-center justify-center gap-2.5">
          <LucidePiggyBank class="size-14" />
          <h3 class="text-lg font-bold">{m.bento_2_title()}</h3>
          <p class="text-base leading-6">{m.bento_2_description()}</p>
        </div>
        <div class="bg-accent text-background flex flex-col items-center justify-center gap-2.5">
          <LucideRocket class="size-14" />
          <h3 class="text-lg font-bold">{m.bento_3_title()}</h3>
          <p class="text-base leading-6">{m.bento_3_description()}</p>
        </div>
        <div class="bg-secondary flex flex-col items-center gap-2.5 sm:col-span-2 sm:flex-row sm:gap-8">
          <LucideTrendingUp class="size-14 shrink-0 sm:size-21" />
          <h3 class="text-xl font-bold sm:text-3xl">{m.bento_4_title()}</h3>
          <p class="text-base leading-6">{m.bento_4_description()}</p>
        </div>
      </div>
    </div>
  );
}

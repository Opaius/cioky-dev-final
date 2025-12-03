import {
  LucideFeather,
  LucidePiggyBank,
  LucideRocket,
  LucideTrendingUp,
} from "lucide-solid";
import { m } from "@/paraglide/messages";
export default function BentoSection() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Freelancer Benefits",
    description:
      "Key advantages of working with an independent software developer",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Service",
          name: m.bento_1_title(),
          description: m.bento_1_description(),
          serviceType: "Web Development",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Service",
          name: m.bento_2_title(),
          description: m.bento_2_description(),
          serviceType: "Cost-Effective Development",
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "Service",
          name: m.bento_3_title(),
          description: m.bento_3_description(),
          serviceType: "Project Delivery",
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "Service",
          name: m.bento_4_title(),
          description: m.bento_4_description(),
          serviceType: "Scalable Solutions",
        },
      },
    ],
  };

  return (
    <section
      aria-label="Freelancer Benefits"
      class="grid w-full place-items-center"
    >
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <header class="mb-8 px-8 text-center">
        <h1 class="text-text font-roboto-serif mb-4 text-center text-4xl font-bold">
          {m.bento_title()}
        </h1>
        <p class="text-text/80 font-space-grotesk max-w-2xl text-lg">
          {m.bento_seo_description()}
        </p>
      </header>

      <div class="text-text font-space-grotesk grid max-w-5xl auto-rows-auto grid-cols-1 gap-4 p-8 text-center text-pretty *:size-full *:rounded-xl *:p-6 *:transition-all *:hover:scale-105 sm:grid-cols-2 sm:grid-rows-2 md:grid-cols-3">
        <article
          class="bg-card gap:2.5 flex flex-col items-center justify-center gap-2.5 sm:col-span-2 sm:flex-row sm:gap-8 md:col-span-1 md:row-span-2 md:flex-col"
          itemscope
          itemtype="https://schema.org/Service"
        >
          <LucideFeather
            class="size-14 shrink-0 sm:size-21"
            aria-hidden="true"
          />
          <h2 class="text-xl font-bold sm:text-3xl" itemprop="name">
            {m.bento_1_title()}
          </h2>
          <p class="text-base leading-6" itemprop="description">
            {m.bento_1_description()}
          </p>
        </article>

        <article
          class="bg-primary flex flex-col items-center justify-center gap-2.5"
          itemscope
          itemtype="https://schema.org/Service"
        >
          <LucidePiggyBank class="size-14" aria-hidden="true" />
          <h2 class="text-lg font-bold" itemprop="name">
            {m.bento_2_title()}
          </h2>
          <p class="text-base leading-6" itemprop="description">
            {m.bento_2_description()}
          </p>
        </article>

        <article
          class="bg-accent text-background flex flex-col items-center justify-center gap-2.5"
          itemscope
          itemtype="https://schema.org/Service"
        >
          <LucideRocket class="size-14" aria-hidden="true" />
          <h2 class="text-lg font-bold" itemprop="name">
            {m.bento_3_title()}
          </h2>
          <p class="text-base leading-6" itemprop="description">
            {m.bento_3_description()}
          </p>
        </article>

        <article
          class="bg-secondary flex flex-col items-center gap-2.5 sm:col-span-2 sm:flex-row sm:gap-8"
          itemscope
          itemtype="https://schema.org/Service"
        >
          <LucideTrendingUp
            class="size-14 shrink-0 sm:size-21"
            aria-hidden="true"
          />
          <h2 class="text-xl font-bold sm:text-3xl" itemprop="name">
            {m.bento_4_title()}
          </h2>
          <p class="text-base leading-6" itemprop="description">
            {m.bento_4_description()}
          </p>
        </article>
      </div>
    </section>
  );
}

import {
  createContext,
  createEffect,
  createSignal,
  For,
  Show,
  useContext,
  type Component,
} from "solid-js";
import gsap from "gsap";
import { ToolGroup, type ToolDetails } from "./tool-component";
import { tools } from "./tools";
import { cn } from "@/utils/cn";
import { createDeviceSize } from "@/utils/createDeviceSize";
import { m } from "@/paraglide/messages";

export type ToolsContextType = {
  activeTool: () => ToolDetails | null;
  setActiveTool: (tool: ToolDetails) => void;
  clearActiveTool: () => void;
};

export const ToolsContext = createContext<ToolsContextType>({
  activeTool: () => null,
  setActiveTool: () => {},
  clearActiveTool: () => {},
});

export const useToolsContext = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error("useToolsContext must be used within a ToolsProvider");
  }
  return context;
};

const ToolsSection: Component = () => {
  const [activeTool, setActiveTool] = createSignal<ToolDetails | null>(null);
  const [contentHeight, setContentHeight] = createSignal<string | number>(
    "auto",
  );

  const device = createDeviceSize();

  let contentRef: HTMLDivElement | undefined;
  let cardRef: HTMLDivElement | undefined;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: tools.flatMap((group) =>
      group.tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name: tool.title,
          description: tool.description,
          applicationCategory: "Developer Tool",
          proficiencyLevel: `${tool.experience}%`,
        },
      })),
    ),
  };

  createEffect(() => {
    const tool = activeTool();

    if (tool && device.compare("<", "md") && cardRef) {
      setTimeout(() => {
        cardRef?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }

    if (contentRef) {
      gsap.killTweensOf(contentRef);
      gsap.fromTo(
        contentRef,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
      );

      // Fixed Height Logic
      requestAnimationFrame(() => {
        if (contentRef) {
          // We need to capture the height of the inner content, plus padding
          setContentHeight(contentRef.scrollHeight + 64);
        }
      });
    }
  });

  return (
    <ToolsContext.Provider
      value={{
        activeTool,
        setActiveTool,
        clearActiveTool: () => setActiveTool(null),
      }}
    >
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>

      <section aria-label="Tech Stack" class="w-full">
        <div class="font-roboto-serif text-text my-4 flex flex-col gap-2.5 text-center">
          <h1 class="text-5xl font-bold">{m.tools_title()}</h1>
          <p class="text-xl">{m.tools_subtitle()}</p>
          <p class="text-xl text-gray-500">{m.tools_instruction()}</p>
        </div>

        <div class="mx-auto flex max-w-7xl flex-col-reverse items-center justify-center gap-8 p-8 lg:grid lg:grid-cols-[1fr_2fr] lg:items-start">
          <div
            ref={cardRef}
            style={{
              height: `${contentHeight()}px`,
            }}
            class="bg-card sticky top-8 flex w-full max-w-lg flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl p-8 backdrop-blur-sm transition-[height] duration-300 ease-out"
          >
            <Show
              when={activeTool()}
              fallback={
                <div ref={contentRef} class="flex flex-col gap-2 text-center">
                  <span class="font-roboto-serif bg-secondary-light text-text rounded-2xl px-4 py-2 text-5xl font-bold">
                    {m.tools_hello()}
                  </span>
                  <span class="font-roboto-serif text-text text-3xl font-bold">
                    {m.tools_instruction_fallback()}
                  </span>
                </div>
              }
            >
              <article ref={contentRef} class="flex w-full flex-col gap-6">
                <header class="flex items-center gap-4">
                  <img
                    src={activeTool()!.logo}
                    class={cn(
                      "rounded-xl object-contain",
                      activeTool()!.variant == "primary"
                        ? "bg-accent"
                        : "bg-secondary-light",
                      activeTool()!.variant == "language"
                        ? "aspect-4/3 h-16 rounded-full"
                        : "h-16 w-16 p-2",
                    )}
                    alt={`${activeTool()!.title} logo`}
                  />
                  <h3 class="font-space-grotesk text-text text-2xl font-bold">
                    {activeTool()!.title}
                  </h3>
                </header>

                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="font-space-grotesk text-text">
                      {m.tools_experience_level()}
                    </span>
                    <span class="font-space-grotesk text-text font-medium">
                      {activeTool()!.experience}%
                    </span>
                  </div>
                  <div class="h-3 w-full overflow-hidden rounded-full bg-gray-700">
                    <div
                      class="from-accent to-secondary h-full rounded-full bg-linear-to-r transition-all duration-500"
                      style={`width: ${activeTool()!.experience}%`}
                    />
                  </div>
                </div>

                <p class="font-space-grotesk text-text text-lg leading-relaxed">
                  {activeTool()!.description}
                </p>
              </article>
            </Show>
          </div>

          <div
            class="flex flex-wrap items-center justify-center gap-8"
            role="list"
            aria-label="List of tools"
          >
            <For each={tools}>
              {(group) => <ToolGroup {...group}></ToolGroup>}
            </For>
          </div>
        </div>
      </section>
    </ToolsContext.Provider>
  );
};
export default ToolsSection;

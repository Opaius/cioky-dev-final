import { cn } from "@/utils/cn";
import { createMemo, For, type Component } from "solid-js";
import { useToolsContext } from "./tools-section";

export type ToolDetails = {
  title: string;
  logo: string;
  experience: number;
  description: string;
  variant: "primary" | "secondary" | "language";
};
export type ToolComponentProps = ToolDetails & {
  logo: string;
};

export const ToolComponent: Component<ToolComponentProps> = (props) => {
  const toolContext = useToolsContext();

  const variantsClassName = createMemo(() => {
    if (props.variant == "primary") {
      return "bg-accent text-card flex-col gap";
    }
    if (props.variant == "secondary") {
      return "bg-secondary-light text-text flex-col gap";
    }
    if (props.variant == "language") {
      return "bg-text text-secondary-light flex-row gap-2";
    }
  });
  return (
    <div
      onMouseEnter={() => {
        if (toolContext.activeTool()?.title != props.title) {
          toolContext.setActiveTool({
            title: props.title,
            logo: props.logo,
            description: props.description,
            experience: props.experience,
            variant: props.variant,
          });
        }
      }}
      class={cn(
        "font-space-grotesk animate-all flex h-max w-max cursor-pointer items-center justify-center rounded-xl p-2 text-base transition-all",
        variantsClassName(),
        toolContext.activeTool()?.title == props.title &&
          "scale-110 shadow-[0px_0px_0px_5px_var(--color-primary)]",
      )}
    >
      <img
        src={props.logo}
        class={cn(
          props.variant == "language" ? "aspect-4/3 rounded-full" : "size-6",
        )}
      />
      {props.title}
    </div>
  );
};

export type ToolGroupProps = {
  title: string;
  tools: Array<ToolComponentProps>;
  class?: string;
};

export const ToolGroup: Component<ToolGroupProps> = (props) => {
  return (
    <div class={cn("bg-card flex flex-col gap-4 rounded-xl p-4", props.class)}>
      <h3 class="font-roboto-serif before:bg-accent text-text flex text-xl font-bold before:mr-2 before:inline-block before:h-full before:w-2 before:rounded-full">
        {props.title}
      </h3>
      <div class="flex flex-wrap items-center justify-center gap-2.5">
        <For each={props.tools}>{(tool) => <ToolComponent {...tool} />}</For>
      </div>
    </div>
  );
};

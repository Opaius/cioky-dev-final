import { Show, mergeProps } from "solid-js";
import { cn } from "@/utils/cn";
import { getComputedColor } from "@/utils/getComputedColor";
import type { ParentComponent } from "solid-js";

interface GradientTextProps {
  class?: string;
  colors?: Array<string>;
  animationSpeed?: number;
  showBorder?: boolean;
}

const GradientText: ParentComponent<GradientTextProps> = (props) => {
  // Use mergeProps to handle default values while maintaining reactivity
  const merged = mergeProps(
    {
      colors: ["#ffaa40", "#9c40ff", "#ffaa40"],
      animationSpeed: 8,
      showBorder: false,
      class: "",
    },
    props,
  );

  // Computed style for the gradient
  const gradientStyle = () => {
    const resolvedColors = merged.colors.map(getComputedColor);
    return {
      "background-image": `linear-gradient(to right, ${resolvedColors.join(", ")})`,
      "animation-duration": `${merged.animationSpeed}s`,
    };
  };

  return (
    <>
      <style>
        {`
          .gradient-text-anim {
            position: relative;
            display: inline-block;
            color: transparent;
          }

          .gradient-text-anim::before {
            content: "";
            position: absolute;
            inset: 0;
            background: var(--your-gradient);
            background-size: 200% 100%;
            animation: gradient-slide 3s linear infinite;
            -webkit-mask: linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0);
            z-index: -1; /* or 1 depending on your text setup */
          }

          @keyframes gradient-slide {
            0%   { transform: translateX(0); }
            50%  { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
      <div
        class={cn(
          "relative justify-center font-medium backdrop-blur transition-shadow duration-500",
          merged.class,
        )}
      >
        <Show when={merged.showBorder}>
          <div
            class="gradient-text-anim pointer-events-none absolute inset-0 z-0 bg-cover"
            style={{
              ...gradientStyle(),
              "background-size": "300% 100%",
            }}
          >
            <div
              class="absolute inset-0 z-[-1] bg-black"
              style={{
                width: "calc(100% - 2px)",
                height: "calc(100% - 2px)",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </Show>
        <div
          class="gradient-text-anim relative z-2 inline-block bg-cover text-transparent"
          style={{
            ...gradientStyle(),
            "background-clip": "text",
            "-webkit-background-clip": "text",
            "background-size": "300% 100%",
          }}
        >
          {merged.children}
        </div>
      </div>
    </>
  );
};

export default GradientText;

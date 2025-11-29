import {
  children,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import type { JSX, ParentComponent } from "solid-js";

export interface SplitTextProps {
  class?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  textAlign?: JSX.CSSProperties["text-align"];
  onLetterAnimationComplete?: () => void;
  start?: boolean;
}

interface CustomHTMLElement extends HTMLElement {
  _rbsplitInstance?: GSAPSplitText;
}

const SplitText: ParentComponent<SplitTextProps> = (props) => {
  const merged = mergeProps(
    {
      delay: 100,
      duration: 0.6,
      ease: "power3.out",
      splitType: "chars" as const,
      from: { opacity: 0, y: 40 },
      to: { opacity: 1, y: 0 },
      threshold: 0.1,
      rootMargin: "-100px",
      tag: "div" as const, // Default to div to better handle mixed block/inline children
      textAlign: "center" as const,
      class: "",
      start: true,
    },
    props,
  );

  let ref: CustomHTMLElement | undefined;
  const [fontsLoaded, setFontsLoaded] = createSignal(false);

  // Resolve children to track updates
  const resolvedChildren = children(() => merged.children);

  // Stabilize config objects to prevent unnecessary re-runs

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger, GSAPSplitText);
    if (document.fonts.status === "loaded") {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  });

  createEffect(() => {
    const isLoaded = fontsLoaded();
    const start = merged.start ?? true; // default to true if not provided
    resolvedChildren();

    if (!ref || !isLoaded || !start) return; // only animate when start is true

    const el = ref;

    // Revert any previous SplitText instance
    if (el._rbsplitInstance) {
      try {
        el._rbsplitInstance.revert();
      } catch (_) {}
      el._rbsplitInstance = undefined;
    }

    const ctx = gsap.context(() => {
      const splitInstance = new GSAPSplitText(el, {
        type: merged.splitType,
        smartWrap: true,
        autoSplit: merged.splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (self) => {
          gsap.set(el, { visibility: "visible" });

          const targets =
            merged.splitType?.includes("lines") && self.lines.length > 0
              ? self.lines
              : el.children;

          gsap.fromTo(
            targets,
            { ...merged.from },
            {
              ...merged.to,
              duration: merged.duration,
              ease: merged.ease,
              stagger: (merged.delay ?? 100) / 1000,
              onComplete: merged.onLetterAnimationComplete,
              willChange: "transform, opacity",
              force3D: true,
            },
          );
        },
      });

      el._rbsplitInstance = splitInstance;
    }, ref);

    onCleanup(() => {
      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      }
      ctx.revert();
    });
  });

  return (
    <Dynamic
      component={merged.tag}
      ref={ref}
      class={`split-parent inline-block whitespace-normal ${merged.class}`}
      style={{
        "text-align": merged.textAlign,
        "word-wrap": "break-word",
        contain: "paint layout",
        visibility: "hidden",
        "will-change": "transform, opacity",
      }}
    >
      {resolvedChildren()}
    </Dynamic>
  );
};

export default SplitText;

import { createMemo, createSignal } from "solid-js";
import { createGsapScroll } from "@/utils/createGSAPscroll";
import { cn } from "@/utils/cn";
import { CardNav } from "./ui/card-nav";

export function HeaderNav() {
  const scroll = createGsapScroll();
  const items = [
    {
      label: "About",
      bg: "var(--color-primary)",
      textColor: "#fff",
      links: [
        {
          label: "My Job Experience",
          ariaLabel: "About Job Experience",
          href: "/#job-experience",
        },
        {
          label: "My Skills",
          ariaLabel: "My Skills",
          href: "/#skills",
        },
        {
          label: "My Tools",
          ariaLabel: "My Tools",
          href: "/#tools",
        },
      ],
    },
    {
      label: "Projects",
      bg: "var(--color-secondary)",
      textColor: "#fff",
      links: [
        {
          label: "My Projects",
          ariaLabel: "My Projects",
          href: "/projects",
        },
      ],
    },
    {
      label: "Contact",
      bg: "var(--color-accent)",
      textColor: "var(--color-text)",
      links: [
        {
          label: "Email",
          ariaLabel: "Email me",
          href: "mailto:ciocan.sebastian45@gmail.com",
        },
        {
          label: "Instagram",
          ariaLabel: "Instagram",
          href: "https://instagram.com/ciokydev",
        },
        {
          label: "LinkedIn",
          ariaLabel: "LinkedIn",
          href: "https://www.linkedin.com/in/sebastian-ciocan-a5aa5138b",
        },
      ],
    },
  ];
  const [isOpen, setIsOpen] = createSignal(false);
  const additionalClassName = createMemo(() => {
    if (scroll.progress == 0 && !isOpen())
      return "bg-transparent w-[80%] max-w-full shadow-none";
    if (scroll.progress == 0 && isOpen()) return "bg-card w-[80%] max-w-full ";
    return undefined;
  });
  const basedOnDirection = createMemo(() => {
    if (scroll.direction === "down")
      return "-translate-y-full group-hover:translate-y-0 group-focus:translate-y-0 group-focus-within:translate-y-0";
    if (scroll.direction === "up") return "translate-y-0";
    return undefined;
  });
  return (
    <CardNav
      logo={<span class="logo">cioky.dev</span>}
      class={cn(
        "transition-[background-color,width,max-width,translate] duration-500",
        additionalClassName(),
        basedOnDirection(),
        "hover:bg-card text-text",
      )}
      items={items}
      isOpen={isOpen}
      onIsOpenChange={setIsOpen}
    />
  );
}

import { For, mergeProps, type Component } from "solid-js";
import { Button } from "./ui/button";
import { m } from "@/paraglide/messages";

export type ProjectsProps = {
  title: string;
  image: string;
  badges: Array<string>;
  description: string;
  link: string;
  buttonText?: string;
  primaryColor: string;
  secondaryColor: string;
};

const ProjectsComponent: Component<{
  projects: ProjectsProps[];
  showComingSooon: boolean;
}> = (props) => {
  const merged = mergeProps({ showComingSoon: false }, props);

  return (
    <div
      class="mx-4 grid flex-col items-center justify-center gap-4 *:max-w-lg md:grid-cols-2"
      role="list"
      aria-label="List of projects"
    >
      <For each={merged.projects}>
        {(project, index) => (
          <article
            class="grid h-full items-center justify-center gap-4 self-stretch overflow-hidden rounded-xl p-4"
            style={{
              "background-color": `color-mix(in srgb, ${project.primaryColor}, transparent 50%)`,
            }}
            role="listitem"
            aria-label={`Project ${index() + 1}: ${project.title}`}
            itemscope
            itemtype="https://schema.org/CreativeWork"
          >
            <img
              class="aspect-video w-full rounded-xl object-cover object-bottom"
              src={project.image}
              alt={`Screenshot of ${project.title} project`}
              loading="lazy"
              itemprop="image"
            />
            <div
              class="flex min-h-min w-full grow flex-col items-start justify-start gap-2.5 overflow-hidden rounded-xl p-4"
              style={{
                "background-color": project.secondaryColor,
              }}
              itemprop="description"
            >
              <h2
                class="font-space-grotesk justify-center text-center text-xl font-extrabold"
                style={{
                  color: project.primaryColor,
                }}
                itemprop="name"
              >
                {project.title}
              </h2>
              <div
                class="flex flex-wrap gap-2"
                role="list"
                aria-label="Project technologies"
              >
                <For each={project.badges}>
                  {(badge) => (
                    <div
                      class="rounded-4xl p-2 text-[0.7rem] text-nowrap text-white"
                      style={{
                        "background-color": project.primaryColor,
                      }}
                      role="listitem"
                      itemprop="keywords"
                    >
                      {badge}
                    </div>
                  )}
                </For>
              </div>
              <p
                style={{
                  color: project.primaryColor,
                }}
                class="font-space-grotesk justify-center self-stretch text-base font-normal"
                itemprop="abstract"
              >
                {project.description}
              </p>

              <Button
                as="a"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                class="font-space-grotesk rounded-xl text-xs font-bold text-white"
                style={{
                  "background-color": project.primaryColor,
                }}
                aria-label={`Visit ${project.title} live application`}
                itemprop="url"
              >
                {project.buttonText || m.projects_view_live()}
              </Button>
            </div>
          </article>
        )}
      </For>
      <aside
        class="bg-card text-text h-full w-full rounded-xl p-4"
        aria-label="Upcoming projects notice"
      >
        <div class="bg-primary flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl p-12 text-center">
          <h3 class="font-roboto-serif bg-secondary rounded-xl p-4 text-4xl font-bold">
            {m.projects_hi_there()}
          </h3>
          <p class="font-roboto-serif text-2xl">{m.projects_more_coming()}</p>
        </div>
      </aside>
    </div>
  );
};
export default ProjectsComponent;

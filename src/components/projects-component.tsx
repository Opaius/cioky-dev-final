import { For, mergeProps, type Component } from "solid-js";
import { Button } from "./ui/button";

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
    <div class="mx-4 grid flex-col items-center justify-center gap-4 *:max-h-[90vh] *:max-w-lg md:grid-cols-2">
      <For each={merged.projects}>
        {(project) => (
          <div
            class="grid auto-rows-fr items-center justify-center gap-4 self-stretch overflow-hidden rounded-xl p-4"
            style={{
              "background-color": `color-mix(in srgb, ${project.primaryColor}, transparent 50%)`,
            }}
          >
            <img
              class="h-full w-full rounded-xl object-cover object-bottom"
              src={project.image}
            />
            <div
              class="flex min-h-min w-full grow flex-col items-start justify-start gap-2.5 overflow-hidden rounded-xl p-4"
              style={{
                "background-color": project.secondaryColor,
              }}
            >
              <div
                class="font-space-grotesk justify-center text-center text-xl font-extrabold"
                style={{
                  color: project.primaryColor,
                }}
              >
                {project.title}
              </div>
              <div class="flex flex-wrap gap-2">
                <For each={project.badges}>
                  {(badge) => (
                    <div
                      class="rounded-4xl p-2 text-[0.7rem] text-nowrap text-white"
                      style={{
                        "background-color": project.primaryColor,
                      }}
                    >
                      {badge}
                    </div>
                  )}
                </For>
              </div>
              <div
                style={{
                  color: project.primaryColor,
                }}
                class="font-space-grotesk justify-center self-stretch text-base font-normal"
              >
                {project.description}
              </div>

              <Button
                as="a"
                href={project.link}
                target="_blank"
                class="font-space-grotesk rounded-xl text-xs font-bold text-white"
                style={{
                  "background-color": project.primaryColor,
                }}
              >
                {project.buttonText || "View Live Application"}
              </Button>
            </div>
          </div>
        )}
      </For>
      <div class="bg-card text-text h-full w-full rounded-xl p-4">
        <div class="bg-primary flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl p-12 text-center">
          <span class="font-roboto-serif bg-secondary rounded-xl p-4 text-4xl font-bold">
            Hi there!
          </span>
          <span class="font-roboto-serif text-2xl">
            More projects are arriving so stay tuned !
          </span>
        </div>
      </div>
    </div>
  );
};
export default ProjectsComponent;

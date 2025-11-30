import type { ProjectsProps } from "./projects-component";
import ProjectsComponent from "./projects-component";

export default function ProjectsSection() {
  const projects: Array<ProjectsProps> = [
    {
      title: "Pensiunea Perla Brazilor !",
      description:
        "Live application built with Next.js and the Bun runtime for maximum performance. Full ownership includes Figma design, SEO, and robust multilingual features via Next-Intl. Tangible proof of my end-to-end reliability.",
      badges: [
        "FULL-STACK OWNERSHIP",
        "DESIGN",
        "NEXT.JS",
        "MULTILANGUAGE",
        "SEO",
        "GOOGLE INDEXING",
      ],
      link: "https://perlabrazilor.com",
      image: "/first-project.png",
      primaryColor: "#1D5B17",
      secondaryColor: "#ADE091",
    },
  ];
  return (
    <div class="flex flex-col items-center justify-center">
      <h1 class="font-roboto-serif text-text mb-8 text-4xl font-bold">
        My Latest Projects
      </h1>
      <ProjectsComponent projects={projects} showComingSooon={true} />
    </div>
  );
}

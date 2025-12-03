import type { ProjectsProps } from "./projects-component";
import ProjectsComponent from "./projects-component";
import { m } from "@/paraglide/messages";

export default function ProjectsSection() {
  const projects: Array<ProjectsProps> = [
    {
      title: m.projects_pensiunea_title(),
      description: m.projects_pensiunea_description(),
      badges: [
        m.projects_badge_fullstack(),
        m.projects_badge_design(),
        m.projects_badge_nextjs(),
        m.projects_badge_multilanguage(),
        m.projects_badge_seo(),
        m.projects_badge_google_indexing(),
      ],
      link: "https://perlabrazilor.com",
      image: "/first-project.webp",
      primaryColor: "#1D5B17",
      secondaryColor: "#ADE091",
    },
  ];
  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        url: project.link,
        keywords: project.badges.join(", "),
        creator: {
          "@type": "Person",
          name: "Cioky",
          jobTitle: "Independent Software Developer",
        },
      },
    })),
  };

  return (
    <section
      aria-label="Projects Portfolio"
      class="flex flex-col items-center justify-center"
    >
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <div class="my-8 px-8 text-center">
        <h1 class="font-roboto-serif text-text mb-4 text-4xl font-bold">
          {m.projects_title()}
        </h1>
        <p class="text-text/80 font-space-grotesk max-w-2xl text-lg">
          {m.projects_seo_description()}
        </p>
      </div>

      <ProjectsComponent projects={projects} showComingSooon={true} />
    </section>
  );
}

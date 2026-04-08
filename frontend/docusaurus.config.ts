import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Physical AI & Humanoid Robotics",
  tagline: "A comprehensive textbook on building intelligent robots",
  favicon: "favicon.ico",

  url: process.env.SITE_URL || "https://your-username.github.io",
  baseUrl: process.env.BASE_URL || "/",

  organizationName: "your-org",
  projectName: "physical-ai-textbook",

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "Physical AI & Humanoid Robotics",
      items: [
        {
          type: "docSidebar",
          sidebarId: "textbookSidebar",
          position: "left",
          label: "Textbook",
        },
        {
          to: "/course-overview",
          label: "Course Overview",
          position: "left",
        },
        {
          to: "/hardware-requirements",
          label: "Hardware",
          position: "left",
        },
        {
          type: "custom-authButtons",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Textbook",
          items: [
            { label: "Introduction", to: "/intro" },
            { label: "Course Overview", to: "/course-overview" },
            { label: "Hardware Requirements", to: "/hardware-requirements" },
          ],
        },
        {
          title: "Modules",
          items: [
            { label: "Module 1: Robotic Nervous System", to: "/module-1/chapter-1" },
            { label: "Module 2: Digital Twin", to: "/module-2/chapter-1" },
            { label: "Module 3: AI-Robot Brain", to: "/module-3/chapter-1" },
            { label: "Module 4: VLA", to: "/module-4/chapter-1" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Textbook.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["python", "bash", "yaml", "cmake"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

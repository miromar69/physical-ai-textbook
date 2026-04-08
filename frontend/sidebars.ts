import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  textbookSidebar: [
    "intro",
    "course-overview",
    "hardware-requirements",
    {
      type: "category",
      label: "Module 1: The Robotic Nervous System (ROS 2)",
      items: [
        "module-1/chapter-1",
        "module-1/chapter-2",
      ],
    },
    {
      type: "category",
      label: "Module 2: The Digital Twin (Gazebo & Unity)",
      items: [
        "module-2/chapter-1",
        "module-2/chapter-2",
        "module-2/chapter-3",
      ],
    },
    {
      type: "category",
      label: "Module 3: The AI-Robot Brain (NVIDIA Isaac)",
      items: [
        "module-3/chapter-1",
        "module-3/chapter-2",
      ],
    },
    {
      type: "category",
      label: "Module 4: Vision-Language-Action (VLA)",
      items: [
        "module-4/chapter-1",
        "module-4/chapter-2",
      ],
    },
  ],
};

export default sidebars;

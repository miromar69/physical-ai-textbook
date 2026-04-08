import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";

const modules = [
  {
    title: "Module 1: The Robotic Nervous System",
    description: "Master ROS 2 — the communication backbone of modern robots. Build nodes, topics, services, and actions.",
    link: "/module-1/chapter-1",
    weeks: "Weeks 1–3",
  },
  {
    title: "Module 2: The Digital Twin",
    description: "Simulate robots in Gazebo and Unity. Build digital twins and transfer skills from simulation to reality.",
    link: "/module-2/chapter-1",
    weeks: "Weeks 4–6",
  },
  {
    title: "Module 3: The AI-Robot Brain",
    description: "Train robot intelligence with NVIDIA Isaac. Master reinforcement learning for manipulation and locomotion.",
    link: "/module-3/chapter-1",
    weeks: "Weeks 7–9",
  },
  {
    title: "Module 4: Vision-Language-Action",
    description: "Explore VLA models that unify vision, language understanding, and robot actions into a single architecture.",
    link: "/module-4/chapter-1",
    weeks: "Weeks 10–12",
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/intro">
            Get Started →
          </Link>
        </div>
      </div>
    </header>
  );
}

function ModuleCard({ title, description, link, weeks }: (typeof modules)[0]) {
  return (
    <div className={clsx("col col--6", styles.moduleCard)}>
      <div className="card margin-bottom--lg">
        <div className="card__header">
          <h3>{title}</h3>
          <span className="badge badge--secondary">{weeks}</span>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
        <div className="card__footer">
          <Link className="button button--primary button--sm" to={link}>
            Start Module →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <section className={styles.modules}>
          <div className="container">
            <h2 className="text--center margin-top--lg margin-bottom--lg">
              Course Modules
            </h2>
            <div className="row">
              {modules.map((mod) => (
                <ModuleCard key={mod.title} {...mod} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

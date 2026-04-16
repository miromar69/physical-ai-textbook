import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";

const modules = [
  {
    number: "01",
    title: "The Robotic Nervous System",
    description:
      "Master ROS 2 — the communication backbone of modern robots. Build nodes, topics, services, and actions.",
    link: "/module-1/chapter-1",
    weeks: "Weeks 1-3",
    accent: "#00d4aa",
  },
  {
    number: "02",
    title: "The Digital Twin",
    description:
      "Simulate robots in Gazebo and Unity. Build digital twins and transfer skills from simulation to reality.",
    link: "/module-2/chapter-1",
    weeks: "Weeks 4-6",
    accent: "#3b82f6",
  },
  {
    number: "03",
    title: "The AI-Robot Brain",
    description:
      "Train robot intelligence with NVIDIA Isaac. Master reinforcement learning for manipulation and locomotion.",
    link: "/module-3/chapter-1",
    weeks: "Weeks 7-9",
    accent: "#f59e0b",
  },
  {
    number: "04",
    title: "Vision-Language-Action",
    description:
      "Explore VLA models that unify vision, language understanding, and robot actions into a single architecture.",
    link: "/module-4/chapter-1",
    weeks: "Weeks 10-12",
    accent: "#f43f5e",
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <div className={styles.heroLabel}>
          <span className={styles.heroDot} />
          12-Week Course
        </div>
        <h1 className={styles.heroTitle}>
          Physical AI &{" "}
          <span className={styles.heroTitleAccent}>Humanoid Robotics</span>
        </h1>
        <p className={styles.heroSubtitle}>
          {siteConfig.tagline}. From ROS 2 fundamentals to vision-language-action
          models — build intelligent robots that perceive, reason, and act.
        </p>
        <div className={styles.heroActions}>
          <Link className={`button button--lg ${styles.heroPrimary}`} to="/intro">
            Start Learning
          </Link>
          <Link
            className={`button button--lg ${styles.heroSecondary}`}
            to="/course-overview"
          >
            Course Overview
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>4</span>
            <span className={styles.heroStatLabel}>Modules</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>9</span>
            <span className={styles.heroStatLabel}>Chapters</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>12</span>
            <span className={styles.heroStatLabel}>Weeks</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>AI</span>
            <span className={styles.heroStatLabel}>Powered</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function ModuleCard({
  number,
  title,
  description,
  link,
  weeks,
  accent,
}: (typeof modules)[0]) {
  return (
    <div
      className={styles.moduleCard}
      style={{ "--card-accent": accent } as React.CSSProperties}
    >
      <div className={styles.cardTopRow}>
        <span className={styles.moduleNumber}>MODULE {number}</span>
        <span className={styles.weeksBadge}>{weeks}</span>
      </div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>
      <Link className={styles.cardLink} to={link}>
        Start Module <span className={styles.cardArrow}>&rarr;</span>
      </Link>
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
            <span className={styles.sectionLabel}>
              // Curriculum
            </span>
            <h2 className={styles.sectionTitle}>Course Modules</h2>
            <p className={styles.sectionSubtitle}>
              Four progressive modules taking you from communication fundamentals
              to cutting-edge embodied AI.
            </p>
            <div className={styles.moduleGrid}>
              {modules.map((mod) => (
                <ModuleCard key={mod.number} {...mod} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

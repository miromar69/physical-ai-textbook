import React, { useState } from "react";
import { marked } from "marked";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import styles from "./styles.module.css";

interface PersonalizeButtonProps {
  chapterSlug: string;
}

export default function PersonalizeButton({
  chapterSlug,
}: PersonalizeButtonProps): React.ReactElement {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [personalized, setPersonalized] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);

  const getDocContent = (): HTMLElement | null => {
    return document.querySelector("article .markdown");
  };

  const handlePersonalize = async () => {
    const contentEl = getDocContent();
    if (!contentEl) return;

    if (personalized && originalContent) {
      contentEl.innerHTML = originalContent;
      setPersonalized(false);
      return;
    }

    setLoading(true);
    try {
      setOriginalContent(contentEl.innerHTML);

      const response = await api.post<{
        personalized_content: string;
        cached: boolean;
      }>("/personalize", {
        chapter_slug: chapterSlug,
        content: contentEl.innerText,
      });

      const html = await marked.parse(response.personalized_content);
      contentEl.innerHTML = html;
      setPersonalized(true);
    } catch {
      if (originalContent) {
        contentEl.innerHTML = originalContent;
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <a href="/signin" className={styles.signInLink}>
          Sign in to personalize
        </a>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.button} ${personalized ? styles.active : ""}`}
        onClick={handlePersonalize}
        disabled={loading}
        type="button"
      >
        {loading
          ? "Personalizing..."
          : personalized
            ? "Show Original"
            : "\u2728 Personalize"}
      </button>
    </div>
  );
}

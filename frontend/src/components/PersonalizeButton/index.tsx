import React, { useState } from "react";
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
      // Restore original
      contentEl.innerHTML = originalContent;
      setPersonalized(false);
      return;
    }

    setLoading(true);
    try {
      // Save original content
      setOriginalContent(contentEl.innerHTML);

      const response = await api.post<{
        personalized_content: string;
        cached: boolean;
      }>("/personalize", {
        chapter_slug: chapterSlug,
        content: contentEl.innerText,
      });

      // Replace content with personalized version
      // Convert markdown-like response to simple HTML paragraphs
      const html = response.personalized_content
        .split("\n\n")
        .map((block) => {
          if (block.startsWith("```")) return `<pre><code>${block.replace(/```\w*\n?/g, "")}</code></pre>`;
          if (block.startsWith("# ")) return `<h1>${block.slice(2)}</h1>`;
          if (block.startsWith("## ")) return `<h2>${block.slice(3)}</h2>`;
          if (block.startsWith("### ")) return `<h3>${block.slice(4)}</h3>`;
          return `<p>${block}</p>`;
        })
        .join("\n");

      contentEl.innerHTML = html;
      setPersonalized(true);
    } catch {
      // Restore on error
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
        <a href="/signin" className={`button button--secondary button--sm ${styles.button}`}>
          Sign in to personalize
        </a>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={`button button--sm ${personalized ? "button--warning" : "button--primary"} ${styles.button}`}
        onClick={handlePersonalize}
        disabled={loading}
        type="button"
      >
        {loading
          ? "Personalizing..."
          : personalized
            ? "Show Original"
            : "Personalize"}
      </button>
    </div>
  );
}

import React, { useState } from "react";
import { marked } from "marked";
import { api } from "../../services/api";
import styles from "./styles.module.css";

interface TranslateButtonProps {
  chapterSlug: string;
}

export default function TranslateButton({
  chapterSlug,
}: TranslateButtonProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);

  const getDocContent = (): HTMLElement | null => {
    return document.querySelector("article .markdown");
  };

  const handleTranslate = async () => {
    const contentEl = getDocContent();
    if (!contentEl) return;

    if (translated && originalContent) {
      contentEl.innerHTML = originalContent;
      contentEl.classList.remove("urdu-content");
      contentEl.removeAttribute("dir");
      setTranslated(false);
      return;
    }

    setLoading(true);
    try {
      setOriginalContent(contentEl.innerHTML);

      const response = await api.post<{
        translated_content: string;
        cached: boolean;
      }>("/translate", {
        chapter_slug: chapterSlug,
        content: contentEl.innerText,
      });

      const html = await marked.parse(response.translated_content);
      contentEl.innerHTML = html;
      contentEl.classList.add("urdu-content");
      contentEl.setAttribute("dir", "rtl");
      setTranslated(true);
    } catch {
      if (originalContent) {
        contentEl.innerHTML = originalContent;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.button} ${translated ? styles.active : ""}`}
        onClick={handleTranslate}
        disabled={loading}
        type="button"
      >
        {loading ? "Translating..." : translated ? "Show Original" : "\uD83C\uDF10 Translate to Urdu"}
      </button>
    </div>
  );
}

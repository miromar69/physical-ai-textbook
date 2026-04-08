import React, { useState } from "react";
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
      // Restore original
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

      // Convert translated markdown to simple HTML
      const html = response.translated_content
        .split("\n\n")
        .map((block) => {
          if (block.startsWith("```")) {
            return `<pre class="code-block-ltr"><code>${block.replace(/```\w*\n?/g, "")}</code></pre>`;
          }
          if (block.startsWith("# ")) return `<h1>${block.slice(2)}</h1>`;
          if (block.startsWith("## ")) return `<h2>${block.slice(3)}</h2>`;
          if (block.startsWith("### ")) return `<h3>${block.slice(4)}</h3>`;
          return `<p>${block}</p>`;
        })
        .join("\n");

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
        className={`button button--sm ${translated ? "button--warning" : "button--secondary"} ${styles.button}`}
        onClick={handleTranslate}
        disabled={loading}
        type="button"
      >
        {loading
          ? "Translating..."
          : translated
            ? "Show Original"
            : "Translate to Urdu"}
      </button>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import styles from "./styles.module.css";

interface TextSelectorProps {
  containerRef: React.RefObject<HTMLElement | null>;
  onSelectText: (text: string) => void;
}

export default function TextSelector({
  containerRef,
  onSelectText,
}: TextSelectorProps): React.ReactElement {
  const [buttonPos, setButtonPos] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setButtonPos(null);
      setSelectedText("");
      return;
    }

    // Only show button if selection is within the doc content
    const container = containerRef.current;
    if (!container) return;

    const anchorNode = selection.anchorNode;
    if (!anchorNode || !container.contains(anchorNode)) {
      setButtonPos(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 10) {
      setButtonPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setButtonPos({
      top: rect.top + window.scrollY - 40,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setSelectedText(text);
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener("mouseup", handleSelectionChange);
    return () => document.removeEventListener("mouseup", handleSelectionChange);
  }, [handleSelectionChange]);

  const handleClick = () => {
    onSelectText(selectedText);
    setButtonPos(null);
    window.getSelection()?.removeAllRanges();
  };

  if (!buttonPos) return <></>;

  return (
    <button
      className={styles.askButton}
      style={{ top: buttonPos.top, left: buttonPos.left }}
      onClick={handleClick}
      type="button"
      aria-label="Ask the AI assistant about selected text"
    >
      Ask about this
    </button>
  );
}

import React, { useRef, useState } from "react";
import Layout from "@theme-original/DocItem/Layout";
import type { WrapperProps } from "@docusaurus/types";
import ChatPanel from "../../components/ChatPanel";
import PersonalizeButton from "../../components/PersonalizeButton";
import TextSelector from "../../components/TextSelector";
import TranslateButton from "../../components/TranslateButton";

type Props = WrapperProps<typeof Layout>;

export default function LayoutWrapper(props: Props): React.ReactElement {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState("");

  // Extract chapter slug from the current URL path
  const chapterSlug = typeof window !== "undefined"
    ? window.location.pathname.replace(/^\//, "").replace(/\/$/, "")
    : undefined;

  return (
    <div ref={contentRef}>
      {chapterSlug && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <TranslateButton chapterSlug={chapterSlug} />
          <PersonalizeButton chapterSlug={chapterSlug} />
        </div>
      )}
      <Layout {...props} />
      <TextSelector
        containerRef={contentRef}
        onSelectText={(text) => setSelectedText(text)}
      />
      <ChatPanel
        chapterSlug={chapterSlug}
        selectedText={selectedText}
        onClearSelection={() => setSelectedText("")}
      />
    </div>
  );
}

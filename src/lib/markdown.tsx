import type { ReactNode } from "react";

/**
 * A small, deliberate subset of Markdown.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * IT RETURNS REACT ELEMENTS, NEVER AN HTML STRING.
 *
 * The usual shape of this — parse to HTML, then dangerouslySetInnerHTML — puts
 * one regular expression between staff-authored text and script execution on
 * genmars.co.ke. React escapes every string it renders, so the class of bug
 * does not exist here rather than being defended against.
 *
 * The consequence, which is a feature: raw HTML in a document is shown as
 * text. Somebody pasting `<script>` sees `<script>` on the page. Somebody
 * pasting a `<div>` for layout sees the div, notices, and stops.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── WHY NOT A MARKDOWN LIBRARY ──────────────────────────────────────────────
 *
 * Charter 03 §I: a dependency enters when what is here cannot do the job. The
 * job is headings, paragraphs, lists, links, code and emphasis for product
 * documentation written by four people. A full CommonMark implementation
 * brings tables, footnotes, HTML passthrough and an ongoing sanitiser
 * decision, none of which is wanted.
 *
 * If documentation ever genuinely needs tables, add tables here. The moment it
 * needs something that is really a CMS, this file has stopped being the right
 * answer and should be replaced rather than grown.
 *
 * ── WHAT IS SUPPORTED ───────────────────────────────────────────────────────
 *
 *   ## Heading            h2, and ### for h3
 *   plain text            paragraph
 *   - item                unordered list
 *   1. item               ordered list
 *   ```                   fenced code block (no language highlighting)
 *   `code`                inline code
 *   [text](https://…)     link — https and mailto only
 *   **bold**              strong
 */

type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "code"; lines: string[] };

export function renderMarkdown(source: string): ReactNode {
  return toBlocks(source).map((block, index) => renderBlock(block, index));
}

/** The first paragraph, as plain text. Used for a meta description fallback. */
export function firstParagraph(source: string): string {
  const block = toBlocks(source).find((b) => b.kind === "paragraph");
  return block && block.kind === "paragraph" ? stripMarks(block.text) : "";
}

function toBlocks(source: string): Block[] {
  const lines = (source ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let paragraph: string[] = [];
  let listOpen = false;
  let code: string[] | null = null;

  const closeParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  /*
   * Lists accumulate into the last block rather than into a captured variable.
   *
   * The obvious version keeps `let list: OpenList | null` and closes it from a
   * helper — and TypeScript cannot narrow a `let` that a closure also writes,
   * so every use of it becomes an error. Appending to blocks[last] needs no
   * narrowing and has one less piece of state to get out of step.
   */
  const openList = (ordered: boolean, text: string) => {
    const last = blocks[blocks.length - 1];
    if (listOpen && last && last.kind === "list" && last.ordered === ordered) {
      last.items.push(text);
      return;
    }
    blocks.push({ kind: "list", ordered, items: [text] });
    listOpen = true;
  };

  for (const line of lines) {
    // A fence opens and closes verbatim mode. Nothing inside is interpreted —
    // that is the point of a code block, and it is also what stops a document
    // showing a Markdown example from being parsed as one.
    if (line.trimStart().startsWith("```")) {
      if (code) {
        blocks.push({ kind: "code", lines: code });
        code = null;
      } else {
        closeParagraph();
        listOpen = false;
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }

    if (line.trim() === "") {
      closeParagraph();
      listOpen = false;
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      closeParagraph();
      listOpen = false;
      blocks.push({
        kind: "heading",
        level: (heading[1] ?? "").length === 2 ? 2 : 3,
        text: (heading[2] ?? "").trim(),
      });
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      closeParagraph();
      const matched = bullet ?? numbered;
      openList(Boolean(numbered), (matched?.[1] ?? "").trim());
      continue;
    }

    listOpen = false;
    paragraph.push(line.trim());
  }

  // An unterminated fence is a typo, not a reason to lose the rest of the
  // document — emit what was collected rather than dropping it.
  if (code) blocks.push({ kind: "code", lines: code });
  closeParagraph();

  return blocks;
}

function renderBlock(block: Block, key: number): ReactNode {
  switch (block.kind) {
    case "heading":
      return block.level === 2 ? (
        <h2 key={key} id={slugify(block.text)}>
          {inline(block.text)}
        </h2>
      ) : (
        <h3 key={key} id={slugify(block.text)}>
          {inline(block.text)}
        </h3>
      );
    case "list":
      return block.ordered ? (
        <ol key={key}>
          {block.items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ol>
      ) : (
        <ul key={key}>
          {block.items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>
      );
    case "code":
      // Wrapped so a long line scrolls inside the block rather than widening
      // the page — the rule the whole site follows for wide content.
      return (
        <pre key={key}>
          <code>{block.lines.join("\n")}</code>
        </pre>
      );
    case "paragraph":
      return <p key={key}>{inline(block.text)}</p>;
  }
}

/**
 * Inline marks, applied in one pass so a link's text is not re-scanned.
 *
 * Order matters: code first, because `**not bold**` inside backticks must stay
 * literal, which is what a reader writing about Markdown expects.
 */
const INLINE =
  /(`[^`]+`)|(\[[^\]]+\]\((?:https:\/\/|mailto:)[^)\s]+\))|(\*\*[^*]+\*\*)/g;

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > last) nodes.push(text.slice(last, at));

    const [token] = match;
    if (token.startsWith("`")) {
      nodes.push(<code key={key++}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const split = token.indexOf("](");
      const label = token.slice(1, split);
      const href = token.slice(split + 2, -1);
      // Only https and mailto reach here — the pattern above admits nothing
      // else, so javascript: and data: cannot be written as a link at all.
      nodes.push(
        <a
          key={key++}
          href={href}
          {...(href.startsWith("https://") && !href.includes("genmars.co.ke")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    }
    last = at + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Heading anchors, so a section can be linked to. */
function slugify(text: string): string {
  return stripMarks(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripMarks(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
}

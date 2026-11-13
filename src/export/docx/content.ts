// Blöcke des Dokumentmodells → docx-Absätze. Sammelt dabei die Fußnoten ein.
import { FootnoteReferenceRun, Paragraph, StyleLevel, Tab, TableOfContents, TextRun, type FileChild, type ParagraphChild } from "docx";
import { isFootnote, type Block, type Inline, type TextSpan } from "../../document/model";
import { HEADING_LEVELS } from "../../domain/settings";
import { FOOTNOTE_STYLE, PARAGRAPH_STYLES, headingStyleId } from "./styles";

export type Footnotes = Record<string, { children: Paragraph[] }>;

const textRun = (span: TextSpan, leadingTab = false): TextRun =>
  new TextRun({
    children: [...(leadingTab || span.tabBefore ? [new Tab()] : []), span.text],
    italics: span.italic,
    ...(span.lineBreakBefore ? { break: 1 } : {}),
  });

export class ContentWriter {
  readonly footnotes: Footnotes = {};
  private nextFootnoteId = 1;

  blocks(blocks: readonly Block[]): FileChild[] {
    return blocks.map((block) => this.block(block));
  }

  private block(block: Block): FileChild {
    switch (block.kind) {
      case "heading":
        return new Paragraph({ style: headingStyleId(block.level), text: block.text });
      case "toc":
        return new TableOfContents("Inhaltsverzeichnis", {
          hyperlink: true,
          headingStyleRange: `1-${HEADING_LEVELS}`,
          stylesWithLevels: [new StyleLevel(PARAGRAPH_STYLES.verzeichnisueberschrift.name, 1)],
        });
      case "paragraph":
        return new Paragraph({
          ...(block.style === "standard" ? {} : { style: PARAGRAPH_STYLES[block.style].id }),
          children: block.content.map((inline) => this.inline(inline)),
        });
    }
  }

  private inline(inline: Inline): ParagraphChild {
    if (!isFootnote(inline)) return textRun(inline);
    const id = this.nextFootnoteId++;
    this.footnotes[id] = {
      // Tab nach dem Fußnotenzeichen: zusammen mit dem hängenden Einzug steht der Text bündig.
      children: [new Paragraph({ style: FOOTNOTE_STYLE, children: inline.footnote.map((span, i) => textRun(span, i === 0)) })],
    };
    return new FootnoteReferenceRun(id);
  }
}

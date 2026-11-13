// Lucide-Icons. Nur die hier importierten Icons landen im Bundle.
import { BookOpen, ChevronDown, ChevronUp, Download, ExternalLink, GripVertical, Info, Link, RotateCcw, Scale, createElement, type IconNode } from "lucide";

const ICONS = {
  "book-open": BookOpen,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  download: Download,
  "external-link": ExternalLink,
  "grip-vertical": GripVertical,
  info: Info,
  link: Link,
  "rotate-ccw": RotateCcw,
  scale: Scale,
} satisfies Record<string, IconNode>;

export type IconName = keyof typeof ICONS;

export const icon = (name: IconName): SVGElement => createElement(ICONS[name], { "aria-hidden": "true" });

/** Ersetzt alle Platzhalter <span data-icon="name"> unterhalb von root durch das Icon. */
export function mountIcons(root: ParentNode): void {
  for (const el of root.querySelectorAll<HTMLElement>("[data-icon]")) {
    const name = el.dataset.icon as IconName;
    if (name in ICONS) el.replaceChildren(icon(name));
  }
}

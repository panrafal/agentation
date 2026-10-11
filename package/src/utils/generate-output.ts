import {
  OutputDetailLevel,
  ReactComponentMode,
} from "../components/page-toolbar-css";
import { Annotation } from "../types";

export const OUTPUT_TO_REACT_MODE: Record<
  OutputDetailLevel,
  ReactComponentMode
> = {
  compact: "off",
  standard: "filtered",
  detailed: "smart",
  forensic: "all",
};

export const OUTPUT_DETAIL_OPTIONS: {
  value: OutputDetailLevel;
  label: string;
}[] = [
  { value: "compact", label: "Compact" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
  { value: "forensic", label: "Forensic" },
];

export function generateOutputHeader(pathname: string, appName?: string): string {
  let output = `## Page Feedback: ${pathname}\n`;
  const name = appName?.replace(/[\r\n\t]+/g, " ").trim();
  if (name) output += `**App:** ${name.replace(/[\\`*_\[\]<>]/g, "\\$&")}\n`;
  return output;
}

export type AnnotationOutputField = { label: string; value: string };

/**
 * Element details that `generateOutput` emits for one annotation at the given
 * detail level (excluding the heading and feedback). Shared with the
 * annotation popup so its expanded section previews what the agent receives.
 * Compact output inlines only the source file.
 */
export function getAnnotationOutputFields(
  a: Omit<Annotation, "id" | "comment" | "timestamp">,
  detailLevel: OutputDetailLevel = "standard",
): AnnotationOutputField[] {
  const fields: AnnotationOutputField[] = [];
  const add = (label: string, value: string | undefined | false) => {
    if (value) fields.push({ label, value });
  };
  const box = a.boundingBox;
  const size = box
    ? `(${Math.round(box.width)}×${Math.round(box.height)}px)`
    : "";
  const context =
    a.nearbyText && !a.selectedText && a.nearbyText.slice(0, 100);

  if (detailLevel === "compact") {
    add("Source", a.sourceFile);
  } else if (detailLevel === "forensic") {
    add("Full DOM Path", a.fullPath);
    add("CSS Classes", a.cssClasses);
    add(
      "Position",
      box && `x:${Math.round(box.x)}, y:${Math.round(box.y)} ${size}`,
    );
    add(
      "Annotation at",
      `${a.x.toFixed(1)}% from left, ${Math.round(a.y)}px from top`,
    );
    add("Selected text", a.selectedText && `"${a.selectedText}"`);
    add("Context", context);
    add("Computed Styles", a.computedStyles);
    add("Accessibility", a.accessibility);
    add("Nearby Elements", a.nearbyElements);
    add("Source", a.sourceFile);
    add("React", a.reactComponents);
  } else {
    const detailed = detailLevel === "detailed";
    fields.push({ label: "Location", value: a.elementPath });
    add("Source", a.sourceFile);
    add("React", a.reactComponents);
    if (detailed) {
      add("Classes", a.cssClasses);
      add(
        "Position",
        box && `${Math.round(box.x)}px, ${Math.round(box.y)}px ${size}`,
      );
    }
    add("Selected text", a.selectedText && `"${a.selectedText}"`);
    if (detailed) add("Context", context);
  }
  return fields;
}

export function generateOutput(
  annotations: Annotation[],
  pathname: string,
  detailLevel: OutputDetailLevel = "standard",
  options: { appName?: string } = {},
): string {
  if (annotations.length === 0) return "";

  const viewport =
    typeof window !== "undefined"
      ? `${window.innerWidth}×${window.innerHeight}`
      : "unknown";

  let output = generateOutputHeader(pathname, options.appName);

  if (detailLevel === "forensic") {
    output += `\n**Environment:**\n`;
    output += `- Viewport: ${viewport}\n`;
    if (typeof window !== "undefined") {
      output += `- URL: ${window.location.href}\n`;
      output += `- User Agent: ${navigator.userAgent}\n`;
      output += `- Timestamp: ${new Date().toISOString()}\n`;
      output += `- Device Pixel Ratio: ${window.devicePixelRatio}\n`;
    }
    output += `\n---\n`;
  } else if (detailLevel !== "compact") {
    output += `**Viewport:** ${viewport}\n`;
  }
  output += "\n";

  annotations.forEach((a, i) => {
    if (detailLevel === "compact") {
      output += `${i + 1}. **${a.element}**${a.sourceFile ? ` (${a.sourceFile})` : ""}: ${a.comment}`;
      if (a.selectedText) {
        output += ` (re: "${a.selectedText.slice(0, 30)}${a.selectedText.length > 30 ? "..." : ""}")`;
      }
      output += "\n";
    } else {
      output += `### ${i + 1}. ${a.element}\n`;
      if (detailLevel === "forensic" && a.isMultiSelect && a.fullPath) {
        output += `*Forensic data shown for first element of selection*\n`;
      }
      for (const field of getAnnotationOutputFields(a, detailLevel)) {
        output += `**${field.label}:** ${field.value}\n`;
      }
      output += `**Feedback:** ${a.comment}\n\n`;
    }
  });

  return output.trim();
}

import { describe, expect, it } from "vitest";
import { generateOutput, getAnnotationOutputFields } from "./generate-output";
import type { Annotation } from "../types";

const annotation: Annotation = {
  id: "1",
  x: 10,
  y: 20,
  comment: "Fix it",
  element: "<App> button",
  elementPath: "main > button[data-testid=\"save\"]",
  timestamp: 0,
  boundingBox: { x: 1, y: 2, width: 30, height: 40 },
  cssClasses: "btn primary",
  nearbyText: "Save changes",
  computedStyles: "color: red",
  fullPath: "html > body > main > button",
  accessibility: "role=button",
  nearbyElements: "input, label",
  reactComponents: "<App> <SaveButton>",
  sourceFile: "src/SaveButton.tsx:12",
};

const labels = (level: Parameters<typeof getAnnotationOutputFields>[1]) =>
  getAnnotationOutputFields(annotation, level).map((field) => field.label);

describe("getAnnotationOutputFields", () => {
  it("scales fields with the detail level", () => {
    expect(labels("compact")).toEqual(["Source"]);
    expect(labels("standard")).toEqual(["Location", "Source", "React"]);
    expect(labels("detailed")).toEqual([
      "Location", "Source", "React", "Classes", "Position", "Context",
    ]);
    expect(labels("forensic")).toEqual([
      "Full DOM Path", "CSS Classes", "Position", "Annotation at", "Context",
      "Computed Styles", "Accessibility", "Nearby Elements", "Source", "React",
    ]);
  });

  it("matches the lines generateOutput emits", () => {
    for (const level of ["standard", "detailed", "forensic"] as const) {
      const output = generateOutput([annotation], "/", level);
      for (const { label, value } of getAnnotationOutputFields(annotation, level)) {
        expect(output).toContain(`**${label}:** ${value}\n`);
      }
    }
  });
});

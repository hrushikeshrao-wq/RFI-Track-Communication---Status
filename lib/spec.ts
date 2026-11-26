import type { Supplier } from "@/lib/suppliers";

/** Category-specific attributes the agent writes into the shared filter state. */
export type SpecId = "location" | "form" | "alloy" | "profile" | "finish" | "industry";

export type SpecFacet = {
  id: SpecId;
  label: string;
  question: string;
  help?: string;
  options: string[];
};

export type SpecState = Record<SpecId, string | null>;

export const SPEC_FACETS: SpecFacet[] = [
  {
    id: "location",
    label: "LOCATION",
    question: "Where should suppliers be located?",
    options: ["91730 | 100 mi", "91730 | 50 mi", "91730 | 250 mi", "USA or Canada"],
  },
  {
    id: "form",
    label: "FORM",
    question: "What form of aluminum do you need?",
    options: ["Extrusion — standard shape", "Sheet", "Plate", "Bar"],
  },
  {
    id: "alloy",
    label: "ALLOY",
    question: "Which alloy do you need?",
    options: ["Alloy 5052", "Alloy 6061", "Alloy 7075", "Alloy 3003"],
  },
  {
    id: "profile",
    label: "PROFILE",
    question: "What profile or cross-section is required?",
    options: ["I-Beam", "Any Bar", "Round Bar", "Channel"],
  },
  {
    id: "finish",
    label: "FINISH",
    question: "Is a finish or surface treatment required?",
    help: "Anodized, coated, clad, pre-painted — or mill finish.",
    options: ["Pre-Painted", "Anodized", "Coated", "Clad", "Mill finish"],
  },
  {
    id: "industry",
    label: "INDUSTRY",
    question: "Which industry is this for?",
    options: ["Structural", "Aerospace", "Automotive", "Marine"],
  },
];

/** The refined search carried in the example gs_state. */
export const INITIAL_SPEC: SpecState = {
  location: "91730 | 100 mi",
  form: "Extrusion — standard shape",
  alloy: "Alloy 5052",
  profile: "I-Beam",
  finish: "Pre-Painted",
  industry: "Structural",
};

/** No facets chosen — the left rail restart begins here. */
export const EMPTY_SPEC: SpecState = {
  location: null,
  form: null,
  alloy: null,
  profile: null,
  finish: null,
  industry: null,
};

/** Unrefined Aluminum heading size. */
export const UNREFINED_COUNT = 1554;

/** Match count once every category attribute is set. */
const REFINED_COUNT = 40;

export function activeSpec(spec: SpecState): SpecFacet[] {
  return SPEC_FACETS.filter((facet) => spec[facet.id]);
}

/** Narrows from the full heading as facets are added, and widens when one is removed. */
export function matchCount(spec: SpecState): number {
  const filled = activeSpec(spec).length;
  if (filled === 0) return UNREFINED_COUNT;
  const ratio = Math.pow(REFINED_COUNT / UNREFINED_COUNT, filled / SPEC_FACETS.length);
  return Math.max(REFINED_COUNT, Math.round(UNREFINED_COUNT * ratio));
}

const HINTS: Record<SpecId, string[]> = {
  location: [],
  form: ["extrud"],
  alloy: [],
  profile: ["beam", "i-beam", "channel", "bar"],
  finish: ["paint", "coated", "anod", "pre-painted"],
  industry: ["structural", "construction"],
};

function scoreSupplier(supplier: Supplier, spec: SpecState): number {
  const text = `${supplier.name} ${supplier.description} ${supplier.capabilities.join(" ")}`.toLowerCase();
  let score = supplier.sponsored ? 1 : 0;
  for (const facet of SPEC_FACETS) {
    const value = spec[facet.id];
    if (!value) continue;
    const token = value.toLowerCase().replace(/^alloy\s+/, "");
    if (facet.id !== "location" && text.includes(token)) score += 8;
    else if (HINTS[facet.id].some((hint) => text.includes(hint))) score += 3;
    else if (facet.id === "location") score += 1;
  }
  return score;
}

/** Highest-scoring suppliers first. The top of this list is the matched set. */
export function rankBySpec(suppliers: Supplier[], spec: SpecState): Supplier[] {
  return [...suppliers].sort((a, b) => scoreSupplier(b, spec) - scoreSupplier(a, spec));
}

export function specBrief(spec: SpecState): { subject: string; details: string; zip: string } {
  const lines = activeSpec(spec).map((facet) => `${facet.label}: ${spec[facet.id]}`);
  const form = spec.form ?? "aluminum";
  const alloy = spec.alloy ?? "Aluminum";
  const profile = spec.profile ?? "";
  return {
    subject: [alloy, form, profile].filter(Boolean).join(" "),
    details: lines.join("\n"),
    zip: spec.location?.match(/\d{5}/)?.[0] ?? "",
  };
}

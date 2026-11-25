import suppliersData from "./suppliers.json"

export type Supplier = {
  id: string
  name: string
  sponsored: boolean
  /** Verified marker (badge) on the supplier result. */
  verified?: boolean
  /** Green Top Responder pill on the current Thomas results card. */
  topResponder?: boolean
  city: string
  state: string
  zip: string
  employees: string | null
  revenue: string | null
  founded: number | null
  companyTypes: string[]
  description: string
  capabilities: string[]
  certifications: string[]
  media: string[]
}

/**
 * Example supplier database for Aluminum (1261809), transcribed from the
 * current Thomas supplier results page.
 */
export const SUPPLIERS = suppliersData as Supplier[]

/**
 * Total suppliers in the Aluminum category — the "out of" number for
 * match counts. (The local database holds a transcribed sample.)
 */
export const CATEGORY_SUPPLIER_COUNT = 1554

/** Most suppliers the rail holds at once, recommendations included. */
export const RAIL_LIMIT = 25

/** How many suppliers the results-page selection bar can hold. */
export const SELECTION_LIMIT = 5

/** Shown wherever a supplier Thomas can't route a request to is offered. */
export const UNCONTACTABLE_NOTE =
  "This supplier cannot be contacted through Thomas, but can be added to your shortlist."

/**
 * Whether Thomas can route a request to this supplier. Stubbed off the id so
 * it's stable per supplier — roughly one in five — until the record carries
 * the flag. Recommendations skip these; a buyer can still shortlist them.
 */
export function isUncontactable(supplier: Supplier): boolean {
  let hash = 0
  for (const char of supplier.id) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return hash % 5 === 0
}

/** The suppliers a request can actually be sent to. */
export function contactableOnly(suppliers: Supplier[]): Supplier[] {
  return suppliers.filter((supplier) => !isUncontactable(supplier))
}
export const CATEGORY_LABEL = "Aluminum"

/** Search box text on the current Aluminum results page. */
export const SEARCH_QUERY = "Aluminium"

/**
 * A count over the local sample, restated against the whole category. Left for
 * reference: counts shown to the buyer now come from the answer-driven funnel
 * in `simulation.ts`, since a flat scale-up of a collapsed sample reads as a
 * category of zero long before the questions run out.
 */
export function scaleToCategory(count: number): number {
  return Math.round((count * CATEGORY_SUPPLIER_COUNT) / SUPPLIERS.length)
}

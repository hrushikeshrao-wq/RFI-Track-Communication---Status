import { scoreRecord, planScreening } from "@/lib/screening";
import {
  matchSetFor,
  railTarget,
  simulatedMatchCount,
  type LoggedAnswer,
} from "@/lib/simulation";
import type { Supplier } from "@/lib/suppliers";

/**
 * Suppliers for the current search, best matches first. Ranked from the
 * category keyword and the left-rail questionnaire — not from drawer-only
 * facets — so the shortlist's top five stay tied to the buyer's stated need.
 */
export function rankSuppliers(answers: LoggedAnswer[], query: string): Supplier[] {
  const logged = answers.filter((answer) => !answer.skipped && answer.values.length > 0);
  const matchTotal = simulatedMatchCount(answers);
  const set = matchSetFor(answers, railTarget(matchTotal));
  const plan = planScreening(
    `${query} ${logged.map((answer) => answer.values.join(" ")).join(" ")}`,
    [],
  );
  const rank = (group: Supplier[]) =>
    [...group].sort((a, b) => {
      const scoreDelta = scoreRecord(b, plan) - scoreRecord(a, plan);
      if (scoreDelta !== 0) return scoreDelta;
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      if (a.sponsored !== b.sponsored) return a.sponsored ? -1 : 1;
      return 0;
    });
  return [...rank(set.matches), ...rank(set.near)];
}

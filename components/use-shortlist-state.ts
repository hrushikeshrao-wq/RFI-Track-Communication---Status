"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { rankSuppliers } from "@/lib/ranked-suppliers";
import { SPEC_FACETS, rankBySpec, type SpecState } from "@/lib/spec";
import {
  SHORTLIST_STORAGE_KEY,
  readShortlist,
  writeShortlist,
  type ShortlistSnapshot,
} from "@/lib/shortlist-store";
import { questionById, type LoggedAnswer } from "@/lib/simulation";
import { RAIL_LIMIT, SUPPLIERS, contactableOnly, type Supplier } from "@/lib/suppliers";
import type { RequirementLine } from "@/components/sourcing-context";

/** Recommendations kept on the shortlist, re-ranked as answers land. */
const RECOMMENDED_COUNT = 5;

const RFI_SPEC_LABELS: Record<string, string> = {
  part: "Product",
  process: "Process",
  material: "Material",
  stock: "Stock",
  qty: "Quantity",
  size: "Size",
  tooling: "Tooling",
  tol: "Tolerance",
  loc: "Location",
  features: "Features",
  app: "Application",
  cert: "Certifications",
  diverse: "Diversity",
};

/**
 * Shortlist shared by the results page and every company profile: the buyer's
 * own adds, plus the top five contactable matches for the keyword and answers.
 */
export function useShortlistState(
  answers: LoggedAnswer[],
  query: string,
  runId: number,
  onRestore?: (snapshot: ShortlistSnapshot) => void,
  spec?: SpecState,
) {
  const pathname = usePathname();
  const router = useRouter();
  const [railAdded, setRailAdded] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [cleared, setCleared] = useState(false);
  const [pendingRevealId, setPendingRevealId] = useState<string | null>(null);
  const restoreRef = useRef(onRestore);
  const writeEnabled = useRef(false);
  const fromRemote = useRef(false);
  restoreRef.current = onRestore;

  const applySnapshot = useCallback((saved: ShortlistSnapshot | null) => {
    fromRemote.current = true;
    if (!saved) {
      setRailAdded([]);
      setDismissed([]);
      setCleared(false);
      return;
    }
    setRailAdded(saved.railAdded);
    setDismissed(saved.dismissed);
    setCleared(saved.cleared);
    restoreRef.current?.(saved);
  }, []);

  useLayoutEffect(() => {
    const saved = readShortlist();
    if (saved) applySnapshot(saved);
  }, [applySnapshot]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SHORTLIST_STORAGE_KEY) return;
      applySnapshot(event.newValue ? readShortlist() : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applySnapshot]);

  useEffect(() => {
    if (!writeEnabled.current) {
      writeEnabled.current = true;
      return;
    }
    if (fromRemote.current) {
      fromRemote.current = false;
      return;
    }
    writeShortlist({ railAdded, dismissed, cleared, answers, query });
  }, [railAdded, dismissed, cleared, answers, query]);

  const runReady = useRef(false);
  useEffect(() => {
    if (!runReady.current) {
      runReady.current = true;
      return;
    }
    setRailAdded([]);
    setDismissed([]);
    setCleared(false);
    setPendingRevealId(null);
  }, [runId]);

  const ranked = useMemo(
    () => (spec ? rankBySpec(SUPPLIERS, spec) : rankSuppliers(answers, query)),
    [answers, query, spec],
  );

  const recommended = useMemo(
    () =>
      cleared
        ? []
        : contactableOnly(ranked)
            .filter((supplier) => !dismissed.includes(supplier.id) && !railAdded.includes(supplier.id))
            .slice(0, RECOMMENDED_COUNT),
    [cleared, dismissed, railAdded, ranked],
  );
  const recommendedIds = useMemo(
    () => new Set(recommended.map((supplier) => supplier.id)),
    [recommended],
  );

  const added = useMemo(
    () =>
      railAdded
        .map((id) => ranked.find((supplier) => supplier.id === id) ?? SUPPLIERS.find((supplier) => supplier.id === id))
        .filter((supplier): supplier is Supplier => supplier != null),
    [railAdded, ranked],
  );
  const railSuppliers = useMemo(() => [...added, ...recommended], [added, recommended]);
  const railIds = useMemo(
    () => new Set(railSuppliers.map((supplier) => supplier.id)),
    [railSuppliers],
  );
  const railFull = railSuppliers.length >= RAIL_LIMIT;

  const removeFromRail = useCallback(
    (supplierId: string) => {
      if (recommendedIds.has(supplierId)) {
        setDismissed((current) => [...current, supplierId]);
      }
      setRailAdded((current) => current.filter((id) => id !== supplierId));
    },
    [recommendedIds],
  );

  const toggleAdd = useCallback(
    (supplier: Supplier) => {
      if (railIds.has(supplier.id)) {
        removeFromRail(supplier.id);
        return;
      }
      if (railSuppliers.length >= RAIL_LIMIT) return;
      setRailAdded((current) => [...current, supplier.id]);
    },
    [railIds, railSuppliers.length, removeFromRail],
  );

  const clearRecommended = useCallback(() => setCleared(true), []);

  const revealSupplier = useCallback(
    (supplierId: string) => {
      setPendingRevealId(supplierId);
      if (pathname !== "/") router.push("/");
    },
    [pathname, router],
  );

  const clearPendingReveal = useCallback(() => setPendingRevealId(null), []);

  const logged = answers.filter((answer) => !answer.skipped && answer.values.length > 0);
  const specRequirements: RequirementLine[] = spec
    ? SPEC_FACETS.filter((facet) => spec[facet.id]).map((facet) => ({
        label: facet.label,
        value: spec[facet.id] as string,
      }))
    : [];
  const requirements: RequirementLine[] =
    specRequirements.length > 0
      ? specRequirements
      : logged.map((answer) => ({
          label:
            RFI_SPEC_LABELS[answer.questionId] ??
            questionById(answer.questionId)?.title ??
            answer.questionId,
          value: answer.values.join(", "),
        }));
  const answerValue = (questionId: string) =>
    logged.find((answer) => answer.questionId === questionId)?.values[0];
  const draftPieces = spec
    ? [spec.alloy, spec.form, spec.profile].filter((value): value is string => Boolean(value))
    : [answerValue("material"), answerValue("process")].filter((value): value is string => value != null);
  const draftTitle = draftPieces.length > 0 ? draftPieces.join(" ") : query;

  return {
    railSuppliers,
    recommendedIds,
    addedCount: added.length,
    railFull,
    draftTitle,
    requirements,
    toggleAdd,
    removeFromRail,
    clearRecommended,
    revealSupplier,
    pendingRevealId,
    clearPendingReveal,
  };
}

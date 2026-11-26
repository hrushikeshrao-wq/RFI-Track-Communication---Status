"use client";

import { createContext, useContext } from "react";
import type { LoggedAnswer } from "@/lib/simulation";
import type { SpecId, SpecState } from "@/lib/spec";
import type { Supplier } from "@/lib/suppliers";

export type RequirementLine = { label: string; value: string };

export type SourcingContextValue = {
  answers: LoggedAnswer[];
  query: string;
  runId: number;
  removeAnswer: (questionId: string) => void;
  applyFilterAnswer: (questionId: string, values: string[] | null) => void;
  clearMappedAnswers: () => void;
  openDefine: () => void;
  /** Shared filter state. The left rail and All Filters both write it; the list reads it. */
  spec: SpecState;
  setSpec: (id: SpecId, value: string | null) => void;
  resetSpec: () => void;
  matchTotal: number;
  searchSaved: boolean;
  saveSearch: () => void;
  railSuppliers: Supplier[];
  recommendedIds: Set<string>;
  addedCount: number;
  railFull: boolean;
  draftTitle: string;
  requirements: RequirementLine[];
  toggleAdd: (supplier: Supplier) => void;
  removeFromRail: (supplierId: string) => void;
  clearRecommended: () => void;
  clearAdded: () => void;
  revealSupplier: (supplierId: string) => void;
  pendingRevealId: string | null;
  clearPendingReveal: () => void;
};

const SourcingContext = createContext<SourcingContextValue | null>(null);

export function SourcingProvider({
  value,
  children,
}: {
  value: SourcingContextValue;
  children: React.ReactNode;
}) {
  return <SourcingContext.Provider value={value}>{children}</SourcingContext.Provider>;
}

export function useSourcing(): SourcingContextValue {
  const value = useContext(SourcingContext);
  if (!value) {
    throw new Error("useSourcing must be used within SourcingExperience");
  }
  return value;
}

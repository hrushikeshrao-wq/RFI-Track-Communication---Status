"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FilterDrawer, type FilterGroup } from "@/components/filter-drawer";
import { useSourcing } from "@/components/sourcing-context";
import { SupplierCard } from "@/components/supplier-card";
import { ThomasLeadAd } from "@/components/thomas-lead-ad";
import {
  capabilitiesForMaterials,
  certificationsForAnswers,
  locationFromAnswers,
  mapCertificationOption,
  materialsFromCapabilities,
} from "@/lib/filter-sync";
import {
  questionById,
  candidatesFor,
  LOCATION_QUESTION_ID,
  simulatedMatchCount,
} from "@/lib/simulation";
import { rankSuppliers } from "@/lib/ranked-suppliers";
import { matchPillsFor } from "@/lib/match-pills";
import type { Supplier } from "@/lib/suppliers";

const PAGE_SIZE = 25;

/** Short uppercase label shown above each answer chip in the results header. */
const FACET_LABELS: Record<string, string> = {
  process: "PROCESS",
  material: "MATERIAL",
  stock: "THICKNESS",
  qty: "QUANTITY",
  size: "SIZE",
  tooling: "TOOLING",
  tol: "TOLERANCE",
  loc: "LOCATION",
  features: "FEATURES",
  part: "PART TYPE",
  app: "INDUSTRY",
  cert: "CERTIFICATIONS",
  diverse: "DIVERSITY",
};

/**
 * Search results: suppliers still matching the keyword and questionnaire,
 * best first. The shortlist itself floats over the page.
 */
export function SupplierResults() {
  const {
    answers,
    query,
    removeAnswer: onRemoveAnswer,
    applyFilterAnswer: onApplyFilterAnswer,
    clearMappedAnswers: onClearMappedAnswers,
    toggleAdd,
    recommendedIds,
    railSuppliers,
    railFull,
    pendingRevealId,
    clearPendingReveal,
  } = useSourcing();
  const railIds = useMemo(
    () => new Set(railSuppliers.map((supplier) => supplier.id)),
    [railSuppliers],
  );
  const [page, setPage] = useState(1);
  /** Draft for the drawer location field while typing; commits into answers. */
  const [locationDraft, setLocationDraft] = useState("");
  /** Classic facet rail, opened from "All Filters". */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [partnerOnly, setPartnerOnly] = useState(false);
  /** Local-only facets (no questionnaire twin) — e.g. company type. */
  const [localFacetPicks, setLocalFacetPicks] = useState<Record<string, string[]>>({});
  /** Card currently highlighted after a shortlist-chip click. */
  const [focusedSupplierId, setFocusedSupplierId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const locationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTarget = useRef<string | null>(null);
  const [revealNonce, setRevealNonce] = useState(0);

  const logged = answers.filter((answer) => !answer.skipped && answer.values.length > 0);

  // Keep the drawer location field aligned with the loc answer when it changes
  // from the left rail (or a committed drawer edit).
  const answerLocation = locationFromAnswers(answers);
  useEffect(() => {
    if (answerLocation === null) {
      setLocationDraft("");
      return;
    }
    setLocationDraft(answerLocation);
  }, [answerLocation]);

  useEffect(() => {
    return () => {
      if (locationTimer.current) clearTimeout(locationTimer.current);
    };
  }, []);

  /** Suppliers in the category still matching — the number the buyer is shown. */
  const matchTotal = simulatedMatchCount(answers);

  // Exact matches rank above any near matches the rail was padded with, so a
  // relaxed answer never pushes a supplier that meets everything down the list.
  const results = useMemo(() => {
    const types = localFacetPicks.companyType ?? [];
    return rankSuppliers(answers, query).filter(
      (supplier) =>
        (!verifiedOnly || supplier.verified === true) &&
        (types.length === 0 || types.some((type) => supplier.companyTypes.includes(type))),
    );
  }, [answers, query, verifiedOnly, localFacetPicks]);

  // A new answer or filter reshuffles the list, so the buyer starts back on
  // page one rather than stranded past the end of a shorter set.
  useEffect(() => {
    setPage(1);
  }, [results]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;

  const goToPage = (next: number) => {
    setPage(Math.min(pageCount, Math.max(1, next)));
    scrollRef.current?.scrollTo({ top: 0 });
  };

  // Facet options come from the suppliers this category can return, so the rail
  // never offers a filter that would empty the list on its own.
  const filterGroups = useMemo<FilterGroup[]>(() => {
    const collect = (pick: (supplier: Supplier) => string[]) => {
      const values = new Set<string>();
      for (const supplier of candidatesFor([])) for (const value of pick(supplier)) values.add(value);
      return [...values].sort();
    };
    return [
      { id: "companyType", title: "Company Type", options: collect((s) => s.companyTypes) },
      { id: "certification", title: "Quality Certifications", options: collect((s) => s.certifications) },
      { id: "material", title: "Material", options: collect((s) => s.capabilities) },
    ];
  }, []);

  const materialOptions =
    filterGroups.find((group) => group.id === "material")?.options ?? [];
  const certificationOptions =
    filterGroups.find((group) => group.id === "certification")?.options ?? [];

  // Mapped facets are derived from answers so the drawer and left rail stay in sync.
  const materialAnswer = logged.find((answer) => answer.questionId === "material");
  const syncedCertifications = certificationsForAnswers(answers, certificationOptions);
  const localCertifications = (localFacetPicks.certification ?? []).filter(
    (option) => mapCertificationOption(option) == null,
  );
  const facetPicks: Record<string, string[]> = {
    ...localFacetPicks,
    material: capabilitiesForMaterials(materialAnswer?.values ?? [], materialOptions),
    certification: [...syncedCertifications, ...localCertifications],
  };

  const filterCount =
    (verifiedOnly ? 1 : 0) +
    (partnerOnly ? 1 : 0) +
    (locationDraft.trim() ? 1 : 0) +
    Object.values(facetPicks).reduce((total, values) => total + values.length, 0);

  const clearFilters = () => {
    setVerifiedOnly(false);
    setPartnerOnly(false);
    setLocationDraft("");
    setLocalFacetPicks({});
    if (locationTimer.current) clearTimeout(locationTimer.current);
    onClearMappedAnswers();
  };

  const commitLocation = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      onApplyFilterAnswer(LOCATION_QUESTION_ID, null);
      return;
    }
    onApplyFilterAnswer(LOCATION_QUESTION_ID, [trimmed]);
  };

  const onLocation = (value: string) => {
    setLocationDraft(value);
    if (locationTimer.current) clearTimeout(locationTimer.current);
    locationTimer.current = setTimeout(() => commitLocation(value), 400);
  };

  const toggleFacet = (groupId: string, option: string) => {
    if (groupId === "material") {
      const currentCaps = new Set(facetPicks.material ?? []);
      if (currentCaps.has(option)) currentCaps.delete(option);
      else currentCaps.add(option);
      const materials = materialsFromCapabilities([...currentCaps]);
      onApplyFilterAnswer("material", materials.length > 0 ? materials : null);
      return;
    }

    if (groupId === "certification") {
      const mapped = mapCertificationOption(option);
      if (!mapped) {
        // No questionnaire twin — keep it local only.
        setLocalFacetPicks((current) => {
          const chosen = current[groupId] ?? [];
          return {
            ...current,
            [groupId]: chosen.includes(option)
              ? chosen.filter((entry) => entry !== option)
              : [...chosen, option],
          };
        });
        return;
      }

      const questionAnswers =
        answers.find((answer) => answer.questionId === mapped.questionId && !answer.skipped)
          ?.values ?? [];
      const next = questionAnswers.includes(mapped.value)
        ? questionAnswers.filter((value) => value !== mapped.value)
        : [...questionAnswers, mapped.value];
      onApplyFilterAnswer(mapped.questionId, next.length > 0 ? next : null);
      return;
    }

    setLocalFacetPicks((current) => {
      const chosen = current[groupId] ?? [];
      return {
        ...current,
        [groupId]: chosen.includes(option)
          ? chosen.filter((entry) => entry !== option)
          : [...chosen, option],
      };
    });
  };

  const facets = logged.map((answer) => ({
    id: answer.questionId,
    title: questionById(answer.questionId)?.title ?? "",
    label: FACET_LABELS[answer.questionId] ?? (questionById(answer.questionId)?.title ?? "").toUpperCase(),
    value: answer.values.join(", "),
  }));

  const matchPills = matchPillsFor(logged);

  useEffect(() => {
    if (!pendingRevealId) return;
    const id = pendingRevealId;
    const index = results.findIndex((supplier) => supplier.id === id);
    clearPendingReveal();
    if (index < 0) return;
    revealTarget.current = id;
    setFocusedSupplierId(id);
    const targetPage = Math.floor(index / PAGE_SIZE) + 1;
    if (targetPage !== currentPage) {
      setPage(targetPage);
    } else {
      setRevealNonce((nonce) => nonce + 1);
    }
  }, [pendingRevealId, results, currentPage, clearPendingReveal]);

  useEffect(() => {
    const id = revealTarget.current;
    if (!id) return;
    const card = scrollRef.current?.querySelector(`[data-supplier-id="${id}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    revealTarget.current = null;
  }, [page, revealNonce, results]);

  useEffect(() => {
    if (!focusedSupplierId) return;
    const timer = setTimeout(() => setFocusedSupplierId(null), 1600);
    return () => clearTimeout(timer);
  }, [focusedSupplierId]);

  return (
    <>
      <div className="results-body">
      <div className="results-center">
        <div className="pane-scroll" ref={scrollRef}>
      <div className="results-header">
        <div className="results-meta">
          <div className="results-headline">
            <h3 className="mar-0">Suppliers that match your spec</h3>
            <p className="mar-0 txt-smaller txt-darkblue-75">
              <span className="txt-blue-100 font-semi">{matchTotal.toLocaleString()}</span>{" "}
              verified suppliers match your query.
            </p>
          </div>
          <button
            type="button"
            className="all-filters"
            aria-label="All Filters"
            onClick={() => setFiltersOpen(true)}
          >
            <l-icon name="sliders" aria-hidden="true" />
            <span className="all-filters-label">All Filters</span>
            {filterCount > 0 && <span className="all-filters-count">{filterCount}</span>}
          </button>
        </div>
        {/* Logged answers echoed as removable pills, each under the facet it
            narrowed — the spec stays visible without reopening the drawer. */}
        {facets.length > 0 && (
          <div className="answer-pill-row">
            {facets.map((facet) => (
              <div className="answer-pill-stack" key={facet.id}>
                <span className="answer-pill-label">{facet.label}</span>
                <span className="answer-pill">
                  {facet.value}
                  <button
                    type="button"
                    className="answer-pill-remove"
                    aria-label={`Remove ${facet.title}: ${facet.value}`}
                    onClick={() => onRemoveAnswer(facet.id)}
                  >
                    <l-icon name="xmark" aria-hidden="true" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
        <div className="results-stage">
        <div className="results-main">
        <div className="results-list">
          {results.slice(pageStart, pageStart + PAGE_SIZE).map((supplier) => (
            <Fragment key={supplier.id}>
              <div
                className={
                  focusedSupplierId === supplier.id
                    ? "supplier-anchor is-focused"
                    : "supplier-anchor"
                }
                data-supplier-id={supplier.id}
              >
                <SupplierCard
                  supplier={supplier}
                  added={railIds.has(supplier.id)}
                  recommended={recommendedIds.has(supplier.id)}
                  addDisabled={railFull && !railIds.has(supplier.id)}
                  onToggleAdd={() => toggleAdd(supplier)}
                  matchPills={matchPills}
                />
              </div>
            </Fragment>
          ))}
          {results.length === 0 && (
            <l-panel class="results-row-full">
              <p className="mar-0">
                No suppliers match every requirement yet. Try skipping the last answer or widening a
                constraint.
              </p>
            </l-panel>
          )}
          {pageCount > 1 && (
            <nav className="results-row-full pagination" aria-label="Results pages">
              <button
                type="button"
                className="page-nav"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <l-icon name="arrow-left" aria-hidden="true" /> Previous
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  className="page-number"
                  aria-label={`Page ${number}`}
                  aria-current={number === currentPage ? "page" : undefined}
                  onClick={() => goToPage(number)}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                className="page-nav"
                disabled={currentPage === pageCount}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next <l-icon name="arrow-right" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
        <RelatedSearches suppliers={results} />
        </div>
        <ThomasLeadAd />
        </div>
      </div>
      </div>
      </div>

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        applied={facets}
        onRemoveApplied={onRemoveAnswer}
        groups={filterGroups}
        picked={facetPicks}
        onTogglePicked={toggleFacet}
        verifiedOnly={verifiedOnly}
        onVerifiedOnly={setVerifiedOnly}
        partnerOnly={partnerOnly}
        onPartnerOnly={setPartnerOnly}
        location={locationDraft}
        onLocation={onLocation}
        selectedCount={filterCount}
        onClearAll={clearFilters}
      />
    </>
  );
}

const RELATED_LIMIT = 12;

/** Capability terms from the current result set, shown after the list. */
function RelatedSearches({ suppliers }: { suppliers: Supplier[] }) {
  const terms = useMemo(() => {
    const seen = new Set<string>();
    const next: string[] = [];
    for (const supplier of suppliers) {
      for (const capability of supplier.capabilities) {
        if (seen.has(capability)) continue;
        seen.add(capability);
        next.push(capability);
        if (next.length >= RELATED_LIMIT) return next;
      }
    }
    return next;
  }, [suppliers]);

  if (terms.length === 0) return null;

  return (
    <section className="related-searches" aria-label="Related searches">
      <h2>Related Searches</h2>
      <ul>
        {terms.map((term) => (
          <li key={term}>
            <a href="#related" onClick={(event) => event.preventDefault()}>
              {term}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

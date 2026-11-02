"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SupplierLogo } from "@/components/supplier-logo";
import { BASE_PATH } from "@/lib/base-path";
import { CATEGORY_LABEL, SUPPLIERS, type Supplier } from "@/lib/suppliers";

const ROUTE = "/category-mobile";
/** Advertisers first: the PBL block the page exists to surface. */
const RECOMMENDED = [...SUPPLIERS].sort((a, b) => Number(b.sponsored) - Number(a.sponsored)).slice(0, 6);

const noop = (event: React.MouseEvent) => event.preventDefault();

const TITLE = `${CATEGORY_LABEL} Manufacturers and Suppliers in the USA and Canada`;
const INTRO = [
  `Welcome to this comprehensive resource for ${CATEGORY_LABEL} Suppliers and Manufacturers on Thomas. Here you can find any ${CATEGORY_LABEL} Suppliers that suits your needs.`,
  "If Ownership Diversity is important to you, we’ve included suppliers that are Veteran-Owned, Women-Owned, or Minority-Owned.",
  "If Quality Certifications are important to you, we’ve included the ability to filter by Certifications such as AS9100D, AS9120B or IATF 16949:2016.",
];
/** About two lines at phone width, cut on a word, ending in an ellipsis. */
const INTRO_TEASER = `${INTRO[0].slice(0, 96).replace(/\s+\S*$/, "")}…`;
const ON_THIS_PAGE = [
  `Recommended ${CATEGORY_LABEL} Suppliers`,
  `Recommended ${CATEGORY_LABEL} Brands`,
  `Product Catalogs for ${CATEGORY_LABEL}`,
  "Diverse Suppliers",
  "Certified Suppliers",
  "Suppliers by State / Province",
];

/** Thomas mobile header: wordmark and the search/menu icons. */
function MobileHeader() {
  return (
    <header className="mp-header">
      <a href="#" onClick={noop} aria-label="Thomas">
        <Image src={`${BASE_PATH}/thomas-wordmark.png`} width={99} height={20} alt="Thomas" priority />
      </a>
      <span className="mp-header-icons">
        <l-icon name="magnifying-glass" />
        <l-icon name="bars" />
      </span>
    </header>
  );
}

function Breadcrumb() {
  return (
    <l-breadcrumbs class="txt-body-sm">
      <nav aria-label="Breadcrumb">
        <a href="#" onClick={noop}>
          Home
        </a>
        <a href="#" onClick={noop} aria-current="page">
          {CATEGORY_LABEL}
        </a>
      </nav>
    </l-breadcrumbs>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <li className="mc-card">
      <div className="mp-result-head">
        <span className="mp-logo" aria-hidden="true">
          <SupplierLogo name={supplier.name} size={36} />
        </span>
        <div>
          <a href="#" onClick={noop} className="txt-label-lg">
            {supplier.name}
          </a>
          <p className="txt-body-sm txt-darkblue-60 mar-0">
            {supplier.city}, {supplier.state}
            {supplier.companyTypes[0] ? ` · ${supplier.companyTypes[0]}` : null}
          </p>
        </div>
      </div>
      <p className="mp-clamp txt-body-sm mar-0">{supplier.description}</p>
      <button kind="primary" className="mc-card-cta" onClick={noop}>
        Contact Supplier
      </button>
    </li>
  );
}

function RecommendedSuppliers() {
  return (
    <section className="mc-recommended" id="recommended">
      <h2 className="txt-panel-title mar-0">Recommended {CATEGORY_LABEL} Suppliers</h2>
      <ol className="mc-cards">
        {RECOMMENDED.map((supplier) => (
          <SupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </ol>
    </section>
  );
}

/** Today's page, as in the ticket screenshot: everything above the suppliers. */
function CurrentPage() {
  return (
    <article className="mc-page mc-page--current">
      <Breadcrumb />
      <h1 className="txt-page-title mar-t-3">{TITLE}</h1>
      <div className="mc-intro">
        {INTRO.map((paragraph) => (
          <p key={paragraph} className="mar-0">
            {paragraph}
          </p>
        ))}
      </div>
      <nav className="mc-toc mc-toc--panel" aria-label="What's on this page">
        <p className="txt-body-title mar-0">What’s on this page:</p>
        <ul>
          {ON_THIS_PAGE.map((item) => (
            <li key={item}>
              <a href="#" onClick={noop}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mc-hero-image" role="img" aria-label="Category video thumbnail">
        <l-icon name="video" />
      </div>
      <RecommendedSuppliers />
    </article>
  );
}

/** THO-3196: the same content, compressed so the PBL block reaches the fold. */
function ProposedPage() {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="mc-page">
      <Breadcrumb />
      {/* 1. H1 drops from page title (36px) to panel title (21px). */}
      <h1 className="txt-panel-title mar-t-2">{TITLE}</h1>

      {/* 2. Lead-in: a two-line teaser, the rest behind an inline See more (as in prod). */}
      <div className="mc-intro mc-intro--compact" id="mc-intro">
        {(expanded ? INTRO : [INTRO_TEASER]).map((paragraph, i, shown) => (
          <p key={paragraph} className="txt-body-sm mar-0">
            {paragraph}
            {i === shown.length - 1 && (
              <>
                {" "}
                <button
                  type="button"
                  className="mc-more"
                  aria-expanded={expanded}
                  aria-controls="mc-intro"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "See less" : "See more"} <l-icon name={expanded ? "caret-up" : "caret-down"} fill />
                </button>
              </>
            )}
          </p>
        ))}
      </div>

      {/* 3. What's on this page collapses to a single row. */}
      <details kind="accordion" className="mc-toc">
        <summary>What’s on this page</summary>
        {ON_THIS_PAGE.map((item) => (
          <a key={item} href="#" onClick={noop}>
            {item}
          </a>
        ))}
      </details>

      {/* 4–5. No image; suppliers follow straight on. */}
      <RecommendedSuppliers />
    </article>
  );
}

/** Mobile category page (MLLP), current vs. proposed (THO-3196). */
export function MobileCategoryFlow() {
  const proposed = useSearchParams().get("v") !== "current";

  return (
    <div className="mp-stage">
      <l-tabs role="tablist" kind="center" aria-label="Version">
        <Link href={{ pathname: ROUTE, query: { v: "current" } }} role="tab" aria-selected={!proposed}>
          Current
        </Link>
        <Link href={{ pathname: ROUTE }} role="tab" aria-selected={proposed}>
          Proposed
        </Link>
      </l-tabs>
      <div className="mp-phone mc-phone">
        <MobileHeader />
        {proposed ? <ProposedPage /> : <CurrentPage />}
        <div className="mc-fold" aria-hidden="true">
          <span>Approx. fold</span>
        </div>
      </div>
    </div>
  );
}

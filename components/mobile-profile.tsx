"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { SupplierCard } from "@/components/supplier-card";
import { SupplierLogo } from "@/components/supplier-logo";
import { BASE_PATH } from "@/lib/base-path";
import { matchPillsFor } from "@/lib/match-pills";
import { CATEGORY_LABEL, SUPPLIERS, type Supplier } from "@/lib/suppliers";

const ROUTE = "/supplier-profile";
/** One page of mobile results, in SRP order: the "next supplier" sequence. */
const RESULTS = SUPPLIERS.slice(0, 10);
/** Production's count line for this search. */
const RESULT_TOTAL = 3713;
const MATCH_PILLS = matchPillsFor([]);

const noop = (event: React.SyntheticEvent) => event.preventDefault();

const profileHref = (supplier: Supplier) => `${ROUTE}?id=${supplier.id}`;

/**
 * Stubbed until the record carries it: advertisers have claimed their
 * profile, everyone else hasn't.
 */
const isClaimed = (supplier: Supplier) => supplier.sponsored;

/** Stubbed like isClaimed: a couple of the verified advertisers. */
const TOP_RESPONDERS = new Set(["principal-manufacturing-corporation", "arcade-metal-stamping"]);

/**
 * Wider than a phone, the page shows itself in a 390px frame so the SRP
 * card's own phone breakpoints apply, as they would on a device.
 */
const WIDE_QUERY = "(min-width: 700px)";
function useWideScreen() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(WIDE_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}

/** Thomas mobile header, as on thomasnet.com: wordmark, Log In, Sign Up, menu. */
function MobileHeader() {
  return (
    <header className="mp-site-header">
      <a href="#" onClick={noop} aria-label="Thomas">
        <Image src={`${BASE_PATH}/thomas-wordmark.png`} width={109} height={22} alt="Thomas" priority />
      </a>
      <span className="mp-site-header-actions">
        <a href="#" onClick={noop}>
          Log In
        </a>
        <button kind="primary" scale="small" onClick={noop}>
          Sign Up
        </button>
        <l-icon name="bars" aria-label="Menu" />
      </span>
    </header>
  );
}

/**
 * The mobile SRP: production's search bar, results header and supplier card.
 * Profile links are plain same-tab links (THO-3195, item 1).
 */
function ResultsList() {
  // The list renders client-side, after the browser's own jump to the hash,
  // so a reload or shared link on /#supplier-id scrolls to that card here.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <>
      <form className="mp-search" onSubmit={noop} role="search">
        <input type="text" defaultValue="stamping services" aria-label="Search suppliers" />
        <l-icon name="magnifying-glass" aria-hidden="true" />
      </form>
      <div className="results-header mp-results-header">
        <div className="results-meta">
          <div className="results-headline">
            <h3 className="mar-0">Suppliers that match your requirements</h3>
            <p className="mar-0 txt-smaller txt-darkblue-75">
              <span className="txt-blue-100 font-semi">{RESULT_TOTAL.toLocaleString()}</span> verified
              suppliers found.
            </p>
          </div>
          <button type="button" className="all-filters" aria-label="All Filters" onClick={noop}>
            <l-icon name="sliders" aria-hidden="true" />
            <span className="all-filters-label">All Filters</span>
          </button>
        </div>
      </div>
      <div className="results-list">
        {RESULTS.map((supplier) => (
          <div key={supplier.id} id={supplier.id} className="mp-result">
            <SupplierCard
              supplier={supplier}
              added={false}
              onToggleAdd={() => {}}
              matchPills={MATCH_PILLS}
              profileHref={profileHref(supplier)}
              trustBadges={{ verified: isClaimed(supplier), topResponder: TOP_RESPONDERS.has(supplier.id) }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Back to results and Next supplier, at the top of the profile (items 3 and
 * 4). Back returns to this supplier's card on the SRP.
 */
function ProfileNav({ supplier, index }: { supplier: Supplier; index: number }) {
  const next = RESULTS[index + 1];
  return (
    <nav className="mp-nav" aria-label="Search results">
      <Link href={{ pathname: ROUTE, hash: supplier.id }} className="mp-nav-back">
        <l-icon name="angle-left" /> Back to results
      </Link>
      {next ? (
        <Link
          href={{ pathname: ROUTE, query: { id: next.id } }}
          className="mp-nav-next"
          aria-label={`Next supplier: ${next.name}`}
        >
          <span className="mp-nav-next-label">
            Next supplier <l-icon name="angle-right" />
          </span>
          <span className="mp-nav-next-name txt-body-sm txt-darkblue-60">{next.name}</span>
        </Link>
      ) : (
        <span className="txt-body-sm txt-darkblue-50">Last result</span>
      )}
    </nav>
  );
}

function SupplierProfile({ supplier, index }: { supplier: Supplier; index: number }) {
  const claimed = isClaimed(supplier);
  const similar = RESULTS.filter((other) => other.id !== supplier.id).slice(0, 4);
  const carouselRef = useRef<HTMLDivElement>(null);
  const page = (direction: 1 | -1) =>
    carouselRef.current?.scrollBy({ left: direction * carouselRef.current.clientWidth, behavior: "smooth" });

  // A same-tab profile change should land at the top, like a new page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [supplier.id]);

  return (
    <article className="mp-profile">
      {/* One white card for navigation and the name block: no seam between them. */}
      <div className="mp-profile-card">
      <div className="mp-profile-top">
        {/* Navigation first: where am I, then where next. */}
        <p className="mp-breadcrumb mar-0">
          <a href="#" onClick={noop}>
            Home
          </a>{" "}
          /{" "}
          <a href="#" onClick={noop}>
            {CATEGORY_LABEL}
          </a>{" "}
          / <span>{supplier.name} Company Profile</span>
        </p>
        <ProfileNav supplier={supplier} index={index} />
      </div>

      <div className="mp-profile-main">
        <h1 className="txt-subpage-title mar-0">{supplier.name}</h1>
        {/* Item 2: the Claim block becomes a single line under the name. */}
        {claimed ? (
          <p className="mp-claim txt-body-sm mar-0">
            <l-chip kind="success" class="mp-claim-chip">
              <l-icon name="circle-check" fill /> Claimed
            </l-chip>
          </p>
        ) : (
          <p className="mp-claim txt-body-sm mar-0">
            <l-chip class="mp-claim-chip">Unclaimed</l-chip>
            <span>
              Is this your business?{" "}
              <a href="#" onClick={noop}>
                Claim
              </a>
            </span>
          </p>
        )}
        {/* Production hides the address below 576px; THO-3195 shows it on phones too. */}
        <p className="mp-types mar-0">
          {supplier.companyTypes.join(" • ")}
          <span className="mp-types-sep" aria-hidden="true">•</span>
          <span className="mp-address">
            <l-icon name="location-dot" aria-hidden="true" />
            {supplier.city}, {supplier.state} {supplier.zip}
          </span>
        </p>

        <div className="mp-actions">
          {/* Production greys this out on unclaimed profiles. */}
          <button kind="primary" className="mp-action-wide" disabled={!claimed} onClick={noop}>
            Contact Supplier
          </button>
          <button kind="primary-outline" onClick={noop}>
            <l-icon name="arrow-up-right-from-square" /> Visit Website
          </button>
          <button kind="primary-outline" onClick={noop}>
            <l-icon name="phone" /> Call Supplier
          </button>
        </div>
        {/* Secondary actions after the primary ones, as on most mobile profiles. */}
        <div className="mp-tools">
          <a href="#" onClick={noop} aria-label="Save">
            <l-icon name="bookmark" />
          </a>
          <a href="#" onClick={noop}>
            <l-icon name="circle-plus" /> Shortlist
          </a>
          <a href="#" onClick={noop}>
            <l-icon name="pen-to-square" /> Suggest an Edit
          </a>
        </div>
      </div>

      </div>

      <section className="mp-section">
        <div className="mp-section-head">
          <h2 className="txt-panel-title mar-0">Similar Suppliers</h2>
          <span className="flex gap-2">
            <button kind="angle" direction="left" aria-label="Previous suppliers" onClick={() => page(-1)} />
            <button kind="angle" direction="right" aria-label="More suppliers" onClick={() => page(1)} />
          </span>
        </div>
        <div className="mp-similar" ref={carouselRef}>
          {similar.map((other) => (
            <l-panel key={other.id} class="mp-similar-card">
              <span className="mp-logo" aria-hidden="true">
                <SupplierLogo name={other.name} size={36} />
              </span>
              <Link href={profileHref(other)}>{other.name}</Link>
              <span className="txt-body-sm txt-darkblue-60">
                {other.city}, {other.state}
              </span>
            </l-panel>
          ))}
        </div>
      </section>

      {/* Production's profile body, unchanged by the ticket. */}
      <div className="mp-tabs">
        <span>
          Profile <l-icon name="caret-down" />
        </span>
      </div>
      <l-panel class="mp-description">
        <h2 className="txt-subpage-title mar-0">Business Description</h2>
        <p className="mp-description-tab mar-0">About {supplier.name}</p>
        <h3 className="txt-panel-title mar-0">Company Description by Thomasnet</h3>
        <p className="txt-body mar-0">{supplier.description}</p>
      </l-panel>
    </article>
  );
}

/** Mobile SRP and company profile, both in the same tab (THO-3195). */
export function MobileProfileFlow() {
  const wide = useWideScreen();
  const id = useSearchParams().get("id");
  const index = id ? RESULTS.findIndex((supplier) => supplier.id === id) : -1;

  if (wide) {
    // Prototype frame, not product UI: the same URL at phone width.
    return (
      <div className="mp-device-stage">
        <iframe className="mp-device" src={window.location.href} title="Mobile supplier profile" />
      </div>
    );
  }

  return (
    <div className="mp-screen">
      <MobileHeader />
      {index >= 0 ? <SupplierProfile supplier={RESULTS[index]} index={index} /> : <ResultsList />}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { SupplierLogo } from "@/components/supplier-logo";
import { BASE_PATH } from "@/lib/base-path";
import { SUPPLIERS, isUncontactable, type Supplier } from "@/lib/suppliers";

const ROUTE = "/supplier-profile";
/** One page of mobile results, in SRP order: the "next supplier" sequence. */
const RESULTS = SUPPLIERS.slice(0, 10);

const noop = (event: React.MouseEvent) => event.preventDefault();

/**
 * Stubbed until the record carries it: advertisers have claimed their
 * profile, everyone else hasn't.
 */
const isClaimed = (supplier: Supplier) => supplier.sponsored;

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

/** The mobile SRP. Profile links are plain same-tab links (THO-3195, item 1). */
function ResultsList() {
  // The list renders client-side, after the browser's own jump to the hash,
  // so a reload or shared link on /#supplier-id scrolls to that card here.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <>
      <div className="mp-results-head">
        <p className="txt-body-sm txt-darkblue-60 mar-0">Stamping Services</p>
        <h1 className="txt-panel-title mar-0">{SUPPLIERS.length} suppliers</h1>
      </div>
      <ol className="mp-results">
        {RESULTS.map((supplier) => (
          <li key={supplier.id} id={supplier.id} className="mp-result">
            <div className="mp-result-head">
              <span className="mp-logo" aria-hidden="true">
                <SupplierLogo name={supplier.name} size={36} />
              </span>
              <div>
                <Link href={{ pathname: ROUTE, query: { id: supplier.id } }}>
                  {supplier.name}
                </Link>
                <p className="txt-body-sm txt-darkblue-60 mar-0">
                  {supplier.city}, {supplier.state}
                  {supplier.companyTypes[0] ? ` · ${supplier.companyTypes[0]}` : null}
                </p>
              </div>
            </div>
            <p className="mp-clamp txt-body-sm mar-0">{supplier.description}</p>
            <Link href={{ pathname: ROUTE, query: { id: supplier.id } }}>
              View Profile <l-icon name="angle-right" />
            </Link>
          </li>
        ))}
      </ol>
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
  const contactable = !isUncontactable(supplier);
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
      <ProfileNav supplier={supplier} index={index} />

      <p className="txt-body-sm txt-darkblue-60 mar-0">
        Result {index + 1} of {RESULTS.length}
      </p>

      <div className="mp-profile-head">
        <span className="mp-logo mp-logo--lg" aria-hidden="true">
          <SupplierLogo name={supplier.name} size={56} />
        </span>
        <div>
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
          <p className="txt-body-sm txt-darkblue-75 mar-0">
            {supplier.companyTypes[0] ? `${supplier.companyTypes[0]} · ` : null}
            {supplier.city}, {supplier.state}
          </p>
        </div>
      </div>

      <div className="mp-actions">
        <button kind="primary" className="mp-action-wide" disabled={!contactable} onClick={noop}>
          Contact Supplier
        </button>
        <button kind="primary-outline" onClick={noop}>
          <l-icon name="arrow-up-right-from-square" /> Visit Website
        </button>
        <button kind="primary-outline" onClick={noop}>
          <l-icon name="phone" /> Call Supplier
        </button>
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
              <Link href={{ pathname: ROUTE, query: { id: other.id } }}>{other.name}</Link>
              <span className="txt-body-sm txt-darkblue-60">
                {other.city}, {other.state}
              </span>
            </l-panel>
          ))}
        </div>
      </section>

      <section className="mp-section">
        <h2 className="txt-panel-title mar-0 mar-b-3">About</h2>
        <p className="txt-body-sm mar-0">{supplier.description}</p>
        <dl className="mp-facts txt-body-sm">
          {supplier.employees && (
            <>
              <dt>Employees</dt>
              <dd>{supplier.employees}</dd>
            </>
          )}
          {supplier.revenue && (
            <>
              <dt>Revenue</dt>
              <dd>{supplier.revenue}</dd>
            </>
          )}
          {supplier.founded && (
            <>
              <dt>Founded</dt>
              <dd>{supplier.founded}</dd>
            </>
          )}
        </dl>
      </section>
    </article>
  );
}

/** Mobile SRP and company profile, both in the same tab (THO-3195). */
export function MobileProfileFlow() {
  const id = useSearchParams().get("id");
  const index = id ? RESULTS.findIndex((supplier) => supplier.id === id) : -1;

  return (
    <div className="mp-stage">
      <div className="mp-phone">
        <MobileHeader />
        {index >= 0 ? <SupplierProfile supplier={RESULTS[index]} index={index} /> : <ResultsList />}
      </div>
    </div>
  );
}

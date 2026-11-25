"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MediaTile } from "@/components/supplier-card";
import { SupplierLogo } from "@/components/supplier-logo";
import { useSourcing } from "@/components/sourcing-context";
import { BASE_PATH } from "@/lib/base-path";
import { CATEGORY_LABEL, RAIL_LIMIT, SUPPLIERS } from "@/lib/suppliers";

const noop = (event: React.MouseEvent) => event.preventDefault();

/**
 * Company profile modeled on a Thomas company page. Opened in its own tab from
 * a supplier name or View Profile link. The floating shortlist stays mounted
 * in the prototype layout.
 */
export function SupplierProfile({ id }: { id: string }) {
  const supplier = SUPPLIERS.find((entry) => entry.id === id);
  const { toggleAdd, railSuppliers, railFull } = useSourcing();
  const [tab, setTab] = useState<"profile" | "products">("profile");

  if (!supplier) {
    return (
      <div className="company-page pane-scroll">
        <p className="mar-0">This supplier is not in the current results.</p>
        <Link href="/">Back to results</Link>
      </div>
    );
  }

  const added = railSuppliers.some((entry) => entry.id === supplier.id);
  const addDisabled = railFull && !added;
  const location = [supplier.city, supplier.state, supplier.zip].filter(Boolean).join(", ");

  return (
    <div className="company-page pane-scroll">
      <nav className="company-crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/">{CATEGORY_LABEL}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{supplier.name}</span>
      </nav>

      <header className="company-hero">
        <div className="company-logo" aria-hidden="true">
          <SupplierLogo name={supplier.name} size={72} />
        </div>
        <div className="company-hero-copy">
          <div className="company-title-row">
            <h1 className="mar-0">{supplier.name}</h1>
            {supplier.verified && (
              <Image
                src={`${BASE_PATH}/verified-badge.png`}
                width={22}
                height={22}
                alt="Verified supplier"
                title="Verified supplier"
              />
            )}
          </div>
          {location && (
            <p className="company-location mar-0">
              <l-icon name="location-dot" aria-hidden="true" /> {location}
            </p>
          )}
          {supplier.companyTypes.length > 0 && (
            <p className="company-types mar-0">{supplier.companyTypes.join(" · ")}</p>
          )}
          <dl className="company-stats">
            {supplier.employees && (
              <div>
                <dt>Employees</dt>
                <dd>{supplier.employees}</dd>
              </div>
            )}
            {supplier.revenue && (
              <div>
                <dt>Annual Revenue</dt>
                <dd>{supplier.revenue}</dd>
              </div>
            )}
            {supplier.founded && (
              <div>
                <dt>Year Founded</dt>
                <dd>{supplier.founded}</dd>
              </div>
            )}
          </dl>
          <div className="company-actions">
            <button
              kind="primary"
              className="company-contact"
              disabled={addDisabled && !added}
              onClick={() => {
                if (!added) toggleAdd(supplier);
              }}
            >
              Contact Supplier
            </button>
            <button kind="neutral" className="company-website" onClick={noop}>
              Visit Website <l-icon name="arrow-up-right-from-square" />
            </button>
            <span
              className="card-add-wrap"
              data-tip={
                addDisabled
                  ? `You can select up to ${RAIL_LIMIT} suppliers`
                  : undefined
              }
            >
              <button
                kind="neutral"
                className="company-save"
                aria-pressed={added}
                disabled={addDisabled}
                aria-label={
                  added
                    ? `Selected supplier ${supplier.name}`
                    : `Select supplier ${supplier.name}`
                }
                onClick={() => toggleAdd(supplier)}
              >
                {added ? <l-icon name="circle-check" /> : <span className="select-ring" aria-hidden="true" />}{" "}
                {added ? "Selected" : "Select"}
              </button>
            </span>
          </div>
        </div>
      </header>

      <div className="company-tabs" role="tablist" aria-label="Company sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          className={tab === "profile" ? "is-active" : undefined}
          onClick={() => setTab("profile")}
        >
          Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "products"}
          className={tab === "products" ? "is-active" : undefined}
          onClick={() => setTab("products")}
        >
          Products &amp; Services
        </button>
      </div>

      {tab === "profile" ? (
        <div className="company-sections" role="tabpanel">
          <section>
            <h2>About {supplier.name}</h2>
            <p className="mar-0">{supplier.description}</p>
          </section>
          <section>
            <h2>Business Details</h2>
            <dl className="company-details">
              <div>
                <dt>Company Name</dt>
                <dd>{supplier.name}</dd>
              </div>
              {location && (
                <div>
                  <dt>Location</dt>
                  <dd>{location}</dd>
                </div>
              )}
              {supplier.companyTypes.length > 0 && (
                <div>
                  <dt>Company Type</dt>
                  <dd>{supplier.companyTypes.join(", ")}</dd>
                </div>
              )}
              {supplier.employees && (
                <div>
                  <dt>Employees</dt>
                  <dd>{supplier.employees}</dd>
                </div>
              )}
              {supplier.revenue && (
                <div>
                  <dt>Annual Revenue</dt>
                  <dd>{supplier.revenue}</dd>
                </div>
              )}
              {supplier.founded && (
                <div>
                  <dt>Year Founded</dt>
                  <dd>{supplier.founded}</dd>
                </div>
              )}
              <div>
                <dt>Primary Category</dt>
                <dd>{CATEGORY_LABEL}</dd>
              </div>
            </dl>
          </section>
          {supplier.capabilities.length > 0 && (
            <section>
              <h2>Products &amp; Services</h2>
              <ul className="company-caps">
                {supplier.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </section>
          )}
          {supplier.certifications.length > 0 && (
            <section>
              <h2>Certifications</h2>
              <ul className="company-caps">
                {supplier.certifications.map((certification) => (
                  <li key={certification}>{certification}</li>
                ))}
              </ul>
            </section>
          )}
          {supplier.media.length > 0 && (
            <section>
              <h2>Company Media</h2>
              <div className="company-media">
                {supplier.media.map((kind) => (
                  <MediaTile key={kind} kind={kind} label={`${supplier.name} ${kind}`} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="company-sections" role="tabpanel">
          <section>
            <h2>Products &amp; Services</h2>
            {supplier.capabilities.length > 0 ? (
              <ul className="company-caps">
                {supplier.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            ) : (
              <p className="mar-0">No products or services are listed for this supplier yet.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

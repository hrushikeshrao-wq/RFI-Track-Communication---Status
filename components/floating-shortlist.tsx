"use client";

import { useState } from "react";
import { RfiEmailModalOption5 } from "@/components/rfi-email-modal-option-5";
import { SupplierLogo } from "@/components/supplier-logo";
import { SupplierRequest } from "@/components/supplier-request";
import { useSourcing } from "@/components/sourcing-context";
import { RAIL_LIMIT, contactableOnly, isUncontactable, UNCONTACTABLE_NOTE } from "@/lib/suppliers";
import "../app/rfi-modal/rfi-modal.css";

/**
 * Right-side Quick Contact rail. Recommended suppliers start selected.
 * Select, remove, Clear, and Contact follow the results-page selection flow.
 */
export function FloatingShortlist() {
  const {
    railSuppliers,
    addedCount,
    requirements,
    removeFromRail,
    clearRecommended,
    clearAdded,
    revealSupplier,
    openDefine,
  } = useSourcing();
  const [requestOpen, setRequestOpen] = useState(false);
  const [option5Open, setOption5Open] = useState(false);
  const [rfiCollapsed, setRfiCollapsed] = useState(false);
  const contactable = contactableOnly(railSuppliers);
  const recommended = railSuppliers.slice(addedCount);
  const added = railSuppliers.slice(0, addedCount);
  const drafted = requirements.length > 0;

  const chip = (supplier: (typeof railSuppliers)[number]) => {
    const blocked = isUncontactable(supplier);
    return (
      <li key={supplier.id} className={blocked ? "qc-chip is-blocked" : "qc-chip"} data-tip={blocked ? UNCONTACTABLE_NOTE : undefined}>
        <button
          type="button"
          className="qc-chip-open"
          onClick={() => revealSupplier(supplier.id)}
          aria-label={`Show ${supplier.name} in results`}
        >
          <SupplierLogo name={supplier.name} size={22} />
          <span>{supplier.name}</span>
        </button>
        <button type="button" className="qc-chip-remove" aria-label={`Remove ${supplier.name}`} onClick={() => removeFromRail(supplier.id)}>
          <l-icon name="xmark" aria-hidden="true" />
        </button>
      </li>
    );
  };

  return (
    <>
      <aside className="qc-rail" aria-label="Quick Contact Suppliers">
        <header className="qc-head">
          <span className="qc-badge" aria-hidden="true">
            <l-icon name="paper-plane" />
          </span>
          <div>
            <h2 className="mar-0">Quick Contact Suppliers</h2>
            <p className="mar-0">
              <span>{railSuppliers.length}</span>/{RAIL_LIMIT} selected
            </p>
          </div>
        </header>

        <div className="qc-body">
          {added.length > 0 && (
            <>
              <div className="qc-section">
                <span>Added by you</span>
                <button type="button" onClick={clearAdded}>
                  Clear
                </button>
              </div>
              <ul className="qc-list">{added.map(chip)}</ul>
            </>
          )}
          {recommended.length > 0 && (
            <>
              <div className="qc-section">
                <span>
                  <l-icon name="sparkles" aria-hidden="true" /> Recommended suppliers
                </span>
                <button type="button" onClick={clearRecommended}>
                  Clear
                </button>
              </div>
              <ul className="qc-list">{recommended.map(chip)}</ul>
            </>
          )}
          {railSuppliers.length === 0 && (
            <p className="qc-empty">Select suppliers from the results to contact them.</p>
          )}
        </div>

        <div className="qc-foot">
          <div className={`qc-rfi${drafted ? " is-drafted" : ""}${rfiCollapsed ? " is-collapsed" : ""}`}>
            <button
              type="button"
              className="qc-rfi-bar"
              aria-expanded={!rfiCollapsed}
              onClick={() => setRfiCollapsed((collapsed) => !collapsed)}
            >
              <span>{drafted ? "RFI drafted for you" : "No RFI drafted yet"}</span>
              <l-icon name={rfiCollapsed ? "plus" : "minus"} aria-hidden="true" />
            </button>
            {!rfiCollapsed && (
              <div className="qc-rfi-body">
                {drafted ? (
                  <>
                    <strong>{requirements.map((line) => line.value).slice(0, 3).join(" ")}</strong>
                    <ul>
                      {requirements.map((line) => (
                        <li key={line.label}>
                          {line.label}: <strong>{line.value}</strong>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="qc-rfi-preview" onClick={() => setRequestOpen(true)}>
                      Preview RFI <l-icon name="arrow-right" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <p className="mar-0">
                    <button type="button" onClick={openDefine}>
                      Answer smart filter questions
                    </button>{" "}
                    and we&apos;ll draft an RFI from your requirements.
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="qc-contact"
            disabled={contactable.length === 0}
            onClick={() => setOption5Open(true)}
          >
            Contact {contactable.length} Supplier{contactable.length === 1 ? "" : "s"}
          </button>
          <p className="qc-note">You can review your draft before sending</p>
        </div>
      </aside>
      <RfiEmailModalOption5
        open={option5Open}
        onClose={() => setOption5Open(false)}
        recipients={railSuppliers.map((supplier) => ({ id: supplier.id, name: supplier.name }))}
        requirements={requirements.map((line) => `${line.label}: ${line.value}`)}
        subject={requirements
          .slice(0, 3)
          .map((line) => line.value)
          .join(" ")}
      />
      <SupplierRequest
        open={requestOpen}
        suppliers={contactable}
        onClose={() => setRequestOpen(false)}
        brief={{
          subject: requirements.slice(0, 3).map((line) => line.value).join(" "),
          details: requirements.map((line) => `${line.label}: ${line.value}`).join("\n"),
          zip: requirements.find((line) => line.label === "LOCATION")?.value.match(/\d{5}/)?.[0] ?? "",
        }}
      />
    </>
  );
}

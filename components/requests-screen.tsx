"use client";

import { useState } from "react";

const STATUS_STEPS = ["Email sent", "Received", "Viewed", "Replied"] as const;

/** Completed steps for one supplier, from Email sent through Replied. */
type SupplierStage = 1 | 2 | 3 | 4;

/**
 * One row per supplier. A request sent to several suppliers appears once for
 * each supplier, with that supplier's own progress.
 */
const REQUEST_ROWS: {
  request: string;
  created: string;
  neededBy: string;
  supplier: string;
  stage: SupplierStage;
}[] = [
  { request: "Sealed deep-groove ball bearings", created: "Nov 9, 2026", neededBy: "Dec 1, 2026", supplier: "Fasteners Unlimited", stage: 3 },
  { request: "Sealed deep-groove ball bearings", created: "Nov 9, 2026", neededBy: "Dec 1, 2026", supplier: "Bearing Supply Co.", stage: 3 },
  { request: "Sealed deep-groove ball bearings", created: "Nov 9, 2026", neededBy: "Dec 1, 2026", supplier: "Pacific Bearing", stage: 2 },
  { request: "Sealed deep-groove ball bearings", created: "Nov 9, 2026", neededBy: "Dec 1, 2026", supplier: "Allied Motion", stage: 2 },
  { request: "Stainless hex bolts, M8", created: "Nov 9, 2026", neededBy: "Nov 30, 2026", supplier: "Northline Fasteners", stage: 4 },
  { request: "Stainless hex bolts, M8", created: "Nov 9, 2026", neededBy: "Nov 30, 2026", supplier: "Apex Fasteners", stage: 3 },
  { request: "Stainless hex bolts, M8", created: "Nov 9, 2026", neededBy: "Nov 30, 2026", supplier: "Metro Fastener Co.", stage: 3 },
  { request: "Custom rubber gaskets", created: "Nov 8, 2026", neededBy: "ASAP", supplier: "Apex Seals", stage: 2 },
  { request: "Spring steel washers", created: "Nov 4, 2026", neededBy: "Jan 15, 2027", supplier: "Summit Hardware", stage: 1 },
  { request: "Spring steel washers", created: "Nov 4, 2026", neededBy: "Jan 15, 2027", supplier: "Pioneer Spring", stage: 1 },
  { request: "CNC aluminum brackets", created: "Oct 28, 2026", neededBy: "Nov 25, 2026", supplier: "Delta Machining", stage: 3 },
  { request: "CNC aluminum brackets", created: "Oct 28, 2026", neededBy: "Nov 25, 2026", supplier: "Ridge Precision", stage: 3 },
  { request: "CNC aluminum brackets", created: "Oct 28, 2026", neededBy: "Nov 25, 2026", supplier: "Cascade Tooling", stage: 2 },
  { request: "Hydraulic cylinders, 2-inch bore", created: "Oct 21, 2026", neededBy: "Dec 10, 2026", supplier: "Summit Hydraulics", stage: 4 },
  { request: "Hydraulic cylinders, 2-inch bore", created: "Oct 21, 2026", neededBy: "Dec 10, 2026", supplier: "Orion Fluid Power", stage: 4 },
  { request: "Titanium fasteners, Grade 5", created: "Oct 15, 2026", neededBy: "Nov 20, 2026", supplier: "Aero Fastener Co.", stage: 2 },
  { request: "Titanium fasteners, Grade 5", created: "Oct 15, 2026", neededBy: "Nov 20, 2026", supplier: "Titan Supply", stage: 2 },
  { request: "Titanium fasteners, Grade 5", created: "Oct 15, 2026", neededBy: "Nov 20, 2026", supplier: "Summit Titanium", stage: 2 },
];

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "user" },
  { id: "requests", label: "Requests", icon: "plane" },
  { id: "activity", label: "Recent Activity", icon: "clock", caret: true },
  { id: "shortlists", label: "Shortlists", icon: "list" },
  { id: "saved", label: "Saved", icon: "bookmark", caret: true },
  { id: "downloads", label: "Downloads", icon: "download", caret: true },
  { id: "settings", label: "Settings & Preferences", icon: "mail", caret: true },
  { id: "help", label: "Help", icon: "help" },
] as const;

/**
 * Buyer Requests inbox matching the Thomas account screen:
 * dark account rail, Requests / Archived tabs, and the empty welcome state.
 */
export function RequestsScreen({ option = 0 }: { option?: 0 | 1 | 2 }) {
  const [tab, setTab] = useState<"requests" | "archived">("requests");

  return (
    <div className="requests-screen" data-requests-option={option}>
      <aside className="requests-side" aria-label="Your account">
        <div className="requests-brand">
          <span className="requests-mark" aria-hidden="true">
            <span className="is-capped" />
            <span />
          </span>
          <span className="requests-wordmark">
            <strong>THOMAS</strong>
            <small>For Industry.</small>
          </span>
        </div>

        <div className="requests-account-tabs" role="tablist" aria-label="Account">
          <button type="button" role="tab" aria-selected="true">
            <UserIcon /> Your Account
          </button>
          <button type="button" role="tab" aria-selected="false">
            <BuildingIcon /> Your Company
          </button>
        </div>

        <div className="requests-profile">
          <span className="requests-avatar" aria-hidden="true">
            <UserIcon />
            <em>
              ADD
              <br />
              PHOTO
            </em>
          </span>
          <span>
            <strong>Hrushikesh Rao</strong>
            <small>General Management</small>
          </span>
          <button type="button" className="requests-edit" aria-label="Edit profile">
            <PencilIcon />
          </button>
        </div>

        <nav className="requests-nav">
          {NAV.map((item) => (
            <button key={item.id} type="button" aria-current={item.id === "requests" ? "page" : undefined}>
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
              {"caret" in item && item.caret ? <CaretIcon /> : null}
            </button>
          ))}
        </nav>

        <button type="button" className="requests-logout">
          <NavIcon name="logout" />
          <span>Logout</span>
        </button>
      </aside>

      <div className="requests-body">
        <main className="requests-main">
          <nav className="requests-crumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span aria-hidden="true">&gt;</span>
            <span>Your Account</span>
            <span aria-hidden="true">&gt;</span>
            <span aria-current="page">Requests</span>
          </nav>

          <header className="requests-heading">
            <h1>Requests</h1>
            <p>Create requirements and invite Suppliers to provide Quotes.</p>
          </header>

          <div className="requests-tabs" role="tablist" aria-label="Requests">
            <button type="button" role="tab" aria-selected={tab === "requests"} onClick={() => setTab("requests")}>
              Requests
            </button>
            <button type="button" role="tab" aria-selected={tab === "archived"} onClick={() => setTab("archived")}>
              Archived
            </button>
          </div>

          <section className="requests-card" aria-label={tab === "requests" ? "Requests" : "Archived requests"}>
            {tab === "requests" ? (
              <table className="requests-grid">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>
                      <span className="requests-sort">
                        Created
                        <svg viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M6 2v8M3.5 7.5 6 10l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </span>
                    </th>
                    <th>Needed by</th>
                    <th>Status</th>
                    <th>Selected suppliers</th>
                    <th>
                      <span className="requests-sr">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {REQUEST_ROWS.map((row) => (
                    <tr key={`${row.request}-${row.supplier}`}>
                      <td>
                        <button type="button" className="requests-name">
                          {row.request}
                        </button>
                      </td>
                      <td>{row.created}</td>
                      <td>{row.neededBy}</td>
                      <td>
                        <StatusStepper stage={row.stage} supplier={row.supplier} nodes={option === 2} />
                      </td>
                      <td>{row.supplier}</td>
                      <td>
                        <button type="button" className="requests-more" aria-label={`More actions for ${row.request} and ${row.supplier}`}>
                          ···
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="requests-empty">
                <h2>No Archived Requests found</h2>
                <p>
                  Archived Requests will be hidden from your Requests Inbox. All archived requests
                  can either be unarchived to move them back to your Requests Inbox or will reappear
                  in your inbox if a supplier responds to your request.
                </p>
              </div>
            )}
          </section>

          <footer className="requests-legal">
            Copyright© 2026 Thomas Publishing Company. All Rights Reserved. See{" "}
            <a href="https://www.thomasnet.com/terms-and-conditions.html">Terms and Conditions</a>,{" "}
            <a href="https://www.thomasnet.com/privacy-policy.html">Privacy Statement</a>,{" "}
            <a href="https://www.thomasnet.com/privacy-policy.html#california">
              California Do Not Track Notice
            </a>{" "}
            and <a href="https://www.thomasnet.com/privacy-policy.html#choices">Your Privacy Choices</a>
            . Thomasnet Is A Registered Trademark Of Thomas Publishing Company.
          </footer>
        </main>
      </div>
    </div>
  );
}

function StepCheck() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.2 8.2 6.4 11.2 12.8 4.8"
      />
    </svg>
  );
}

function StatusStepper({
  stage,
  supplier,
  nodes = false,
}: {
  stage: SupplierStage;
  supplier: string;
  nodes?: boolean;
}) {
  const current = STATUS_STEPS[stage - 1];
  return (
    <div className={nodes ? "requests-stepper is-nodes" : "requests-stepper"}>
      <ol aria-label={`${supplier}: ${current}`}>
        {STATUS_STEPS.map((label, index) => {
          const done = index < stage;
          const state = !nodes ? undefined : index < stage - 1 ? "done" : index === stage - 1 ? "current" : "upcoming";
          return (
            <li key={label} data-done={done ? "true" : undefined} data-state={state}>
              {nodes ? (
                <span className={`requests-node is-${state}`}>
                  {state === "upcoming" ? null : <StepCheck />}
                </span>
              ) : (
                <span className="requests-step-bar" />
              )}
              <span className="requests-sr">{label}</span>
            </li>
          );
        })}
      </ol>
      <span className="requests-step">
        {nodes ? null : (
          <span className="requests-step-mark is-done">
            <StepCheck />
          </span>
        )}
        {current}
      </span>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "user" || name === "dashboard") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3" />
        <path d="M6.2 18.2c.8-2.6 2.8-4 5.8-4s5 1.4 5.8 4" />
      </svg>
    );
  }
  if (name === "plane") {
    return (
      <svg {...common}>
        <path d="M4 11.5 20 4.5 13 20l-2.2-6.2L4 11.5Z" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="7.2" />
        <path d="M12 8.2V12l2.4 1.6" />
      </svg>
    );
  }
  if (name === "list") {
    return (
      <svg {...common}>
        <path d="M9 7h10M9 12h10M9 17h10" />
        <path d="M5 7h.01M5 12h.01M5 17h.01" />
      </svg>
    );
  }
  if (name === "bookmark") {
    return (
      <svg {...common}>
        <path d="M7 5.5h10v13l-5-3-5 3v-13Z" />
      </svg>
    );
  }
  if (name === "download") {
    return (
      <svg {...common}>
        <path d="M12 5v9" />
        <path d="m8.5 11 3.5 3.5L15.5 11" />
        <path d="M6 18.5h12" />
      </svg>
    );
  }
  if (name === "mail") {
    return (
      <svg {...common}>
        <rect x="4" y="6" width="16" height="12" rx="1.5" />
        <path d="m5 7 7 6 7-6" />
      </svg>
    );
  }
  if (name === "help") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="7.2" />
        <path d="M9.6 9.5a2.4 2.4 0 1 1 3.3 2.2c-.7.4-1.1.9-1.1 1.6" />
        <path d="M12 16.6h.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M10 7H6.5A1.5 1.5 0 0 0 5 8.5v7A1.5 1.5 0 0 0 6.5 17H14" />
      <path d="M10 12h9" />
      <path d="m16 9 3 3-3 3" />
    </svg>
  );
}

function CaretIcon() {
  return (
    <svg className="requests-caret" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.2 4.2h7.6L6 9.2z" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5.2" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.4 13.2c.7-2.2 2.4-3.2 4.6-3.2s3.9 1 4.6 3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 13.5V4.2L8 2.5l5 1.7v9.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.2 13.5V9.2h3.6v4.3M6.4 6h.01M9.6 6h.01" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M9.2 3.4 12.6 6.8 6 13.4H2.6V10L9.2 3.4Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

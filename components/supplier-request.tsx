"use client";

import { useEffect, useState } from "react";
import { LoginScreen } from "@/components/login-screen";
import { SupplierLogo } from "@/components/supplier-logo";
import type { Supplier } from "@/lib/suppliers";

type SupplierRequestProps = {
  open: boolean;
  suppliers: Supplier[];
  onClose: () => void;
  /** Refined spec carried into the request so it does not start blank. */
  brief?: { subject: string; details: string; zip: string };
};

/**
 * Contact Supplier request opened from the selection bar's Request Quote.
 * Prototype only — nothing is sent.
 */
export function SupplierRequest({ open, suppliers, onClose, brief }: SupplierRequestProps) {
  const [subject, setSubject] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [details, setDetails] = useState("");
  const [zip, setZip] = useState("");
  const [handling, setHandling] = useState("");
  const [verified, setVerified] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [done, setDone] = useState<null | "send" | "draft">(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSubject(brief?.subject ?? "");
      setNeededBy("");
      setDetails(brief?.details ?? "");
      setZip(brief?.zip ?? "");
      setHandling("");
      setVerified(false);
      setLoggedIn(false);
      setDone(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loginOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loginOpen, onClose]);

  if (!open) return null;

  const primary = suppliers[0];
  const askLogin = (intent: "send" | "draft") => {
    if (intent === "send" && !verified) return;
    if (!loggedIn) {
      setLoginOpen(true);
      return;
    }
    setDone(intent);
  };

  return (
    <div className="request-scrim">
      <div className="request-page" role="dialog" aria-modal="true" aria-labelledby="request-title">
        <header className="request-top">
          <button type="button" className="request-back" aria-label="Back" onClick={onClose}>
            <l-icon name="arrow-left" aria-hidden="true" />
          </button>
          <span className="request-brand">THOMAS</span>
        </header>

        {done ? (
          <div className="request-done">
            <h1 id="request-title">
              {done === "send" ? "Request ready to send" : "Draft saved"}
            </h1>
            <p>
              {done === "send"
                ? `This prototype does not send the request. ${suppliers.length} supplier${suppliers.length === 1 ? "" : "s"} would receive it.`
                : "This prototype keeps the draft on this page only."}
            </p>
            <button type="button" kind="primary" onClick={onClose}>
              Back to results
            </button>
          </div>
        ) : (
          <div className="request-layout">
            <div className="request-main">
              <h1 id="request-title">Contact Supplier</h1>
              <p className="request-lead">
                Provide details about your needs, such as the specific products and services you
                require, and any questions you have for suppliers. We&apos;ll forward this
                information, along with your contact details, to your selected suppliers.
              </p>

              <h2>Request Details</h2>
              <div className="request-row">
                <label>
                  Request Subject
                  <input
                    type="text"
                    value={subject}
                    placeholder="Add a subject to identify your request"
                    onChange={(event) => setSubject(event.target.value)}
                  />
                </label>
                <label>
                  Response Requested By <span>Optional</span>
                  <input
                    type="date"
                    value={neededBy}
                    onChange={(event) => setNeededBy(event.target.value)}
                  />
                </label>
              </div>
              <label>
                Details and/or Questions
                <textarea
                  value={details}
                  placeholder="Add details or questions about the specific products, services, or capabilities you're looking for."
                  onChange={(event) => setDetails(event.target.value)}
                />
              </label>

              <p className="request-optional-label">Files and Attachments <span>Optional</span></p>
              <button type="button" className="request-files" onClick={() => askLogin("draft")}>
                <l-icon name="cloud-arrow-up" aria-hidden="true" />
                Log In or Join to attach files to your request.
              </button>

              <h2>Fulfillment Details</h2>
              <label>
                Fulfillment Location <span>Optional</span>
                <input
                  type="text"
                  value={zip}
                  placeholder="Add a Zip/Postal Code"
                  onChange={(event) => setZip(event.target.value)}
                />
              </label>
              <label>
                Shipping/Handling Instructions <span>Optional</span>
                <textarea
                  value={handling}
                  placeholder="Add any specific requirements for packaging, delivery, or handling."
                  onChange={(event) => setHandling(event.target.value)}
                />
              </label>
            </div>

            {primary && (
              <aside className="request-side">
                <p className="request-side-label">Send to</p>
                <div className="request-recipient">
                  <SupplierLogo name={primary.name} size={48} />
                  <div>
                    <strong>{primary.name}</strong>
                    <p className="mar-0">
                      {primary.city}, {primary.state}
                    </p>
                  </div>
                </div>
                {suppliers.length > 1 && (
                  <p className="request-more">
                    and {suppliers.length - 1} more selected supplier
                    {suppliers.length - 1 === 1 ? "" : "s"}
                  </p>
                )}
                <p className="request-note">
                  To send to multiple suppliers, select more than one company from your search
                  results and click Contact.
                </p>
                <label className="request-verify">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(event) => setVerified(event.target.checked)}
                  />
                  <span>
                    I verify that no confidential or export-controlled data was uploaded or entered
                    in this project.
                  </span>
                </label>
                <button
                  type="button"
                  kind="primary"
                  className="request-send"
                  disabled={!verified}
                  onClick={() => askLogin("send")}
                >
                  {loggedIn ? "Send Request" : "Log In to Send Request"}
                </button>
                <button type="button" className="request-draft" onClick={() => askLogin("draft")}>
                  {loggedIn ? "Save as Draft" : "Log In to Save as Draft"}
                </button>
              </aside>
            )}
          </div>
        )}
      </div>
      <LoginScreen
        open={loginOpen}
        onDismiss={() => {
          setLoginOpen(false);
          setLoggedIn(true);
        }}
      />
    </div>
  );
}

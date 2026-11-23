"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { RfiSuccessPopup } from "@/components/rfi-success-popup";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const INITIAL_REQUIREMENTS = [
  "Brackets",
  "Stainless steel",
  "Progressive die stamping",
  "10,000+ parts",
];

const RECIPIENTS = [
  {
    id: "sri",
    name: "SRI Performance",
    email: "sales@sriperformance.com",
  },
  {
    id: "ronson",
    name: "Ronson Manufacturing",
    email: "",
  },
  {
    id: "arcade",
    name: "Arcade Metal Stamping",
    email: "",
  },
];

const MESSAGE_GUIDE =
  "Hello,\n\nDescribe the products, services or capabilities you need, quantities, materials and any questions you have.";

function twoDaysAheadLabel() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

type RfiEmailModalProps = {
  open: boolean;
  onClose: () => void;
  /** Font variable classes for the Guided artifact type system. */
  className?: string;
};

/**
 * Option 2 of the modal prototype. Starts as a copy of Option 1 so it can
 * diverge without changing Option 0 or Option 1.
 */
export function RfiEmailModalOption2({ open, onClose, className }: RfiEmailModalProps) {
  const [requirements, setRequirements] = useState(INITIAL_REQUIREMENTS);
  const [recipients, setRecipients] = useState(RECIPIENTS);
  const [reachOut, setReachOut] = useState(true);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [replyByOn, setReplyByOn] = useState(false);
  const [replyByLabel] = useState(twoDaysAheadLabel);
  const [files, setFiles] = useState<File[]>([]);
  const [sent, setSent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const supplierCount = recipients.length;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function sendEmail() {
    if (sent) return;
    const missingConsent = !verified;
    const missingMessage = message.trim().length === 0;
    const missingRecipients = supplierCount === 0;
    setConsentError(missingConsent);
    setMessageError(missingMessage);
    if (missingMessage) messageRef.current?.focus();
    if (missingConsent || missingMessage || missingRecipients) return;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rfi-scrim" role="presentation" onClick={onClose}>
        <RfiSuccessPopup
          className={className}
          subject="Stainless Steel Progressive Die Stamped Brackets"
          supplierCount={supplierCount}
          requirements={requirements}
          reachOut={reachOut}
          stepper="states"
          insetScroll
          onClose={onClose}
        />
      </div>
    );
  }

  return (
    <div className="rfi-scrim" role="presentation" onClick={onClose}>
      <div
        className={className ? `rfi-dialog ${className}` : "rfi-dialog"}
        data-modal-option="2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfi-email-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rfi-main">
          <p className="rfi-kicker">
            <PlaneIcon />
            New request for information
          </p>
          <h2 id="rfi-email-title" className="rfi-title">
            Email {supplierCount} supplier{supplierCount === 1 ? "" : "s"}
          </h2>

          <div className="rfi-card">
            <div className="rfi-row">
              <span className="rfi-row-label">From</span>
              <span className="rfi-from">
                <span className="rfi-initials" aria-hidden="true">
                  JL
                </span>
                <strong>Jordan Lee</strong>
                <span className="rfi-email">jordan.lee@gmail.com</span>
              </span>
            </div>

            <div className="rfi-row rfi-row-to">
              <span className="rfi-row-label">To</span>
              <div className="rfi-pills">
                {recipients.map((recipient) => (
                  <span className="rfi-pill" key={recipient.id}>
                    <RecipientMark id={recipient.id} />
                    <span className="rfi-pill-name">{recipient.name}</span>
                    {recipient.email ? (
                      <span className="rfi-pill-email">{recipient.email}</span>
                    ) : null}
                    <button
                      type="button"
                      className="rfi-pill-x"
                      aria-label={`Remove ${recipient.name}`}
                      disabled={sent}
                      onClick={() =>
                        setRecipients((current) => current.filter((item) => item.id !== recipient.id))
                      }
                    >
                      <CloseIcon />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="rfi-row">
              <span className="rfi-row-label">Subject</span>
              <strong className="rfi-subject">Stainless Steel Progressive Die Stamped Brackets</strong>
            </div>

            <label className={`rfi-body${messageError ? " is-invalid" : ""}`}>
              <span className="rfi-sr">Your request</span>
              <textarea
                ref={messageRef}
                value={message}
                rows={4}
                placeholder={MESSAGE_GUIDE}
                aria-invalid={messageError}
                disabled={sent}
                onChange={(event) => {
                  setMessage(event.target.value);
                  if (event.target.value.trim()) setMessageError(false);
                }}
              />
            </label>

            <div className="rfi-reqs">
              <p className="rfi-reqs-label">{requirements.length} requirements attached to your request</p>
              <div className="rfi-req-pills">
                {requirements.map((requirement) => (
                  <span className="rfi-req" key={requirement}>
                    {requirement}
                    <button
                      type="button"
                      aria-label={`Remove ${requirement}`}
                      onClick={() =>
                        setRequirements((current) => current.filter((item) => item !== requirement))
                      }
                    >
                      <CloseIcon />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {files.length > 0 ? (
              <div className="rfi-files">
                <p className="rfi-files-label">Attachments ({files.length})</p>
                <ul>
                  {files.map((file) => (
                    <li key={`${file.name}-${file.size}`}>
                      <ClipIcon />
                      <span className="rfi-file-name">{file.name}</span>
                      <span className="rfi-file-size">{formatFileSize(file.size)}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        disabled={sent}
                        onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                      >
                        <CloseIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="rfi-tools">
              <button type="button" className="rfi-tool rfi-tool-attach" disabled={sent} onClick={() => fileInputRef.current?.click()}>
                <ClipIcon />
                Attach files
              </button>
              <input
                ref={fileInputRef}
                className="rfi-sr"
                type="file"
                multiple
                onChange={(event) => {
                  const next = Array.from(event.target.files ?? []);
                  if (next.length) setFiles((current) => [...current, ...next]);
                  event.target.value = "";
                }}
              />
              <span className="rfi-tool-divider" aria-hidden="true" />
              <span className="rfi-tool rfi-reply-toggle">
                <button
                  type="button"
                  className="rfi-switch"
                  role="switch"
                  aria-checked={replyByOn}
                  aria-labelledby="rfi-reply-by-label"
                  disabled={sent}
                  onClick={() => setReplyByOn((current) => !current)}
                >
                  <span className="rfi-switch-knob" />
                </button>
                <span id="rfi-reply-by-label">Reply by</span>
                {replyByOn ? <strong>{replyByLabel}</strong> : null}
              </span>
            </div>
          </div>
          {sent ? (
            <p className="rfi-sent" role="status">
              Email sent to {supplierCount} supplier{supplierCount === 1 ? "" : "s"}.
            </p>
          ) : null}

          <div className="rfi-footer">
            <label className={`rfi-consent${consentError ? " is-invalid" : ""}`}>
              <input
                type="checkbox"
                checked={verified}
                disabled={sent}
                onChange={(event) => {
                  setVerified(event.target.checked);
                  if (event.target.checked) setConsentError(false);
                }}
              />
              <span>I verify that no confidential or export-controlled data was uploaded or entered in this project.</span>
            </label>
            <button type="button" className="rfi-send" disabled={sent || supplierCount === 0} onClick={sendEmail}>
              <PlaneIcon />
              {sent
                ? "Email sent"
                : `Send email to ${supplierCount} supplier${supplierCount === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>

        <aside className="rfi-side" aria-label="Thomas sales team">
          <button type="button" className="rfi-close" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
          <span className="rfi-rep">
            <span className="rfi-rep-frame">
              <img
                className="rfi-rep-photo"
                src={`${BASE_PATH}/rfi-modal/kevin-portrait.png`}
                alt=""
              />
            </span>
            <span className="rfi-rep-badge" aria-hidden="true">
              <ShieldIcon />
            </span>
          </span>
          <p className="rfi-rep-name">Kevin Babcock</p>
          <p className="rfi-rep-role">Thomas Sales Team</p>
          <h3>Contact with Confidence</h3>
          <p className="rfi-side-lead">Get a response from suppliers or our team will make it right</p>

          <ul className="rfi-assurances">
            <li>
              <span className="rfi-assure-icon" aria-hidden="true">
                <ClockIcon />
              </span>
              <span>
                <strong>Guaranteed Response</strong>
                Get a quality response for your project within 48 hours
              </span>
            </li>
            <li>
              <span className="rfi-assure-icon" aria-hidden="true">
                <PeopleIcon />
              </span>
              <span>
                <strong>Professional Intros</strong>
                Our team will connect you with suppliers that match your needs
              </span>
            </li>
            <li>
              <span className="rfi-assure-icon" aria-hidden="true">
                <ShieldIcon />
              </span>
              <span>
                <strong>Private &amp; Secure</strong>
                We never share your information with suppliers without your consent.
              </span>
            </li>
          </ul>

          <div className="rfi-reach">
            <button
              type="button"
              className="rfi-switch"
              role="switch"
              aria-checked={reachOut}
              disabled={sent}
              onClick={() => setReachOut((current) => !current)}
            >
              <span className="rfi-switch-knob" />
            </button>
            <p>
              <strong>
                Have Thomas reach out to more <ShieldIcon tone="gold" /> Verified Suppliers
              </strong>
              <span>Thomas can use this RFI to look for other qualified suppliers who may meet my needs.</span>
            </p>
            <span className="rfi-new">New!</span>
          </div>

          <img
            className="rfi-wordmark"
            src={`${BASE_PATH}/logos/thomas-logo.svg`}
            alt="Thomas"
          />
        </aside>
      </div>
    </div>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        d="M14.4 1.6 1.7 6.7l4.3 1.6 1.6 4.4L14.4 1.6Z"
      />
      <path fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" d="M6 8.3 14.1 1.9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M4 4l8 8M12 4l-8 8"
      />
    </svg>
  );
}

function ClipIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        d="M6.2 8.6 10 4.8a2.2 2.2 0 0 1 3.1 3.1l-5 5a3.2 3.2 0 0 1-4.5-4.5l4.8-4.8"
      />
    </svg>
  );
}

function ShieldIcon({ tone }: { tone?: "gold" }) {
  const fill = tone === "gold" ? "var(--rfi-gold)" : "currentColor";
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill={fill}
        d="M8 1.4 13 3.2v4.4c0 3-2 5.2-5 6.6-3-1.4-5-3.6-5-6.6V3.2L8 1.4Z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.4 7.7 7.2 9.4l3.3-3.4"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" d="M10 6.2V10l2.4 1.6" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 20 20">
      <circle cx="7.2" cy="7.2" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13" cy="7.6" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        d="M3.4 14.2c.5-2 2-3.1 3.8-3.1s3.3 1.1 3.8 3.1M12 11.2c1.3.1 2.4.8 2.9 2.2"
      />
    </svg>
  );
}

function RecipientMark({ id }: { id: string }) {
  if (id === "sri") {
    return (
      <span className="rfi-mark rfi-mark-sri" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path fill="#c81e1e" d="M2 12.5 8 2.5l6 10H2Z" />
          <path fill="#1c1c1c" d="M6.2 10.2h3.6L8 7.2l-1.8 3Z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="rfi-mark rfi-mark-ronson" aria-hidden="true">
      <svg viewBox="0 0 16 16">
        <rect width="16" height="16" rx="2" fill="#1d4ed8" />
        <path fill="#fff" d="M3 11.5V4.5h2.1l2.9 4.2V4.5H10v7H8L5.1 7.2v4.3H3Z" />
      </svg>
    </span>
  );
}

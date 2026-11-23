import { useState, type ReactNode } from "react";
import { BASE_PATH } from "@/lib/base-path";

const REQUEST_ID = "RFI-48213";

const REQUIREMENT_DETAILS = [
  { label: "Product", value: "Brackets" },
  { label: "Material", value: "Stainless steel" },
  { label: "Process", value: "Progressive die stamping" },
  { label: "Annual volume", value: "10,000+ parts" },
];

export function RfiSuccessPopup({
  className,
  subject,
  supplierCount,
  requirements,
  reachOut,
  onClose,
  layout = "stacked",
  stepper = "shared",
  insetScroll = false,
}: {
  className?: string;
  subject: string;
  supplierCount: number;
  requirements: string[];
  reachOut: boolean;
  onClose: () => void;
  layout?: "stacked" | "split";
  stepper?: "shared" | "states";
  insetScroll?: boolean;
}) {
  const details = REQUIREMENT_DETAILS.filter((detail) => requirements.includes(detail.value));
  const split = layout === "split";
  const stated = stepper === "states";
  const classes = ["rfi-success", split ? "rfi-success-split" : "", insetScroll ? "is-inset-scroll" : "", className]
    .filter(Boolean)
    .join(" ");
  const [copied, setCopied] = useState(false);

  async function copyRequestId() {
    try {
      await navigator.clipboard.writeText(REQUEST_ID);
    } catch {
      const field = document.createElement("textarea");
      field.value = REQUEST_ID;
      field.setAttribute("readonly", "");
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const message = (
    <>
      <div className="rfi-success-check" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 12.5 10 17l9-10"
          />
        </svg>
      </div>
      <h2 id="rfi-success-title">Your Request has been sent!</h2>
      <p className="rfi-success-lead">
        You&apos;ll be notified when suppliers respond to your request. While you wait, you can return
        to your search to contact more suppliers or manage your existing requests.
      </p>
      {split ? (
        <p className="rfi-success-id">
          <button
            type="button"
            className="rfi-success-id-box"
            aria-label={copied ? "Request ID copied" : "Copy request ID"}
            onClick={copyRequestId}
          >
            <span>Request ID</span>
            <span className="rfi-success-id-value">{REQUEST_ID}</span>
            <span className="rfi-success-id-copy" aria-hidden="true">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </span>
          </button>
        </p>
      ) : (
        <p className="rfi-success-id">Request ID {REQUEST_ID}</p>
      )}

      <p className="rfi-success-status">Your suppliers received your request.</p>
      <ol className={stated ? "rfi-success-steps is-states" : "rfi-success-steps"}>
        <li data-done="true" data-state={stated ? "complete" : undefined}>
          <span className="rfi-success-bar" />
          <span className="rfi-success-step">
            <StepMark done>
              <CheckIcon />
            </StepMark>
            Email sent
          </span>
        </li>
        <li data-done="true" data-state={stated ? "active" : undefined}>
          <span className={stated ? "rfi-success-bar" : "rfi-success-bar is-fading"} />
          <span className="rfi-success-step">
            <StepMark done>
              <CheckIcon />
            </StepMark>
            Received
          </span>
        </li>
        <li data-state={stated ? "upcoming" : undefined}>
          <span className="rfi-success-bar" />
          <span className="rfi-success-step">
            <StepMark>
              <CheckIcon />
            </StepMark>
            Viewed
          </span>
        </li>
        <li data-state={stated ? "upcoming" : undefined}>
          <span className="rfi-success-bar" />
          <span className="rfi-success-step">
            <StepMark>
              <CheckIcon />
            </StepMark>
            Replied
          </span>
        </li>
      </ol>

      <ol className="rfi-success-thread">
        <li className="rfi-success-message">
          <span className="rfi-success-avatar" aria-hidden="true">
            JL
          </span>
          <section className="rfi-success-card" aria-label="Original request">
            <header className="rfi-success-head">
              <div className="rfi-success-who">
                <strong>{subject}</strong>
                <span className="rfi-success-tag">Request</span>
              </div>
              <time>Just now</time>
            </header>
            <div className="rfi-success-content">
              <p className="rfi-success-route">
                jordan.lee@gmail.com to {supplierCount} supplier{supplierCount === 1 ? "" : "s"}
              </p>
              {details.length > 0 ? (
                <dl className="rfi-success-spec">
                  {details.map((detail) => (
                    <div key={detail.label}>
                      <dt>{detail.label}:</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </section>
        </li>
        <li className="rfi-success-message rfi-success-message-note">
          <span className="rfi-success-count" aria-hidden="true">
            {supplierCount}
          </span>
          <p className="rfi-success-reply-note">Replies will come to jordan.lee@gmail.com.</p>
        </li>
      </ol>

      {split || !reachOut ? null : (
        <div className="rfi-success-reach">
          <img src={`${BASE_PATH}/rfi-modal/kevin-portrait.png`} alt="" />
          <p>
            <strong>Thomas will reach out to more Verified Suppliers for this request.</strong>
            <span>Kevin Babcock · Thomas Sales Team</span>
          </p>
        </div>
      )}
    </>
  );

  const kevin = (
    <aside className="rfi-success-side" aria-label="Thomas sales team">
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
      <p className="rfi-success-kevin-name">Kevin Babcock</p>
      <p className="rfi-success-kevin-role">Thomas Sales Team</p>
      {reachOut ? (
        <>
          <p className="rfi-success-kevin-thanks">Thank you for opting in!</p>
          <p className="rfi-success-kevin-note">
            Thomas will reach out
            <br />
            to more Verified Suppliers
            <br />
            for this request.
          </p>
        </>
      ) : null}
    </aside>
  );

  const actions = (
    <div className="rfi-success-actions">
      <button type="button" onClick={onClose}>
        Manage Your Requests
      </button>
      <button type="button" onClick={onClose}>
        Return to Thomas
      </button>
    </div>
  );

  return (
    <div
      className={classes}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rfi-success-title"
      onClick={(event) => event.stopPropagation()}
    >
      {insetScroll && !split ? (
        <div className="rfi-success-scroll">
          {message}
          {actions}
        </div>
      ) : (
        <>
          {split ? <div className="rfi-success-main">{message}</div> : message}
          {split ? kevin : null}
          {actions}
        </>
      )}
    </div>
  );
}

function StepMark({ done, children }: { done?: boolean; children: ReactNode }) {
  return (
    <span className={done ? "rfi-success-mark is-done" : "rfi-success-mark"} aria-hidden="true">
      {children}
    </span>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M8 1.4 13 3.2v4.4c0 3-2 5.2-5 6.6-3-1.4-5-3.6-5-6.6V3.2L8 1.4Z" />
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

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x="6"
        y="6"
        width="8"
        height="8"
        rx="1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10 4.2V3.4A1.4 1.4 0 0 0 8.6 2H3.4A1.4 1.4 0 0 0 2 3.4v5.2A1.4 1.4 0 0 0 3.4 10H4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16">
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

"use client";

import { useState, type ReactNode } from "react";

const REQUEST_ID = "RFI-48213";

/**
 * Thomas notification that the buyer's RFI was submitted, plus the request thread.
 */
export function EmailThreadScreen({ option = 0 }: { option?: 0 | 1 }) {
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

  const notice = (
    <>
      <p className="rfi-success-lead">
        You&apos;ll be notified when suppliers respond to your request. While you wait, you can return
        to your search to contact more suppliers or manage your existing requests.
      </p>
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
    </>
  );

  const progress = (
    <>
      <p className="rfi-success-status">Your suppliers received your request.</p>
      <ol className="rfi-success-steps">
        <li data-done="true">
          <span className="rfi-success-bar" />
          <span className="rfi-success-step">
            <StepMark done>
              <CheckIcon />
            </StepMark>
            Email sent
          </span>
        </li>
        <li data-done="true">
          <span className="rfi-success-bar is-fading" />
          <span className="rfi-success-step">
            <StepMark done>
              <CheckIcon />
            </StepMark>
            Received
          </span>
        </li>
        <li>
          <span className="rfi-success-bar" />
          <span className="rfi-success-step">
            <StepMark>
              <CheckIcon />
            </StepMark>
            Viewed
          </span>
        </li>
        <li>
          <span className="rfi-success-bar" />
          <span className="rfi-success-step">
            <StepMark>
              <CheckIcon />
            </StepMark>
            Replied
          </span>
        </li>
      </ol>
    </>
  );

  return (
    <div className="email-screen" data-email-option={option}>
      <article className="email-thread" aria-labelledby="email-thread-title">
        <header className="email-mast">
          <a className="email-brand" href="#email-request" aria-label="Thomas">
            <svg className="email-mark" viewBox="0 0 28 28" aria-hidden="true">
              <rect x="3" y="3" width="8" height="22" rx="1" fill="#0F6AED" />
              <rect x="15" y="3" width="8" height="22" rx="1" fill="#0F6AED" />
            </svg>
            <span className="email-word">THOMAS</span>
            <sup className="email-tm">TM</sup>
          </a>
          <a className="email-rfi" href="#email-request">
            <l-icon name="paper-plane" aria-hidden="true" />
            Request for Information
          </a>
        </header>

        <div className="email-body">
          <h1 id="email-thread-title">
            Your request has been sent: Stainless Steel Progressive Die Stamped Brackets
          </h1>
          <l-chip>Inbox</l-chip>
          {option === 1 ? (
            <div className="email-status-split">
              <div className="email-status-copy">{notice}</div>
              <div className="email-status-progress">{progress}</div>
            </div>
          ) : (
            <>
              {notice}
              {progress}
            </>
          )}

          <ol className="rfi-success-thread" id="email-request">
            <li className="rfi-success-message rfi-success-message-note">
              <span className="rfi-success-count" aria-hidden="true">
                3
              </span>
              <p className="rfi-success-reply-note">Replies will come to jordan.lee@gmail.com.</p>
            </li>
            <li className="rfi-success-message">
              <span className="rfi-success-avatar" aria-hidden="true">
                JL
              </span>
              <section className="rfi-success-card" aria-label="Original request">
                <header className="rfi-success-head">
                  <div className="rfi-success-who">
                    <strong>Stainless Steel Progressive Die Stamped Brackets</strong>
                    <span className="rfi-success-tag">Request</span>
                  </div>
                  <time>Just now</time>
                </header>
                <div className="rfi-success-content">
                  <p className="rfi-success-route">jordan.lee@gmail.com to 3 suppliers</p>
                  <dl className="rfi-success-spec">
                    <div>
                      <dt>Product:</dt>
                      <dd>Brackets</dd>
                    </div>
                    <div>
                      <dt>Material:</dt>
                      <dd>Stainless steel</dd>
                    </div>
                    <div>
                      <dt>Process:</dt>
                      <dd>Progressive die stamping</dd>
                    </div>
                    <div>
                      <dt>Annual volume:</dt>
                      <dd>10,000+ parts</dd>
                    </div>
                  </dl>
                </div>
              </section>
            </li>
          </ol>

          <div className="email-actions" role="group" aria-label="Reply actions">
            <button kind="primary" type="button">
              Reply
            </button>
            <button kind="neutral" type="button">
              Reply all
            </button>
            <button kind="neutral" type="button">
              Forward
            </button>
            <button kind="neutral" type="button" aria-label="More actions">
              <l-icon name="circle-plus" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
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

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="6" y="6" width="8" height="8" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
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

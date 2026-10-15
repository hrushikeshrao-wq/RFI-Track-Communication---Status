"use client";

const noop = (event: React.MouseEvent) => event.preventDefault();

/** Right-column advertisement, matching the Thomas SRP lead unit. */
export function ThomasLeadAd() {
  return (
    <aside className="lead-ad" aria-label="Advertisement">
      <span className="lead-ad-label">Ad</span>
      <div className="lead-ad-mark" aria-hidden="true">
        <span className="lead-ad-bars">
          <span />
          <span />
        </span>
        <span className="lead-ad-word">THOMAS</span>
      </div>
      <div className="lead-ad-laptop" aria-hidden="true">
        <div className="lead-ad-screen">
          <div className="lead-ad-ui">
            <span className="lead-ad-side" />
            <span className="lead-ad-main">
              <span />
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
        <div className="lead-ad-chin" />
      </div>
      <p className="lead-ad-copy">
        Generate Qualified Leads With a Free Company Profile on Thomasnet.com
        <sup>®</sup>
      </p>
      <button type="button" className="lead-ad-cta" onClick={noop}>
        List Your Company
      </button>
    </aside>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ContactSupplierModal } from "@/components/contact-supplier-modal";
import { LoginScreen } from "@/components/login-screen";
import { RegisterGate } from "@/components/register-gate";
import { SelectSuppliersRail } from "@/components/select-suppliers-rail";
import { ShortlistModal } from "@/components/shortlist-modal";
import { useSourcing } from "@/components/sourcing-context";
import { contactableOnly } from "@/lib/suppliers";

/**
 * Collapsed call-to-action at the bottom-right. Expanding it opens the
 * shortlist as a floating panel, independent of the page columns.
 */
export function FloatingShortlist() {
  const {
    railSuppliers,
    addedCount,
    draftTitle,
    requirements,
    removeFromRail,
    clearRecommended,
    revealSupplier,
  } = useSourcing();
  const [expanded, setExpanded] = useState(false);
  const [shortlistStage, setShortlistStage] = useState<
    null | "register" | "login" | "shortlist"
  >(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [alert, setAlert] = useState<null | "add" | "remove">(null);
  const [alertTick, setAlertTick] = useState(0);
  const previousIds = useRef<string | null>(null);

  const listIds = railSuppliers.map((supplier) => supplier.id).join("\n");

  useEffect(() => {
    if (previousIds.current === null) {
      previousIds.current = listIds;
      return;
    }
    if (previousIds.current === listIds) return;
    const before = new Set(previousIds.current.split("\n").filter(Boolean));
    const after = new Set(listIds.split("\n").filter(Boolean));
    const added = [...after].filter((id) => !before.has(id)).length;
    const removed = [...before].filter((id) => !after.has(id)).length;
    previousIds.current = listIds;
    if (added === 0 && removed === 0) return;
    setAlert(removed > 0 && added === 0 ? "remove" : added > 0 && removed === 0 ? "add" : "remove");
    setAlertTick((tick) => tick + 1);
    const timeout = window.setTimeout(() => setAlert(null), 1100);
    return () => window.clearTimeout(timeout);
  }, [listIds]);

  const contactable = contactableOnly(railSuppliers);

  const openRailRfi = () => setContactOpen(true);

  const saveToShortlist = () => setShortlistStage(null);

  return (
    <>
      <div className="shortlist-dock">
        {expanded && (
          <div className="shortlist-panel" id="shortlist-panel">
            <SelectSuppliersRail
              suppliers={railSuppliers}
              onRemove={removeFromRail}
              onReveal={revealSupplier}
              onAddToShortlist={() => setShortlistStage("register")}
              onSendRfi={openRailRfi}
              draftTitle={draftTitle}
              requirementCount={requirements.length}
              requirementPreview={requirements}
              addedCount={addedCount}
              onClearRecommended={clearRecommended}
              onCollapse={() => setExpanded(false)}
            />
          </div>
        )}
        <div className="shortlist-fab-wrap">
          {alert && (
            <span key={alertTick} className="shortlist-alert" data-alert={alert} role="status">
              {alert === "add" ? "Added" : "Removed"}
            </span>
          )}
          <button
            type="button"
            className="shortlist-fab"
            data-alert={alert ?? undefined}
            aria-expanded={expanded}
            aria-controls="shortlist-panel"
            onClick={() => setExpanded((open) => !open)}
          >
            <span
              key={alertTick}
              className="shortlist-fab-count"
              data-alert={alert ?? undefined}
              data-empty={railSuppliers.length === 0 || undefined}
            >
              {railSuppliers.length}
            </span>
            <l-icon name={expanded ? "xmark" : "paper-plane"} aria-hidden="true" />
            <span>{expanded ? "Hide shortlist" : "Shortlist & contact"}</span>
          </button>
        </div>
      </div>

      <RegisterGate
        open={shortlistStage === "register"}
        onClose={() => setShortlistStage(null)}
        onContinue={() => setShortlistStage("login")}
      />
      <LoginScreen
        open={shortlistStage === "login"}
        onDismiss={() => setShortlistStage("shortlist")}
      />
      <ShortlistModal
        open={shortlistStage === "shortlist"}
        onClose={() => setShortlistStage(null)}
        supplierCount={railSuppliers.length}
        onSave={saveToShortlist}
      />
      <ContactSupplierModal
        suppliers={contactable}
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        requirements={requirements}
      />
    </>
  );
}

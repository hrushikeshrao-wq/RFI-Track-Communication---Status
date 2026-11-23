"use client";

import { useEffect, useState } from "react";
import { ContactSupplierModal } from "@/components/contact-supplier-modal";
import { EmailThreadScreen } from "@/components/email-thread-screen";
import { RequestsScreen } from "@/components/requests-screen";
import { RfiEmailModal } from "@/components/rfi-email-modal";
import { RfiEmailModalOption2 } from "@/components/rfi-email-modal-option-2";
import { RfiEmailModalOption3 } from "@/components/rfi-email-modal-option-3";
import { RfiEmailModalOption4 } from "@/components/rfi-email-modal-option-4";
import { contactableOnly, SUPPLIERS } from "@/lib/suppliers";
import "./rfi-modal.css";

type Surface = "modal" | "requests" | "email";
type ModalOption = 0 | 1 | 2 | 3 | 4;

const DEMO_SUPPLIERS = contactableOnly(SUPPLIERS).slice(0, 3);

function selectionFromLocation(): { surface: Surface; option: ModalOption } {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("option");
  const option: ModalOption =
    value === "1" ? 1 : value === "2" ? 2 : value === "3" ? 3 : value === "4" ? 4 : 0;
  const surfaceParam = params.get("surface");
  const surface: Surface =
    surfaceParam === "requests" ? "requests" : surfaceParam === "email" ? "email" : "modal";
  return { surface, option };
}

/**
 * Prototype switcher. Modal holds contact options 0–4.
 * Requests holds the buyer account requests screen as Options 0–2.
 * Email holds the buyer email thread as Options 0 and 1.
 * `?option=0` through `?option=4` stay the modal variants.
 * `?surface=requests&option=0` opens the requests screen. Option 1 shortens the status bars. Option 2 uses the circle stepper.
 * `?surface=email&option=0` opens the email thread. Option 1 is a copy of Option 0.
 */
export default function RfiModalPrototypePage() {
  const [surface, setSurface] = useState<Surface | null>(null);
  const [option, setOption] = useState<ModalOption>(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const selection = selectionFromLocation();
    setSurface(selection.surface);
    setOption(selection.option);
  }, []);

  const chooseModal = (next: ModalOption) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("surface");
    url.searchParams.set("option", String(next));
    window.history.replaceState(null, "", url);
    setSurface("modal");
    setOption(next);
    setOpen(true);
  };

  const chooseEmail = (next: 0 | 1) => {
    const url = new URL(window.location.href);
    url.searchParams.set("surface", "email");
    url.searchParams.set("option", String(next));
    window.history.replaceState(null, "", url);
    setSurface("email");
    setOption(next);
    setOpen(true);
  };

  const chooseRequests = (next: 0 | 1 | 2) => {
    const url = new URL(window.location.href);
    url.searchParams.set("surface", "requests");
    url.searchParams.set("option", String(next));
    window.history.replaceState(null, "", url);
    setSurface("requests");
    setOption(next);
    setOpen(true);
  };

  return (
    <main className="rfi-prototype">
      <div className="rfi-option-bar" role="toolbar" aria-label="Prototype options">
        <div className="rfi-option-group" role="group" aria-label="Modal">
          <span className="rfi-option-name">Modal</span>
          {([0, 1, 2, 3, 4] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={surface === "modal" && option === value}
              onClick={() => chooseModal(value)}
            >
              Option {value}
            </button>
          ))}
        </div>
        <span className="rfi-option-split" aria-hidden="true" />
        <div className="rfi-option-group" role="group" aria-label="Requests">
          <span className="rfi-option-name">Requests</span>
          {([0, 1, 2] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={surface === "requests" && option === value}
              onClick={() => chooseRequests(value)}
            >
              Option {value}
            </button>
          ))}
        </div>
        <span className="rfi-option-split" aria-hidden="true" />
        <div className="rfi-option-group" role="group" aria-label="Email">
          <span className="rfi-option-name">Email</span>
          {([0, 1] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={surface === "email" && option === value}
              onClick={() => chooseEmail(value)}
            >
              Option {value}
            </button>
          ))}
        </div>
      </div>

      {surface === null ? null : surface === "requests" ? (
        <RequestsScreen option={option === 1 || option === 2 ? option : 0} />
      ) : surface === "email" ? (
        <EmailThreadScreen option={option === 1 ? 1 : 0} />
      ) : option === 0 ? (
        <ContactSupplierModal
          suppliers={DEMO_SUPPLIERS}
          open={open}
          onClose={() => setOpen(false)}
        />
      ) : option === 1 ? (
        <RfiEmailModal open={open} onClose={() => setOpen(false)} />
      ) : option === 2 ? (
        <RfiEmailModalOption2 open={open} onClose={() => setOpen(false)} />
      ) : option === 3 ? (
        <RfiEmailModalOption3 open={open} onClose={() => setOpen(false)} />
      ) : (
        <RfiEmailModalOption4 open={open} onClose={() => setOpen(false)} />
      )}

      {surface === "modal" && !open ? (
        <button type="button" className="rfi-reopen" onClick={() => setOpen(true)}>
          Reopen modal
        </button>
      ) : null}
    </main>
  );
}

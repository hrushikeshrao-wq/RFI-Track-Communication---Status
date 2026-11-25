"use client";

import { useState } from "react";
import { useSourcing } from "@/components/sourcing-context";
import { SPEC_FACETS, type SpecId } from "@/lib/spec";

/** Left refine rail. Answers write the same spec the results and the RFI read. */
export function SmartFilterRail({ onDone }: { onDone: () => void }) {
  const { spec, setSpec, resetSpec, matchTotal } = useSourcing();
  const [editing, setEditing] = useState<SpecId | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const firstOpen = SPEC_FACETS.find((facet) => !spec[facet.id])?.id ?? null;
  const activeId = editing ?? firstOpen;
  const activeIndex = SPEC_FACETS.findIndex((facet) => facet.id === activeId);

  const choose = (questionId: SpecId, value: string) => {
    setSpec(questionId, value);
    setEditing(null);
  };

  const edit = (questionId: SpecId) => {
    setListOpen(false);
    setEditing(questionId);
  };

  const back = () => {
    const previous = SPEC_FACETS[Math.max(0, activeIndex - 1)];
    if (previous) setEditing(previous.id);
  };

  const reset = () => {
    resetSpec();
    setEditing(null);
    setListOpen(false);
  };

  return (
    <div className="smart-rail">
      <header className="smart-rail-head">
        <span className="smart-rail-badge" aria-hidden="true">
          <l-icon name="sparkles" fill />
        </span>
        <div>
          <h2 className="mar-0">Smart filter your search</h2>
          <p className="mar-0">Find the perfect supplier</p>
        </div>
      </header>

      <div className="smart-rail-body">
        {SPEC_FACETS.map((facet) => {
          const question = { id: facet.id, title: facet.question, help: facet.help, options: facet.options };
          const answer = spec[facet.id];
          const open = question.id === activeId && !listOpen;
          if (answer && !open) {
            return (
              <section className="smart-q" key={question.id}>
                <h3 className="mar-0">{question.title}</h3>
                <div className="smart-answer">
                  <l-icon name="check" aria-hidden="true" />
                  <span>{answer}</span>
                  <button type="button" aria-label={`Edit ${question.title}`} onClick={() => edit(question.id)}>
                    <l-icon name="pen" aria-hidden="true" />
                  </button>
                </div>
              </section>
            );
          }
          if (!open && listOpen) {
            return (
              <section className="smart-q" key={question.id}>
                <h3 className="mar-0">{question.title}</h3>
              </section>
            );
          }
          if (!open) return null;
          return (
            <section className="smart-q" key={question.id}>
              <h3 className="mar-0">{question.title}</h3>
              {question.help && <p className="smart-help mar-0">{question.help}</p>}
              <div className="smart-options" role="radiogroup" aria-label={question.title}>
                {question.options.map((option) => {
                  const selected = answer === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className="smart-option"
                      onClick={() => choose(question.id, option)}
                    >
                      <span className="smart-radio" aria-hidden="true" />
                      {option}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="smart-rail-foot">
        <p className="smart-matched mar-0">{matchTotal.toLocaleString()} Suppliers Matched!</p>
        <div className="smart-rail-actions">
          <button type="button" className="smart-icon-btn" aria-label="Previous question" onClick={back}>
            <l-icon name="angle-left" aria-hidden="true" />
          </button>
          <button type="button" className="smart-reset" onClick={reset}>
            <l-icon name="arrow-rotate-left" aria-hidden="true" /> Reset
          </button>
          <button type="button" className="smart-done" onClick={onDone}>
            I&apos;m Done
          </button>
          <button
            type="button"
            className="smart-icon-btn smart-list"
            aria-label="All questions"
            aria-pressed={listOpen}
            onClick={() => setListOpen((open) => !open)}
          >
            <l-icon name="list-ul" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}

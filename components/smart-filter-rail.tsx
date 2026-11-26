"use client";

import { useEffect, useState } from "react";
import { useSourcing } from "@/components/sourcing-context";
import { SPEC_FACETS, type SpecId } from "@/lib/spec";

/**
 * Left smart-filter rail. Interactions follow the Thomas guided rail:
 * a choice commits and opens the next question, the pencil reopens an
 * answer, the list shows every question, Reset starts over, I'm Done
 * shows the match card, and the chevron closes the rail.
 */
export function SmartFilterRail({ onDone }: { onDone: () => void }) {
  const { spec, setSpec, clearSpec, matchTotal } = useSourcing();
  const firstOpen = SPEC_FACETS.find((facet) => !spec[facet.id])?.id ?? null;
  const allAnswered = firstOpen == null;
  const [editing, setEditing] = useState<SpecId | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [done, setDone] = useState(allAnswered);
  const activeId = done || listOpen ? null : (editing ?? firstOpen);

  useEffect(() => {
    if (allAnswered && !editing && !listOpen) setDone(true);
  }, [allAnswered, editing, listOpen]);

  const choose = (questionId: SpecId, value: string) => {
    setSpec(questionId, value);
    setEditing(null);
    setListOpen(false);
    setDone(false);
  };

  const edit = (questionId: SpecId) => {
    setDone(false);
    setListOpen(false);
    setEditing(questionId);
  };

  const restart = () => {
    clearSpec();
    setEditing(null);
    setListOpen(false);
    setDone(false);
  };

  const finish = () => {
    setEditing(null);
    setListOpen(false);
    setDone(true);
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
        {done ? (
          <section className="smart-done-card">
            <h3 className="mar-0">
              Based on your requirements we&apos;ve matched you to{" "}
              <span>{matchTotal.toLocaleString()}</span> suppliers.
            </h3>
            <p className="mar-0">You can restart your search any time or close Smart Filters below.</p>
            <div className="smart-done-actions">
              <button type="button" onClick={restart}>
                <l-icon name="arrow-rotate-left" aria-hidden="true" /> Restart search
              </button>
              <button type="button" className="smart-done" onClick={onDone}>
                View {matchTotal.toLocaleString()} matched supplier{matchTotal === 1 ? "" : "s"}
              </button>
            </div>
          </section>
        ) : (
          SPEC_FACETS.map((facet) => {
            const answer = spec[facet.id];
            const open = facet.id === activeId;
            if (listOpen) {
              const summary = answer ? answer : facet.id === firstOpen ? "In progress" : "Not answered";
              return (
                <button
                  type="button"
                  className="smart-browse"
                  key={facet.id}
                  onClick={() => edit(facet.id)}
                  aria-label={`Open question: ${facet.question} (${summary})`}
                >
                  <span className="smart-browse-q">{facet.question}</span>
                  <span className={answer ? "smart-browse-a" : "smart-browse-empty"}>
                    {answer ? <l-icon name="check" aria-hidden="true" /> : null}
                    {summary}
                  </span>
                </button>
              );
            }
            if (answer && !open) {
              return (
                <section className="smart-q" key={facet.id}>
                  <h3 className="mar-0">{facet.question}</h3>
                  <div className="smart-answer">
                    <l-icon name="check" aria-hidden="true" />
                    <span>{answer}</span>
                    <button type="button" aria-label={`Change your answer to ${facet.question}`} onClick={() => edit(facet.id)}>
                      <l-icon name="pen" aria-hidden="true" />
                    </button>
                  </div>
                </section>
              );
            }
            if (!open) return null;
            return (
              <section className="smart-q" key={facet.id}>
                <h3 className="mar-0">{facet.question}</h3>
                {facet.help && <p className="smart-help mar-0">{facet.help}</p>}
                <div className="smart-options" role="radiogroup" aria-label={facet.question}>
                  {facet.options.map((option) => {
                    const selected = answer === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className="smart-option"
                        onClick={() => choose(facet.id, option)}
                      >
                        <span className="smart-radio" aria-hidden="true" />
                        {option}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>

      <footer className="smart-rail-foot">
        <p className="smart-matched">{matchTotal.toLocaleString()} Suppliers Matched!</p>
        <div className="smart-rail-actions">
          <button type="button" className="smart-icon-btn" aria-label="Close Smart Filters" title="Close Smart Filters" onClick={onDone}>
            <l-icon name="angle-left" aria-hidden="true" />
          </button>
          <button type="button" className="smart-reset" aria-label="Reset your agent" title="Reset your agent" onClick={restart}>
            <l-icon name="arrow-rotate-left" aria-hidden="true" /> Reset
          </button>
          <button type="button" className="smart-done" aria-label="I'm Done" onClick={finish}>
            I&apos;m Done
          </button>
          <button
            type="button"
            className="smart-icon-btn smart-list"
            aria-label={listOpen ? "Expand questions" : "All questions"}
            title={listOpen ? "Expand questions" : "All questions"}
            aria-pressed={listOpen}
            onClick={() =>
              setListOpen((open) => {
                if (!open) setDone(false);
                return !open;
              })
            }
          >
            <l-icon name="list-ul" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}

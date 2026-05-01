import { useEffect, useLayoutEffect, useState } from "react";
import "./Tutorial.css";

export interface TutorialStep {
  /** CSS selector for the DOM element to highlight. If not found, the tooltip
   * is centered on screen with no cutout. */
  target: string;
  /** Text shown in the tooltip box. */
  text: string;
  /** Optional title for the step. */
  title?: string;
}

export interface TutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 6;
const TOOLTIP_W = 320;
const TOOLTIP_H = 140;
const GAP = 12;

function rectFromEl(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

function tooltipPosition(target: Rect | null): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (!target) {
    return { top: Math.max(20, (vh - TOOLTIP_H) / 2), left: Math.max(20, (vw - TOOLTIP_W) / 2) };
  }
  // Prefer below, then above, then right, then left.
  const below = target.top + target.height + GAP;
  if (below + TOOLTIP_H < vh - 10) {
    const left = Math.min(Math.max(10, target.left), vw - TOOLTIP_W - 10);
    return { top: below, left };
  }
  const above = target.top - GAP - TOOLTIP_H;
  if (above > 10) {
    const left = Math.min(Math.max(10, target.left), vw - TOOLTIP_W - 10);
    return { top: above, left };
  }
  const right = target.left + target.width + GAP;
  if (right + TOOLTIP_W < vw - 10) {
    return { top: Math.min(Math.max(10, target.top), vh - TOOLTIP_H - 10), left: right };
  }
  const leftSide = target.left - GAP - TOOLTIP_W;
  if (leftSide > 10) {
    return { top: Math.min(Math.max(10, target.top), vh - TOOLTIP_H - 10), left: leftSide };
  }
  return { top: Math.max(20, (vh - TOOLTIP_H) / 2), left: Math.max(20, (vw - TOOLTIP_W) / 2) };
}

export function Tutorial({ steps, onComplete, onSkip }: TutorialProps): JSX.Element | null {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tick, setTick] = useState(0);

  const step = steps[index];

  useLayoutEffect(() => {
    if (!step) return;
    const find = () => {
      try {
        const el = document.querySelector(step.target);
        setRect(el ? rectFromEl(el) : null);
      } catch {
        setRect(null);
      }
    };
    find();
    const onResize = () => setTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [step, tick]);

  useEffect(() => {
    if (!step) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (onSkip) onSkip();
        else onComplete();
      } else if (e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        if (index >= steps.length - 1) onComplete();
        else setIndex((i) => i + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, index, steps.length, onComplete, onSkip]);

  if (!step) return null;

  const tip = tooltipPosition(rect);
  const isLast = index >= steps.length - 1;

  return (
    <div className="tutorial-root" role="dialog" aria-modal="true" aria-label="Tutorial">
      <svg className="tutorial-backdrop" data-testid="tutorial-backdrop" aria-hidden="true">
        <defs>
          <mask id="tutorial-cutout">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx="8"
                ry="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.62)" mask="url(#tutorial-cutout)" />
      </svg>
      {rect && (
        <div
          className="tutorial-highlight"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          aria-hidden="true"
        />
      )}
      <div
        className="tutorial-tooltip"
        data-testid="tutorial-tooltip"
        style={{ top: tip.top, left: tip.left, width: TOOLTIP_W }}
      >
        <div className="tutorial-tooltip-head">
          <span className="tutorial-step-counter">
            {index + 1} / {steps.length}
          </span>
          {step.title && <h3 className="tutorial-tooltip-title">{step.title}</h3>}
        </div>
        <p className="tutorial-tooltip-text">{step.text}</p>
        <div className="tutorial-tooltip-actions">
          <button
            type="button"
            className="tutorial-btn tutorial-btn-ghost"
            onClick={() => (onSkip ? onSkip() : onComplete())}
          >
            Skip
          </button>
          {index > 0 && (
            <button
              type="button"
              className="tutorial-btn tutorial-btn-ghost"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="tutorial-btn tutorial-btn-primary"
            onClick={() => {
              if (isLast) onComplete();
              else setIndex((i) => i + 1);
            }}
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;

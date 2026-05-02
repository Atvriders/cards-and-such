import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFocusTrap } from "./useFocusTrap.js";
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

// --------------------------------------------------------------------------
// Welcome carousel — first-run onboarding overlay
// --------------------------------------------------------------------------

export interface WelcomeStep {
  /** Heading shown at the top of the card. */
  title: string;
  /** One-sentence body description. */
  body: string;
  /** Inline SVG illustrating the step. */
  icon: JSX.Element;
}

export interface WelcomeTutorialProps {
  /** Called when the user completes the carousel (Got it on the last step). */
  onComplete: () => void;
  /** Called when the user skips the carousel (Esc, Skip button, or backdrop on later steps). */
  onSkip: () => void;
  /** Override the default step list. Test/storybook-friendly. */
  steps?: WelcomeStep[];
}

const ICON_WELCOME = (
  <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="tut-grad-1" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="var(--accent, #60a5fa)" />
        <stop offset="100%" stopColor="var(--accent-strong, #3b82f6)" />
      </linearGradient>
    </defs>
    <rect x="10" y="14" width="26" height="38" rx="4" transform="rotate(-12 23 33)" fill="url(#tut-grad-1)" stroke="currentColor" strokeWidth="1.5" />
    <rect x="22" y="12" width="26" height="38" rx="4" transform="rotate(6 35 31)" fill="var(--surface, #1b2230)" stroke="currentColor" strokeWidth="1.5" />
    <text x="38" y="36" fontSize="14" fontWeight="700" fill="currentColor" textAnchor="middle" transform="rotate(6 35 31)">A</text>
  </svg>
);

const ICON_PICK = (
  <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <rect x="6" y="10" width="22" height="22" rx="3" fill="var(--surface, #1b2230)" stroke="currentColor" strokeWidth="1.5" />
    <rect x="36" y="10" width="22" height="22" rx="3" fill="var(--accent, #60a5fa)" stroke="currentColor" strokeWidth="1.5" opacity="0.85" />
    <rect x="6" y="36" width="22" height="22" rx="3" fill="var(--surface, #1b2230)" stroke="currentColor" strokeWidth="1.5" />
    <rect x="36" y="36" width="22" height="22" rx="3" fill="var(--surface, #1b2230)" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="47" cy="21" r="3" fill="var(--bg, #0b1020)" />
  </svg>
);

const ICON_PLAY = (
  <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <circle cx="32" cy="32" r="24" fill="var(--accent, #60a5fa)" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="26,22 26,42 44,32" fill="var(--accent, #60a5fa)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const ICON_STATS = (
  <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <line x1="8" y1="54" x2="56" y2="54" stroke="currentColor" strokeWidth="1.5" />
    <rect x="12" y="36" width="8" height="18" rx="2" fill="var(--surface, #1b2230)" stroke="currentColor" strokeWidth="1.5" />
    <rect x="24" y="24" width="8" height="30" rx="2" fill="var(--accent, #60a5fa)" stroke="currentColor" strokeWidth="1.5" />
    <rect x="36" y="14" width="8" height="40" rx="2" fill="var(--surface, #1b2230)" stroke="currentColor" strokeWidth="1.5" />
    <rect x="48" y="30" width="8" height="24" rx="2" fill="var(--accent-strong, #3b82f6)" stroke="currentColor" strokeWidth="1.5" />
    <polyline points="14,40 28,28 40,18 52,32" fill="none" stroke="var(--accent, #60a5fa)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.0" />
  </svg>
);

export const DEFAULT_WELCOME_STEPS: WelcomeStep[] = [
  {
    title: "Welcome to Cards & Such",
    body: "A free, browser-based table of card, dice, board, and arcade games — no install required.",
    icon: ICON_WELCOME,
  },
  {
    title: "Pick a game",
    body: "Browse the lobby or jump into a category from the header to find something that fits your mood.",
    icon: ICON_PICK,
  },
  {
    title: "Play",
    body: "Every game ships with hints, undo, keyboard shortcuts, and a contextual How-to-play panel.",
    icon: ICON_PLAY,
  },
  {
    title: "Track stats",
    body: "Your wins, streaks, and best times are saved to this device — peek at the Stats page any time.",
    icon: ICON_STATS,
  },
];

export function WelcomeTutorial({
  onComplete,
  onSkip,
  steps = DEFAULT_WELCOME_STEPS,
}: WelcomeTutorialProps): JSX.Element | null {
  const [index, setIndex] = useState(0);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(cardRef, true);

  const total = steps.length;
  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const advance = (): void => {
    if (isLast) onComplete();
    else setIndex((i) => Math.min(total - 1, i + 1));
  };
  const back = (): void => setIndex((i) => Math.max(0, i - 1));

  // Esc skips, Enter advances. Confirm dialog has its own handlers (see below).
  useEffect(() => {
    if (confirmSkip) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      } else if (e.key === "Enter") {
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (!isLast) setIndex((i) => i + 1);
        else advance();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // advance/back are stable closures over `index`; effect re-binds when index changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total, confirmSkip, onSkip]);

  if (!step) return null;

  // Backdrop click: step 1 prompts "Skip tutorial?", later steps just close.
  const onBackdropClick = (): void => {
    if (isFirst) setConfirmSkip(true);
    else onSkip();
  };

  return (
    <div className="tut-welcome-root" role="presentation">
      <div
        className="tut-welcome-backdrop"
        data-testid="tut-backdrop"
        onClick={onBackdropClick}
        aria-hidden="true"
      />
      <div
        ref={cardRef}
        className="tut-welcome-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tut-welcome-title"
        data-testid={`tut-step-${index + 1}`}
        tabIndex={-1}
      >
        <div className="tut-welcome-illu" aria-hidden="true">
          {step.icon}
        </div>
        <h2 id="tut-welcome-title" className="tut-welcome-title">
          {step.title}
        </h2>
        <p className="tut-welcome-body">{step.body}</p>

        <div className="tut-welcome-dots" role="tablist" aria-label="Tutorial steps">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to step ${i + 1}`}
              className={`tut-welcome-dot${i === index ? " is-active" : ""}`}
              data-testid={`tut-dot-${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        <div className="tut-welcome-actions">
          <button
            type="button"
            className="tut-welcome-btn tut-welcome-btn-ghost"
            data-testid="tut-skip"
            onClick={() => onSkip()}
          >
            Skip
          </button>
          <span className="tut-welcome-actions-spacer" />
          <button
            type="button"
            className="tut-welcome-btn tut-welcome-btn-ghost"
            data-testid="tut-back"
            onClick={back}
            disabled={isFirst}
          >
            Back
          </button>
          <button
            type="button"
            className="tut-welcome-btn tut-welcome-btn-primary"
            data-testid="tut-next"
            onClick={advance}
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>

      {confirmSkip && (
        <div
          className="tut-welcome-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tut-confirm-title"
          data-testid="tut-confirm"
        >
          <div className="tut-welcome-confirm-card">
            <h3 id="tut-confirm-title">Skip tutorial?</h3>
            <p>You can re-open it later from Settings → Gameplay.</p>
            <div className="tut-welcome-confirm-actions">
              <button
                type="button"
                className="tut-welcome-btn tut-welcome-btn-ghost"
                data-testid="tut-confirm-cancel"
                onClick={() => setConfirmSkip(false)}
              >
                Keep going
              </button>
              <button
                type="button"
                className="tut-welcome-btn tut-welcome-btn-primary"
                data-testid="tut-confirm-skip"
                onClick={() => onSkip()}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tutorial;

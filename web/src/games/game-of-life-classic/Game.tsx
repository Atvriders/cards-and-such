import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClassicState, ClassicAction, ClassicSettings } from "./state.js";
import { isTerminal, score, BOARD } from "./state.js";
import "./Game.css";

const KIND_ICON: Record<string, string> = {
  start: "S",
  job: "J",
  promotion: "P",
  payday: "$",
  marry: "M",
  baby: "B",
  expense: "-",
  vacation: "V",
  lottery: "L",
  taxes: "T",
  retire: "R",
};

const STAGE_LABEL: Record<string, string> = {
  early: "Early Career",
  mid: "Mid Career",
  late: "Late Career",
  retired: "Retired",
};

export function GameOfLifeClassicGame({ state, dispatch, onGameOver }: GameProps<ClassicState, ClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase === "spinning" && (e.key === "s" || e.key === "S" || e.key === " ")) {
        e.preventDefault(); onSpin();
      } else if (state.phase === "resolved" && (e.key === "n" || e.key === "N" || e.key === "Enter")) {
        e.preventDefault(); dispatch({ type: "next" } as ClassicAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // onSpin is intentionally referenced via closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.phase]);

  const [spinning, setSpinning] = useState(false);
  const [spinDisplay, setSpinDisplay] = useState<number>(state.lastSpin ?? 1);
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  function onSpin(): void {
    if (spinning || state.phase !== "spinning") return;
    setSpinning(true);
    const rollDur = 700;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / rollDur);
      // Slow as it goes
      const interval = 50 + t * 100;
      const elapsed = now - start;
      // Random tumble values
      setSpinDisplay(1 + Math.floor(Math.random() * 10));
      if (t < 1) {
        // schedule next based on interval
        raf = window.setTimeout(() => requestAnimationFrame(tick), interval) as unknown as number;
      } else {
        // Resolve real spin via reducer
        dispatchRef.current({ type: "spin" } as ClassicAction);
        setSpinning(false);
      }
      void elapsed;
    };
    raf = window.setTimeout(() => requestAnimationFrame(tick), 0) as unknown as number;
    void raf;
  }

  // When state.lastSpin updates, snap display to actual value
  useEffect(() => {
    if (state.lastSpin != null) setSpinDisplay(state.lastSpin);
  }, [state.lastSpin]);

  const sq = BOARD[state.lastSquare]!;

  return (
    <div className="golclassic-wrap">
      {/* HUD */}
      <div className="golclassic-hud">
        <div className="golclassic-stat">
          <span className="golclassic-stat-label">Turn</span>
          <span className="golclassic-stat-value">{state.turn}</span>
        </div>
        <div className="golclassic-stat golclassic-stat-cash">
          <span className="golclassic-stat-label">Cash</span>
          <span className="golclassic-stat-value">${state.cash}</span>
        </div>
        <div className="golclassic-stat">
          <span className="golclassic-stat-label">Family</span>
          <span className="golclassic-stat-value">{state.family}</span>
        </div>
        <div className="golclassic-stat">
          <span className="golclassic-stat-label">Income</span>
          <span className="golclassic-stat-value">${state.jobIncome}</span>
        </div>
        <div className="golclassic-stat golclassic-stat-stage">
          <span className="golclassic-stat-label">Stage</span>
          <span className="golclassic-stat-value">{STAGE_LABEL[state.stage]}</span>
        </div>
      </div>

      {/* Snake board */}
      <div className="golclassic-board" role="grid" aria-label="Life path">
        {BOARD.map((s, i) => {
          const row = Math.floor(i / 10);
          const isReverse = row % 2 === 1;
          const colInRow = isReverse ? 9 - (i % 10) : i % 10;
          const here = i === state.pos;
          const passed = i < state.pos;
          return (
            <div
              key={i}
              className={`golclassic-cell golclassic-${s.kind}${here ? " golclassic-here" : ""}${passed ? " golclassic-passed" : ""}`}
              style={{ gridColumn: colInRow + 1, gridRow: row + 1 }}
              title={`${i + 1}. ${s.label}`}
            >
              <span className="golclassic-cell-icon" aria-hidden="true">{KIND_ICON[s.kind] ?? ""}</span>
              <span className="golclassic-cell-num">{i + 1}</span>
              <span className="golclassic-cell-label">{s.label}</span>
              {here && <span className="golclassic-token" aria-label="your token">P</span>}
            </div>
          );
        })}
      </div>

      {/* Spinner + action area */}
      <div className="golclassic-action">
        <div className={`golclassic-spinner${spinning ? " golclassic-spinner-rolling" : ""}`} aria-live="polite">
          <div className="golclassic-spinner-ring" aria-hidden="true" />
          <div className="golclassic-spinner-num">{spinDisplay}</div>
          <div className="golclassic-spinner-label">{spinning ? "spinning..." : state.lastSpin ? "you spun" : "spin"}</div>
        </div>
        <div className="golclassic-action-buttons">
          {state.phase === "spinning" && (
            <button
              type="button"
              className="golclassic-btn golclassic-btn-spin"
              aria-label="Spin spinner (S)"
              onClick={onSpin}
              disabled={spinning}
            >
              {spinning ? "Spinning..." : "Spin (1-10)"}
            </button>
          )}
          {state.phase === "resolved" && (
            <div className="golclassic-event">
              <div className="golclassic-event-title">
                Square {state.lastSquare + 1}: <b>{sq.label}</b>
              </div>
              <div className="golclassic-event-body">
                {state.log[0] && (
                  <>
                    <span className={state.log[0].cashDelta >= 0 ? "golclassic-pos" : "golclassic-neg"}>
                      {state.log[0].cashDelta >= 0 ? "+" : ""}${state.log[0].cashDelta}
                    </span>
                    {state.log[0].familyDelta > 0 && (
                      <span className="golclassic-pos"> +{state.log[0].familyDelta} family</span>
                    )}
                  </>
                )}
              </div>
              <button
                type="button"
                className="golclassic-btn golclassic-btn-next"
                aria-label="Next turn (N)"
                onClick={() => dispatch({ type: "next" } as ClassicAction)}
              >
                Next Turn &rarr;
              </button>
            </div>
          )}
          {state.phase === "done" && (
            <div className="golclassic-done">
              <div className="golclassic-done-title">Retired!</div>
              <div className="golclassic-done-line">Cash: <b>${state.cash}</b></div>
              <div className="golclassic-done-line">Family: <b>{state.family}</b></div>
              <div className="golclassic-done-line">Stage bonus: <b>+200</b></div>
              <div className="golclassic-done-score">Life Score: {score(state)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Event log */}
      <div className="golclassic-log">
        <div className="golclassic-log-title">Life Events</div>
        {state.log.length === 0 ? (
          <div className="golclassic-log-empty">No events yet — spin to begin your life.</div>
        ) : (
          <ol className="golclassic-log-list">
            {state.log.map((e, i) => (
              <li key={state.log.length - i} className="golclassic-log-row">
                <span className="golclassic-log-turn">T{e.turn}</span>
                <span className="golclassic-log-spin">[{e.spin}]</span>
                <span className="golclassic-log-label">{e.label}</span>
                <span className={`golclassic-log-delta ${e.cashDelta >= 0 ? "golclassic-pos" : "golclassic-neg"}`}>
                  {e.cashDelta >= 0 ? "+" : ""}${e.cashDelta}
                </span>
                {e.familyDelta > 0 && <span className="golclassic-log-fam">+{e.familyDelta} fam</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

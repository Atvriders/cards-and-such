import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Lotto90State, Lotto90Settings } from "./state.js";
import { isTerminal, isLineBingo, isFullHouse, getLineIndices } from "./state.js";
import "./Lotto90.css";

const LINE_LABELS = [
  "Row 1","Row 2","Row 3","Row 4","Row 5",
  "Col 1","Col 2","Col 3","Col 4","Col 5",
  "Diag \\","Diag /",
];

export function Lotto90({
  state,
  dispatch,
  onGameOver,
}: GameProps<Lotto90State, Lotto90Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const cardSet = new Set(state.card);
  const lastIdx = state.lastDrawn !== null ? state.card.indexOf(state.lastDrawn) : -1;

  return (
    <div className="lotto90">
      {state.lastDrawn !== null ? (
        <div className="lotto90-ball">{state.lastDrawn}</div>
      ) : (
        <div className="lotto90-ball empty">?</div>
      )}

      <div className="lotto90-info">
        {state.drawn.length} / 90 numbers drawn
      </div>

      <div className="lotto90-card">
        {state.card.map((num, i) => {
          let cls = "lotto90-cell";
          if (state.marked[i]) cls += i === lastIdx ? " new-hit" : " hit";
          return (
            <div key={i} className={cls}>{num}</div>
          );
        })}
      </div>

      {state.fullHouse ? (
        <div className="lotto90-fullhouse">FULL HOUSE! 🎉</div>
      ) : null}

      <div className="lotto90-score">Score: {state.score}</div>

      {/* Line claim buttons */}
      <div className="lotto90-lines">
        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Claim lines:</div>
        <div className="lotto90-line-row">
          {LINE_LABELS.map((label, i) => {
            const ready = isLineBingo(state.marked, i) && !state.claimedLines[i];
            const claimed = state.claimedLines[i];
            let cls = "lotto90-line-btn";
            if (claimed) cls += " claimed";
            else if (ready) cls += " ready";
            return (
              <button
                key={i}
                className={cls}
                onClick={() => dispatch({ type: "claim_line", lineIndex: i })}
                disabled={!ready}
              >
                {label}{claimed ? " ✓" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {state.phase === "done" ? (
        <div className="lotto90-done">
          Game over! Final score: {state.score + (state.fullHouse ? 200 : 0)}
          {state.fullHouse ? " (incl. 200 full house bonus)" : ""}
        </div>
      ) : (
        <button
          className="lotto90-draw-btn"
          onClick={() => dispatch({ type: "draw" })}
        >
          Draw Number
        </button>
      )}

      {state.drawn.length > 0 && (
        <div className="lotto90-recent">
          {state.drawn.slice(-20).map((n, i) => (
            <span key={i} className={`lotto90-drawn-num${cardSet.has(n) ? " on-card" : ""}`}>{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}

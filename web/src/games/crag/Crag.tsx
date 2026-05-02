import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CragState, CragSettings, CragAction, CragCategory } from "./state.js";
import { isTerminal, scoreCategory, CRAG_CATEGORIES, CATEGORY_LABELS } from "./state.js";
import "./Crag.css";

const FACE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function Crag({
  state,
  dispatch,
  onGameOver,
}: GameProps<CragState, CragSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, dice, keptMask, rollsLeft, scores, totalScore, turnsLeft } = state;
  const canRoll = (phase === "preRoll" || phase === "rolled") && rollsLeft > 0;

  return (
    <div className="crag">
      <div className="crag-header">Crag — Turns left: {turnsLeft} | Total: {totalScore}</div>

      <div className="crag-dice">
        {dice.map((v, i) => (
          <div
            key={i}
            className={`crag-die${keptMask[i] ? " kept" : ""}`}
            onClick={() => phase === "rolled" && dispatch({ type: "toggleKeep", index: i } as CragAction)}
            role="button"
            aria-label={`Die ${v}${keptMask[i] ? " kept" : ""}`}
          >
            {FACE[v]}
          </div>
        ))}
      </div>

      <div className="crag-controls">
        {canRoll && (
          <button data-testid="hint-target-crag-roll" onClick={() => dispatch({ type: "roll" } as CragAction)}>
            Roll ({rollsLeft} left)
          </button>
        )}
      </div>

      {phase === "rolled" && (
        <div style={{ fontSize: "0.85rem", color: "#666" }}>Click dice to keep; click a category below to score.</div>
      )}

      {terminal && (
        <div className="crag-message">Game over! Final score: {totalScore}</div>
      )}

      <table className="crag-scorecard">
        <thead>
          <tr>
            <th>Category</th>
            <th>Score</th>
            <th>Potential</th>
          </tr>
        </thead>
        <tbody>
          {CRAG_CATEGORIES.map((cat: CragCategory) => {
            const scored = scores[cat] !== undefined;
            const potential = phase === "rolled" ? scoreCategory(dice, cat) : null;
            return (
              <tr
                key={cat}
                data-testid={`hint-target-crag-cat-${cat}`}
                className={`cat-row${scored ? " scored" : ""}`}
                onClick={() => {
                  if (!scored && phase === "rolled") {
                    dispatch({ type: "score", category: cat } as CragAction);
                  }
                }}
              >
                <td>{CATEGORY_LABELS[cat]}</td>
                <td>{scored ? scores[cat] : "—"}</td>
                <td style={{ color: "#888" }}>
                  {!scored && potential !== null ? potential : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

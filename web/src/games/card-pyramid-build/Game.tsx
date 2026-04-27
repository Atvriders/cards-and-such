import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPyramidBuildState, CardPyramidBuildAction, CardPyramidBuildSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";

const ROWS = [[0], [1,2], [3,4,5], [6,7,8,9]];

export function CardPyramidBuildGame({ state, dispatch, onGameOver }: GameProps<CardPyramidBuildState, CardPyramidBuildSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cpb-wrap"><div className="cpb-done"><h2>Pyramid Built!</h2><div className="cpb-final">{state.score} pts</div></div></div>;
  }
  const next = state.hand[0];
  return (
    <div className="cpb-wrap">
      <div className="cpb-info">Card {state.current + 1} / {TOTAL_CARDS}</div>
      <div className="cpb-score">{state.score} pts</div>
      <div className="cpb-pyramid">
        {ROWS.map((row, ri) => (
          <div key={ri} className="cpb-row">
            {row.map(slot => {
              const card = state.pyramid[slot];
              if (card === null || card === undefined) {
                const isCurrent = slot === state.current;
                return <button key={slot} className={`cpb-slot ${isCurrent ? "active" : ""}`} disabled={!isCurrent} onClick={() => dispatch({ type:"place", slot } as CardPyramidBuildAction)}>{isCurrent ? "Place" : "—"}</button>;
              }
              const c = card as number;
              return <div key={slot} className={`cpb-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>;
            })}
          </div>
        ))}
      </div>
      {next !== undefined && (
        <div className="cpb-next">
          <span>Next:</span>
          <div className={`cpb-card ${isRed(next) ? "red" : "black"}`}>{cardName(next)}</div>
          <button className="cpb-btn alt" onClick={() => dispatch({ type:"skip" } as CardPyramidBuildAction)}>Skip</button>
        </div>
      )}
    </div>
  );
}

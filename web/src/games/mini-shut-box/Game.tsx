import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniShutBoxState, MiniShutBoxAction, MiniShutBoxSettings } from "./state.js";
import { isTerminal, selectionSum } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

export function MiniShutBoxGame({ state, dispatch, onGameOver }: GameProps<MiniShutBoxState, MiniShutBoxSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const remaining = state.open.map((o, i) => o ? i + 1 : 0).filter(Boolean);
    return (
      <div className="shutbox-wrap">
        <div className={`shutbox-done ${state.perfect ? "perfect" : "regular"}`}>
          <h2>{state.perfect ? "Box SHUT!" : "Game Over"}</h2>
          <div className="shutbox-final">{state.score}</div>
          <div className="shutbox-final-label">points</div>
          {!state.perfect && remaining.length > 0 && (
            <div className="shutbox-meta">Left open: {remaining.join(", ")}</div>
          )}
        </div>
      </div>
    );
  }

  const selSum = selectionSum(state.selected);
  const closedCount = state.open.filter((o) => !o).length;
  const remainingSum = state.open.reduce((s, o, i) => o ? s + (i + 1) : s, 0);

  return (
    <div className="shutbox-wrap">
      <header className="shutbox-header">
        <div className="shutbox-stat">
          <span className="shutbox-stat-label">Tiles closed</span>
          <span className="shutbox-stat-value">{closedCount}/9</span>
        </div>
        <div className="shutbox-stat">
          <span className="shutbox-stat-label">Open sum</span>
          <span className="shutbox-stat-value">{remainingSum}</span>
        </div>
        <div className="shutbox-stat shutbox-stat-target">
          <span className="shutbox-stat-label">Target this roll</span>
          <span className="shutbox-stat-value">{state.dice ? state.sum : "—"}</span>
        </div>
      </header>

      <div className="shutbox-tiles">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const closed = !state.open[i];
          const sel = state.selected.includes(i);
          return (
            <button
              key={i}
              className={`shutbox-tile ${closed ? "closed" : ""} ${sel ? "selected" : ""}`}
              disabled={closed || state.phase !== "selecting"}
              onClick={() => dispatch({ type: "toggle", idx: i } as MiniShutBoxAction)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="shutbox-arena">
        {state.dice ? (
          <div className="shutbox-roll">
            <Die value={state.dice[0]} />
            <Die value={state.dice[1]} />
            <span className="shutbox-roll-eq">= {state.sum}</span>
          </div>
        ) : (
          <div className="shutbox-roll-placeholder">Roll two dice</div>
        )}
      </div>

      {state.phase === "selecting" && (
        <div className={`shutbox-selstatus ${selSum === state.sum ? "match" : ""}`}>
          Selected sum: <b>{selSum}</b> / target <b>{state.sum}</b>
        </div>
      )}

      <div className="shutbox-controls">
        {state.phase === "rolling" && (
          <button className="shutbox-btn shutbox-btn-primary" onClick={() => dispatch({ type: "roll" } as MiniShutBoxAction)}>
            Roll Dice
          </button>
        )}
        {state.phase === "selecting" && (
          <>
            <button
              className="shutbox-btn shutbox-btn-primary"
              disabled={selSum !== state.sum}
              onClick={() => dispatch({ type: "submit" } as MiniShutBoxAction)}
            >
              Shut Tiles
            </button>
            <button
              className="shutbox-btn shutbox-btn-danger"
              onClick={() => dispatch({ type: "endgame" } as MiniShutBoxAction)}
            >
              End Game
            </button>
          </>
        )}
      </div>

      <footer className="shutbox-help">
        <span>Sum tiles to dice total</span>
        <span>Lock tiles by clicking</span>
        <span>Shut all 9 = 100 pts</span>
      </footer>
    </div>
  );
}

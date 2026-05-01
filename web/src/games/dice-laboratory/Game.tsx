import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceLaboratoryState, DiceLaboratoryAction, DiceLaboratorySettings } from "./state.js";
import { isTerminal, ROUNDS } from "./state.js";
import "./Game.css";

export function DiceLaboratoryGame({ state, dispatch, onGameOver }: GameProps<DiceLaboratoryState, DiceLaboratorySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="lb-wrap">
        <div className="lb-done">
          <h2>Experiment Complete</h2>
          <div className="lb-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lb-wrap">
      <div className="lb-banner">Round {state.round} / {ROUNDS} · Score {state.score}</div>
      <div className="lb-formula">
        <div className="lb-formula-label">Target Formula</div>
        <div className="lb-formula-dice">
          {state.formula.map((f, i) => <div key={i} className="lb-die target">{f}</div>)}
        </div>
      </div>
      {state.rolls.length > 0 && (
        <div className="lb-mix">
          <div className="lb-formula-label">Your Mix</div>
          <div className="lb-formula-dice">
            {state.rolls.map((r, i) => {
              const matched = state.formula.includes(r);
              return <div key={i} className={`lb-die${matched ? " hit" : ""}`}>{r}</div>;
            })}
          </div>
        </div>
      )}
      <div className="lb-log">{state.log || "Mix three dice. Match the target formula for points."}</div>
      {state.phase === "roll" && (
        <button className="lb-btn" onClick={() => dispatch({ type: "mix" } as DiceLaboratoryAction)}>Mix</button>
      )}
      {state.phase === "result" && (
        <button className="lb-btn alt" onClick={() => dispatch({ type: "next" } as DiceLaboratoryAction)}>Next Experiment</button>
      )}
    </div>
  );
}

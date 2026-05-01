import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ForTheCrownSagaState, ForTheCrownSagaAction, ForTheCrownSagaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function ForTheCrownSagaGame({ state, dispatch, onGameOver }: GameProps<ForTheCrownSagaState, ForTheCrownSagaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ftc-wrap"><div className="ftc-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#fbbf24" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="ftc-wrap">
      <div className="ftc-header">
        <span className="ftc-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="ftc-score">{state.score} pts</span>
      </div>
      <div className="ftc-prompt">{p.prompt}</div>
      <div className="ftc-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`ftc-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as ForTheCrownSagaAction)}>
            <span className="ftc-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="ftc-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="ftc-actions">
        {isResult && <button className="ftc-btn next" onClick={() => dispatch({ type:"next" } as ForTheCrownSagaAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}

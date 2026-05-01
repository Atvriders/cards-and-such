import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ForTheQueenSagaState, ForTheQueenSagaAction, ForTheQueenSagaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function ForTheQueenSagaGame({ state, dispatch, onGameOver }: GameProps<ForTheQueenSagaState, ForTheQueenSagaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ftq-wrap"><div className="ftq-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#8e44ad" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="ftq-wrap">
      <div className="ftq-header">
        <span className="ftq-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="ftq-score">{state.score} pts</span>
      </div>
      <div className="ftq-prompt">{p.prompt}</div>
      <div className="ftq-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`ftq-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as ForTheQueenSagaAction)}>
            <span className="ftq-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="ftq-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="ftq-actions">
        {isResult && <button className="ftq-btn next" onClick={() => dispatch({ type:"next" } as ForTheQueenSagaAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SunderedIslesSagaState, SunderedIslesSagaAction, SunderedIslesSagaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function SunderedIslesSagaGame({ state, dispatch, onGameOver }: GameProps<SunderedIslesSagaState, SunderedIslesSagaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="sis-wrap"><div className="sis-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#fbbf24" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="sis-wrap">
      <div className="sis-header">
        <span className="sis-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="sis-score">{state.score} pts</span>
      </div>
      <div className="sis-prompt">{p.prompt}</div>
      <div className="sis-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`sis-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as SunderedIslesSagaAction)}>
            <span className="sis-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="sis-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="sis-actions">
        {isResult && <button className="sis-btn next" onClick={() => dispatch({ type:"next" } as SunderedIslesSagaAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}

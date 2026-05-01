import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AloneAmongStarsCardState, AloneAmongStarsCardAction, AloneAmongStarsCardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function AloneAmongStarsCardGame({ state, dispatch, onGameOver }: GameProps<AloneAmongStarsCardState, AloneAmongStarsCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="aasc-wrap"><div className="aasc-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#34d399" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="aasc-wrap">
      <div className="aasc-header">
        <span className="aasc-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="aasc-score">{state.score} pts</span>
      </div>
      <div className="aasc-prompt">{p.prompt}</div>
      <div className="aasc-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`aasc-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as AloneAmongStarsCardAction)}>
            <span className="aasc-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="aasc-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="aasc-actions">
        {isResult && <button className="aasc-btn next" onClick={() => dispatch({ type:"next" } as AloneAmongStarsCardAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AloneAmongStarsTaleState, AloneAmongStarsTaleAction, AloneAmongStarsTaleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function AloneAmongStarsTaleGame({ state, dispatch, onGameOver }: GameProps<AloneAmongStarsTaleState, AloneAmongStarsTaleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="aast-wrap"><div className="aast-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#a78bfa" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="aast-wrap">
      <div className="aast-header">
        <span className="aast-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="aast-score">{state.score} pts</span>
      </div>
      <div className="aast-prompt">{p.prompt}</div>
      <div className="aast-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`aast-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as AloneAmongStarsTaleAction)}>
            <span className="aast-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="aast-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="aast-actions">
        {isResult && <button className="aast-btn next" onClick={() => dispatch({ type:"next" } as AloneAmongStarsTaleAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}

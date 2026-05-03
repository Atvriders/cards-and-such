import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WretchedMagusState, WretchedMagusAction, WretchedMagusSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function WretchedMagusGame({ state, dispatch, onGameOver }: GameProps<WretchedMagusState, WretchedMagusSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="wrm-wrap"><div className="wrm-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#dc2626" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="wrm-wrap">
      <div className="wrm-header">
        <span className="wrm-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="wrm-score">{state.score} pts</span>
      </div>
      <div className="wrm-prompt">{p.prompt}</div>
      <div className="wrm-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-wretched-magus-primary":undefined} key={i} className={`wrm-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as WretchedMagusAction)}>
            <span className="wrm-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="wrm-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="wrm-actions">
        {isResult && <button className="wrm-btn next" onClick={() => dispatch({ type:"next" } as WretchedMagusAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}

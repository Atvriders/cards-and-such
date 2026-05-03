import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DungeonHeroCardsState, DungeonHeroCardsAction, DungeonHeroCardsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function DungeonHeroCardsGame({ state, dispatch, onGameOver }: GameProps<DungeonHeroCardsState, DungeonHeroCardsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dhc-wrap"><div className="dhc-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#ea580c" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="dhc-wrap">
      <div className="dhc-header">
        <span className="dhc-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="dhc-score">{state.score} pts</span>
      </div>
      <div className="dhc-prompt">{p.prompt}</div>
      <div className="dhc-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-dungeon-hero-cards-primary":undefined} key={i} className={`dhc-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as DungeonHeroCardsAction)}>
            <span className="dhc-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="dhc-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="dhc-actions">
        {isResult && <button className="dhc-btn next" onClick={() => dispatch({ type:"next" } as DungeonHeroCardsAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}

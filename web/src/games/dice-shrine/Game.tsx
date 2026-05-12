import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceShrineState, DiceShrineAction, DiceShrineSettings } from "./state.js";
import { isTerminal, ROUNDS } from "./state.js";
import "./Game.css";

const GLYPH = { sun: "*", moon: "(", river: "~" } as const;

export function DiceShrineGame({ state, dispatch, onGameOver }: GameProps<DiceShrineState, DiceShrineSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="sh-wrap">
        <div className="sh-done bounce-in">
          <h2>The Gods Are Pleased</h2>
          <div className="sh-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sh-wrap fade-in">
      <div className="sh-banner">Round {state.round} / {ROUNDS} · Score {state.score}</div>
      <div className={`sh-altar ${state.god}`}>
        <div className="sh-glyph">{GLYPH[state.god]}</div>
        <div className="sh-god">{state.god.toUpperCase()}</div>
      </div>
      {state.rolls && (
        <div className="sh-row">
          {state.rolls.map((r, i) => <div key={i} className="sh-die">{r}</div>)}
        </div>
      )}
      <div className="sh-log">{state.log || "Roll three offerings to the deity."}</div>
      {state.phase === "roll" && (
        <button data-testid="hint-target-dice-shrine-roll" className="sh-btn" onClick={() => dispatch({ type: "offer" } as DiceShrineAction)}>Offer</button>
      )}
      {state.phase === "result" && (
        <button className="sh-btn alt" onClick={() => dispatch({ type: "next" } as DiceShrineAction)}>Next</button>
      )}
    </div>
  );
}

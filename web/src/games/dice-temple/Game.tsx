import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTempleState, DiceTempleAction, DiceTempleSettings, Category } from "./state.js";
import { isTerminal, CATEGORIES, categoryScore } from "./state.js";
import "./Game.css";

const LABELS: Record<Category, string> = {
  ones: "Ones", twos: "Twos", threes: "Threes", fours: "Fours", fives: "Fives", sixes: "Sixes",
  threeKind: "3 of Kind", fourKind: "4 of Kind", fullHouse: "Full House", straight: "Straight", temple: "TEMPLE",
};

export function DiceTempleGame({ state, dispatch, onGameOver }: GameProps<DiceTempleState, DiceTempleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="te-wrap">
        <div className="te-done">
          <h2>Temple Sealed</h2>
          <div className="te-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const rolled = state.dice.every(d => d > 0);
  return (
    <div className="te-wrap">
      <div className="te-banner">Score {state.score} · Rolls {state.rerolls} / 3</div>
      <div className="te-dice">
        {state.dice.map((d, i) => <div key={i} className={`te-die${d === 0 ? " empty" : ""}`}>{d || "·"}</div>)}
      </div>
      <button data-testid="hint-target-dice-temple-roll" className="te-btn" disabled={state.rerolls >= 3} onClick={() => dispatch({ type: "roll" } as DiceTempleAction)}>Roll Dice</button>
      <div className="te-card">
        {CATEGORIES.map(c => {
          const claimed = state.card[c] !== undefined;
          const preview = rolled ? categoryScore(c, state.dice) : 0;
          return (
            <button
              key={c}
              data-testid={`hint-target-dice-temple-cat-${c}`}
              className={`te-cat${claimed ? " claimed" : ""}`}
              disabled={claimed || !rolled}
              onClick={() => dispatch({ type: "claim", cat: c } as DiceTempleAction)}
            >
              <span className="te-cat-name">{LABELS[c]}</span>
              <span className="te-cat-pts">{claimed ? state.card[c] : (rolled ? preview : "—")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

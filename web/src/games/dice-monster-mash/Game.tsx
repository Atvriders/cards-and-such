import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMonsterMashState, DiceMonsterMashAction, DiceMonsterMashSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceMonsterMashGame({ state, dispatch, onGameOver }: GameProps<DiceMonsterMashState, DiceMonsterMashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="mm-wrap">
        <div className="mm-done">
          <h2>Monster Mash Complete</h2>
          <div className="mm-final">{state.score} pts</div>
          <div className="mm-log">{state.log}</div>
        </div>
      </div>
    );
  }

  const m = state.monsters[state.current]!;
  const pct = (m.hp / m.maxHp) * 100;

  return (
    <div className="mm-wrap">
      <div className="mm-banner">Foe {state.current + 1} / {state.monsters.length} · Score {state.score}</div>
      <div className="mm-arena">
        <div className="mm-name">{m.name}</div>
        <div className="mm-bar"><span style={{ width: pct + "%" }} /></div>
        <div className="mm-hp">{m.hp} / {m.maxHp}</div>
        {state.rolls && (
          <div className="mm-row">
            {state.rolls.map((r, i) => <div key={i} className="mm-die">{r}</div>)}
          </div>
        )}
        <div className="mm-log">{state.log || "Roll three dice. Pairs +4, triples +12."}</div>
      </div>
      {state.phase === "roll" && (
        <button data-testid="hint-target-dice-monster-mash-roll" className="mm-btn" onClick={() => dispatch({ type: "smash" } as DiceMonsterMashAction)}>SMASH</button>
      )}
      {state.phase === "result" && (
        <button className="mm-btn alt" onClick={() => dispatch({ type: "next" } as DiceMonsterMashAction)}>{m.hp === 0 ? "Next Foe" : "Smash Again"}</button>
      )}
    </div>
  );
}

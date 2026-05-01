import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceArenaState, DiceArenaAction, DiceArenaSettings } from "./state.js";
import { isTerminal, PLAYER_HP } from "./state.js";
import "./Game.css";

export function DiceArenaGame({ state, dispatch, onGameOver }: GameProps<DiceArenaState, DiceArenaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ar-wrap">
        <div className="ar-done">
          <h2>{state.myHp > 0 ? "Champion!" : "Fallen Gladiator"}</h2>
          <div className="ar-final">{state.score} pts</div>
          <div className="ar-log">{state.log}</div>
        </div>
      </div>
    );
  }

  const opp = state.opps[state.current]!;
  const myPct = (state.myHp / PLAYER_HP) * 100;
  const oppPct = (opp.hp / opp.maxHp) * 100;

  return (
    <div className="ar-wrap">
      <div className="ar-banner">Bout {state.current + 1} / {state.opps.length} · Score {state.score}</div>
      <div className="ar-row-bars">
        <div className="ar-side">
          <div className="ar-side-label">YOU</div>
          <div className="ar-bar"><span style={{ width: myPct + "%" }} className="ar-fill me" /></div>
          <div className="ar-side-val">{state.myHp} / {PLAYER_HP}</div>
        </div>
        <div className="ar-side">
          <div className="ar-side-label">{opp.name}</div>
          <div className="ar-bar"><span style={{ width: oppPct + "%" }} className="ar-fill foe" /></div>
          <div className="ar-side-val">{opp.hp} / {opp.maxHp}</div>
        </div>
      </div>
      {state.rolls && (
        <div className="ar-rolls">
          <div className="ar-die">{state.rolls.mine[0]}</div>
          <div className="ar-die">{state.rolls.mine[1]}</div>
          <div className="ar-vs">vs</div>
          <div className="ar-die foe">{state.rolls.theirs}</div>
        </div>
      )}
      <div className="ar-log">{state.log || "Roll 2d6 to attack. Doubles add +4 damage."}</div>
      {state.phase === "fight" && (
        <button className="ar-btn" onClick={() => dispatch({ type: "fight" } as DiceArenaAction)}>Engage</button>
      )}
      {state.phase === "result" && (
        <button className="ar-btn alt" onClick={() => dispatch({ type: "next" } as DiceArenaAction)}>{opp.hp === 0 ? "Next Foe" : "Continue"}</button>
      )}
    </div>
  );
}

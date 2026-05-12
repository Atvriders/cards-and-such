import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDragonFightState, DiceDragonFightAction, DiceDragonFightSettings } from "./state.js";
import { isTerminal, HERO_MAX_HP, DRAGON_MAX_HP } from "./state.js";
import "./Game.css";

export function DiceDragonFightGame({ state, dispatch, onGameOver }: GameProps<DiceDragonFightState, DiceDragonFightSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const won = state.dragonHp === 0;
    return (
      <div className="df-wrap">
        <div className="df-done bounce-in">
          <h2>{won ? "Dragon Slain" : "The Dragon Prevails"}</h2>
          <div className="df-final">{state.score} pts</div>
          <div className="df-log">{state.log}</div>
        </div>
      </div>
    );
  }

  const heroPct = (state.heroHp / HERO_MAX_HP) * 100;
  const drPct = (state.dragonHp / DRAGON_MAX_HP) * 100;

  return (
    <div className="df-wrap fade-in">
      <div className="df-banner">Turn {state.turn} · Score {state.score}</div>

      <div className="df-bar-row">
        <div className="df-bar-label">Dragon</div>
        <div className="df-bar"><span className="df-bar-fill foe" style={{ width: drPct + "%" }} /></div>
        <div className="df-bar-val">{state.dragonHp} / {DRAGON_MAX_HP}</div>
      </div>
      <div className="df-bar-row">
        <div className="df-bar-label">Hero</div>
        <div className="df-bar"><span className="df-bar-fill hero" style={{ width: heroPct + "%" }} /></div>
        <div className="df-bar-val">{state.heroHp} / {HERO_MAX_HP}{state.shield > 0 ? `  shield ${state.shield}` : ""}</div>
      </div>

      <div className="df-stage">
        <div className="df-dragon-art">{drPct > 50 ? "▲▲▲" : drPct > 20 ? "▲▲" : "▲"}</div>
        {state.rolls.length > 0 && (
          <div className="df-dice">
            {state.rolls.map((r, i) => <div key={i} className="df-die">{r}</div>)}
          </div>
        )}
        <div className="df-log">{state.log || "Choose your stance — strike, guard, or focus."}</div>
      </div>

      {state.phase === "choose" && (
        <div className="df-actions">
          <button className="df-btn strike" data-testid="hint-target-dice-dragon-fight-roll" onClick={() => dispatch({ type: "act", choice: "strike" } as DiceDragonFightAction)}>Strike</button>
          <button className="df-btn guard" onClick={() => dispatch({ type: "act", choice: "guard" } as DiceDragonFightAction)}>Guard</button>
          <button className="df-btn focus" onClick={() => dispatch({ type: "act", choice: "focus" } as DiceDragonFightAction)}>Focus</button>
        </div>
      )}
      {state.phase === "result" && (
        <button className="df-btn next" data-testid="hint-target-dice-dragon-fight-next" onClick={() => dispatch({ type: "next" } as DiceDragonFightAction)}>Next Turn</button>
      )}
    </div>
  );
}

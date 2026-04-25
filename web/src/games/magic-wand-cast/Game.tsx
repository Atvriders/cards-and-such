import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MagicWandCastState, MagicWandCastAction, MagicWandCastSettings, SpellColor } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const COLOR_STYLES: Record<SpellColor, { bg: string; label: string }> = {
  red: { bg: "#e74c3c", label: "Red" },
  blue: { bg: "#3498db", label: "Blue" },
  green: { bg: "#27ae60", label: "Green" },
  yellow: { bg: "#f39c12", label: "Yellow" },
  purple: { bg: "#9b59b6", label: "Purple" },
};

const COLORS: SpellColor[] = ["red", "blue", "green", "yellow", "purple"];

export function MagicWandCast({ state, dispatch, onGameOver }: GameProps<MagicWandCastState, MagicWandCastSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "casting") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MagicWandCastAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") {
    return <div className="wand-wrap"><h2>All Spells Cast!</h2><p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#9b59b6" }}>{state.score} pts</p></div>;
  }

  const spell = state.spells[state.spellIndex]!;
  const isCasting = state.phase === "casting";

  return (
    <div className="wand-wrap">
      <div className="wand-header">
        <span>Spell {state.spellIndex + 1}/{state.spells.length}</span>
        <span className={state.timeLeft <= 5 ? "wand-urgent" : ""}>{state.timeLeft}s</span>
        <span>{state.score} pts</span>
      </div>
      <div className="wand-spell">
        {spell.map((c, i) => {
          const done = i < state.inputProgress.length;
          const active = i === state.inputProgress.length;
          return <span key={i} className={`wand-orb${done ? " done" : active ? " active" : ""}`} style={{ background: done ? COLOR_STYLES[c].bg : active ? COLOR_STYLES[c].bg + "80" : "#ddd" }}>{done ? "✓" : COLOR_STYLES[c].label[0]}</span>;
        })}
      </div>
      {state.phase === "timeout" && <p style={{ color: "#e74c3c", fontWeight: 700 }}>Time out! 0 pts for this spell.</p>}
      {state.phase === "success" && <p style={{ color: "#27ae60", fontWeight: 700 }}>Spell cast!</p>}
      {!isCasting && <button className="wand-btn" onClick={() => dispatch({ type: "next" } as MagicWandCastAction)}>Next Spell</button>}
      {isCasting && (
        <div className="wand-btns">
          {COLORS.map(c => (
            <button key={c} className="wand-color-btn" style={{ background: COLOR_STYLES[c].bg }}
              onClick={() => dispatch({ type: "cast", color: c } as MagicWandCastAction)}>{COLOR_STYLES[c].label}</button>
          ))}
        </div>
      )}
      {state.attemptsOnSpell > 0 && isCasting && <p style={{ color: "#e74c3c", fontSize: "0.9rem" }}>Mistakes: {state.attemptsOnSpell}</p>}
    </div>
  );
}

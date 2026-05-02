import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMuseumState, DiceMuseumAction, DiceMuseumSettings } from "./state.js";
import { isTerminal, TURNS, setBonus } from "./state.js";
import "./Game.css";

export function DiceMuseumGame({ state, dispatch, onGameOver }: GameProps<DiceMuseumState, DiceMuseumSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="mu-wrap">
        <div className="mu-done">
          <h2>Museum Closes</h2>
          <div className="mu-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mu-wrap">
      <div className="mu-banner">Day {state.turn} / {TURNS} · Score {state.score}</div>
      <div className="mu-cases">
        {[1,2,3,4,5,6].map(f => {
          const c = state.collected[f] ?? 0;
          return (
            <div key={f} className="mu-case">
              <div className="mu-face">{f}</div>
              <div className="mu-count">{c} pcs</div>
              <div className="mu-bonus">+{setBonus(c)}</div>
            </div>
          );
        })}
      </div>
      {state.rolls && (
        <div className="mu-row">
          {state.rolls.map((r, i) => <div key={i} className="mu-die">{r}</div>)}
        </div>
      )}
      <div className="mu-log">{state.log || "Roll three dice. Pick one face to add to its display case."}</div>
      {state.phase === "roll" && (
        <button className="mu-btn" data-testid="hint-target-dice-museum-roll" onClick={() => dispatch({ type: "roll" } as DiceMuseumAction)}>Excavate</button>
      )}
      {state.phase === "claim" && state.rolls && (
        <div className="mu-actions">
          {Array.from(new Set(state.rolls)).map(f => (
            <button key={f} className="mu-btn pick" onClick={() => dispatch({ type: "keep", face: f } as DiceMuseumAction)}>Add face {f}</button>
          ))}
          <button className="mu-btn alt" onClick={() => dispatch({ type: "skip" } as DiceMuseumAction)}>Skip</button>
        </div>
      )}
    </div>
  );
}

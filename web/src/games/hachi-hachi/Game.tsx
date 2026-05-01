import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HachiHachiState, HachiHachiAction, HachiHachiSettings } from "./state.js";
import { isTerminal, cardOf, pointsOf, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

const COLORS: Record<string, string> = { hikari: "#ffd166", tane: "#ef476f", tan: "#06d6a0", kasu: "#94a3b8" };

function Card({ id, onClick }: { id: number; onClick?: () => void }) {
  const c = cardOf(id);
  return (
    <button className="hh88-card" style={{ borderColor: COLORS[c.category] }} onClick={onClick} disabled={!onClick}>
      <span className="hh88-month">M{c.month}</span>
      <span className="hh88-cat">{c.category}</span>
      <span className="hh88-pts">{pointsOf(c.category)}pt</span>
    </button>
  );
}

export function HachiHachiGame({ state, dispatch, onGameOver }: GameProps<HachiHachiState, HachiHachiSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  return (
    <div className="hh88-wrap">
      <div className="hh88-header">
        <span>Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="hh88-you">You {state.score}</span>
        <span className="hh88-cpu">CPU {state.cpuScore}</span>
      </div>

      <div className="hh88-section">
        <div className="hh88-label">Field</div>
        <div className="hh88-row">{state.field.map(id => <Card key={id} id={id} />)}</div>
      </div>

      <div className="hh88-section">
        <div className="hh88-label">Your Hand</div>
        <div className="hh88-row">
          {state.hand.map(id => (
            <Card
              key={id}
              id={id}
              onClick={state.phase === "choose" ? () => dispatch({ type: "play", cardId: id } as HachiHachiAction) : undefined}
            />
          ))}
        </div>
      </div>

      <div className="hh88-log">{state.log}</div>

      {state.phase === "result" && (
        <button className="hh88-btn" onClick={() => dispatch({ type: "next" } as HachiHachiAction)}>Next Round</button>
      )}

      {state.phase === "done" && (
        <div className="hh88-done">
          <h3>Final</h3>
          <div className="hh88-final">You {state.score} / CPU {state.cpuScore}</div>
          <div>{state.score >= 88 ? "Hachi-Hachi! Hit 88!" : state.score > state.cpuScore ? "You won." : "CPU won."}</div>
        </div>
      )}
    </div>
  );
}

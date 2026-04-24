import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CursedCryptState, CursedCryptAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CursedCrypt({ state, dispatch, onGameOver }: GameProps<CursedCryptState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: CursedCryptAction) => dispatch(a);

  const room = state.rooms[state.currentRoom];
  const hpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);

  return (
    <div className="cry-wrap">
      <div className="cry-header">
        <span className="cry-title">Cursed Crypt</span>
        <span className="cry-hp">HP {state.playerHp}/{state.playerMaxHp} ({hpPct}%)</span>
        <span className="cry-gold">Gold {state.gold}</span>
      </div>

      <div className="cry-rooms-bar">
        {state.rooms.map((r, i) => (
          <div key={i} className={`cry-room-dot ${i < state.currentRoom ? "done" : i === state.currentRoom ? "current" : ""}`} />
        ))}
      </div>

      {state.phase === "explore" && room && (
        <div className="cry-room">
          <div className="cry-room-title">{room.title}</div>
          <div className="cry-room-desc">{room.description}</div>
          {!room.resolved ? (
            <div className="cry-choices">
              {room.choices.map((c, i) => (
                <button key={i} className="cry-choice" onClick={() => d({ type: "choose", choiceIdx: i })}>
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <button className="cry-advance" onClick={() => d({ type: "advance" })}>
              {state.currentRoom + 1 < state.rooms.length ? "Continue →" : "Escape!"}
            </button>
          )}
        </div>
      )}

      {state.phase === "escaped" && <div className="cry-end cry-win">Escaped! Score: {terminal?.score}</div>}
      {state.phase === "dead" && <div className="cry-end cry-dead">Fallen in the crypt. Score: {terminal?.score}</div>}

      <div className="cry-log">
        {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="cry-log-line">{l}</div>)}
      </div>
    </div>
  );
}

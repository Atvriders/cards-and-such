import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniWarState, MiniWarAction, MiniWarSettings } from "./state.js";
import { isTerminal, MAX_ROUNDS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function MiniWarGame({ state, dispatch, onGameOver }: GameProps<MiniWarState, MiniWarSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase === "ready" && (e.key === "f" || e.key === "F" || e.key === " " || e.key === "Enter")) {
        e.preventDefault(); dispatch({ type: "flip" } as MiniWarAction);
      } else if (state.phase === "war" && (e.key === "b" || e.key === "B" || e.key === " " || e.key === "Enter")) {
        e.preventDefault(); dispatch({ type: "warFlip" } as MiniWarAction);
      } else if (state.phase === "reveal" && (e.key === "n" || e.key === "N" || e.key === " " || e.key === "Enter")) {
        e.preventDefault(); dispatch({ type: "next" } as MiniWarAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase]);

  const playerTop = state.playerPlayed[state.playerPlayed.length - 1];
  const cpuTop = state.cpuPlayed[state.cpuPlayed.length - 1];

  return (
    <div className="war-wrap fade-in">
      <div className="war-hud">
        <div className="war-stat">Round <b>{state.round}</b>/{MAX_ROUNDS}</div>
        <div className="war-stat">CPU cards: <b>{state.cpu.length}</b></div>
        <div className="war-stat">Your cards: <b>{state.player.length}</b></div>
      </div>

      <div className="war-side war-cpu">
        <div className="war-label">CPU</div>
        <div className="war-row">
          <div className="war-pile">
            {state.cpu.length > 0 && <Card faceDown />}
            <div className="war-count">{state.cpu.length}</div>
          </div>
          <div className="war-played">
            {state.cpuPlayed.length === 0 && <div className="war-slot" />}
            {state.cpuPlayed.map((c, i) => {
              const isUp = i === state.cpuPlayed.length - 1 || (state.phase === "war" && i % 4 === 3);
              return <div key={c.id} className="war-played-card"><Card card={c} faceDown={!isUp} /></div>;
            })}
          </div>
        </div>
      </div>

      <div className="war-center">
        {state.phase === "ready" && (
          <button data-testid="hint-target-mini-war-flip" className="war-btn primary" aria-label="Flip card (F)" onClick={() => dispatch({ type: "flip" } as MiniWarAction)}>
            Flip!
          </button>
        )}
        {state.phase === "war" && (
          <>
            <div className="war-banner">⚔ WAR! depth {state.warDepth}</div>
            <button data-testid="hint-target-mini-war-battle" className="war-btn danger" aria-label="Battle (B)" onClick={() => dispatch({ type: "warFlip" } as MiniWarAction)}>
              Battle (3 down, 1 up)
            </button>
          </>
        )}
        {state.phase === "reveal" && (
          <>
            <div className={`war-result ${state.result}`}>
              {state.result === "player" && playerTop && cpuTop && "You take the round!"}
              {state.result === "cpu" && "CPU takes the round."}
              {state.result === "tie" && "Tie."}
            </div>
            <button data-testid="hint-target-mini-war-next" className="war-btn primary" aria-label="Next round (N)" onClick={() => dispatch({ type: "next" } as MiniWarAction)}>
              Next round
            </button>
          </>
        )}
        {state.phase === "done" && (
          <div className="war-done bounce-in">
            <h2>{state.winner === "player" ? "Victory!" : state.winner === "cpu" ? "Defeat" : "Stalemate"}</h2>
            <div className="war-final">Final: you {state.player.length} vs CPU {state.cpu.length}</div>
          </div>
        )}
      </div>

      <div className="war-side war-you">
        <div className="war-label">You</div>
        <div className="war-row">
          <div className="war-pile">
            {state.player.length > 0 && <Card faceDown />}
            <div className="war-count">{state.player.length}</div>
          </div>
          <div className="war-played">
            {state.playerPlayed.length === 0 && <div className="war-slot" />}
            {state.playerPlayed.map((c, i) => {
              const isUp = i === state.playerPlayed.length - 1 || (state.phase === "war" && i % 4 === 3);
              return <div key={c.id} className="war-played-card"><Card card={c} faceDown={!isUp} /></div>;
            })}
          </div>
        </div>
      </div>

      <div className="war-log">
        {state.log.slice(-6).map((l, i) => <div key={i} className="war-log-line">{l}</div>)}
      </div>
    </div>
  );
}

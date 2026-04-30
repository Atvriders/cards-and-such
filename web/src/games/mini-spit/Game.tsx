import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniSpitState, MiniSpitAction, MiniSpitSettings } from "./state.js";
import { isTerminal, adjacent } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function MiniSpitGame({ state, dispatch, onGameOver }: GameProps<MiniSpitState, MiniSpitSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [selectedId, setSelectedId] = useState<string>("");

  // CPU ticks roughly every 900ms while playing
  useEffect(() => {
    if (state.phase !== "playing") return;
    const id = setInterval(() => dispatch({ type: "cpuTick" } as MiniSpitAction), 900);
    return () => clearInterval(id);
  }, [state.phase, dispatch]);

  const left = state.centerLeft[state.centerLeft.length - 1];
  const right = state.centerRight[state.centerRight.length - 1];

  const tryPlay = (pile: "left" | "right") => {
    if (!selectedId) return;
    dispatch({ type: "play", cardId: selectedId, pile } as MiniSpitAction);
    setSelectedId("");
  };

  return (
    <div className="spit-mini-wrap">
      <div className="spit-mini-hud">
        <div className="spit-mini-stat">CPU stock <b>{state.cpuStock.length}</b></div>
        <div className="spit-mini-stat">Phase <b>{state.phase}</b></div>
        <div className="spit-mini-stat">Your stock <b>{state.playerStock.length}</b></div>
      </div>

      <div className="spit-mini-cpu">
        <div className="spit-mini-label">CPU hand</div>
        <div className="spit-mini-row">
          {state.cpuHand.map((_, i) => <div key={i} className="spit-mini-card-tight"><Card faceDown /></div>)}
        </div>
      </div>

      <div className="spit-mini-center">
        <div className="spit-mini-pile" onClick={() => tryPlay("left")}>
          <div className="spit-mini-pile-label">Left</div>
          {left ? <Card card={left} /> : <div className="spit-mini-slot" />}
        </div>
        <div className="spit-mini-spit">
          {state.phase === "ready" && (
            <button className="spit-mini-btn primary" onClick={() => dispatch({ type: "spit" } as MiniSpitAction)}>SPIT!</button>
          )}
          {state.phase === "stalemate" && (
            <button className="spit-mini-btn warn" onClick={() => dispatch({ type: "knockSlap" } as MiniSpitAction)}>KNOCK</button>
          )}
          {state.phase === "playing" && <div className="spit-mini-tag">PLAY</div>}
        </div>
        <div className="spit-mini-pile" onClick={() => tryPlay("right")}>
          <div className="spit-mini-pile-label">Right</div>
          {right ? <Card card={right} /> : <div className="spit-mini-slot" />}
        </div>
      </div>

      <div className="spit-mini-you">
        <div className="spit-mini-label">Your hand</div>
        <div className="spit-mini-hand">
          {state.playerHand.map((c) => {
            const playable = (left && adjacent(c, left)) || (right && adjacent(c, right));
            const isSel = selectedId === c.id;
            return (
              <div
                key={c.id}
                className={`spit-mini-card-slot ${isSel ? "selected" : ""} ${playable ? "playable" : ""}`}
                onClick={() => setSelectedId(c.id)}
              >
                <Card card={c} />
              </div>
            );
          })}
        </div>
        <div className="spit-mini-actions">
          <button className="spit-mini-btn alt" disabled={!selectedId} onClick={() => tryPlay("left")}>Play LEFT</button>
          <button className="spit-mini-btn alt" disabled={!selectedId} onClick={() => tryPlay("right")}>Play RIGHT</button>
        </div>
      </div>

      {state.phase === "done" && (
        <div className={`spit-mini-done ${state.winner}`}>
          <h2>
            {state.winner === "player" ? "You won!" : state.winner === "cpu" ? "CPU wins" : "Tie"}
          </h2>
        </div>
      )}

      <div className="spit-mini-log">
        {state.log.slice(-4).map((l, i) => <div key={i} className="spit-mini-log-line">{l}</div>)}
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpitState, SpitSettings } from "./state.js";
import { isTerminal, canPlay } from "./state.js";
import { isRed, rankLabel } from "../../engines/deck/index.js";
import type { Card } from "../../engines/deck/index.js";
import "./Spit.css";

type SpitAction =
  | { type: "play"; reserveIdx: number; centerIdx: 0 | 1 }
  | { type: "spit" }
  | { type: "bot-tick" }
  | { type: "restart" };

function SCard({ card, onClick }: { card: Card | null; onClick?: () => void }) {
  if (!card) return <div className="spit-card empty" onClick={onClick}>—</div>;
  const colorClass = isRed(card.suit) ? "red-suit" : "black-suit";
  return (
    <div className={`spit-card ${colorClass}`} onClick={onClick}>
      <div>{rankLabel(card.rank)}</div>
      <div>{card.suit}</div>
    </div>
  );
}

export function Spit({ state, dispatch, onGameOver }: GameProps<SpitState, SpitSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "playing") {
      tickRef.current = setInterval(() => dispatch({ type: "bot-tick" } as SpitAction), 700);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  function dis(a: SpitAction) { dispatch(a); }

  function tryPlay(reserveIdx: number) {
    const reserve = state.playerReserve[reserveIdx];
    const top = reserve?.[reserve.length - 1];
    if (!top) return;
    if (canPlay(top, state.centerPile0)) {
      dis({ type: "play", reserveIdx, centerIdx: 0 });
    } else if (canPlay(top, state.centerPile1)) {
      dis({ type: "play", reserveIdx, centerIdx: 1 });
    }
  }

  const top0 = state.centerPile0[state.centerPile0.length - 1] ?? null;
  const top1 = state.centerPile1[state.centerPile1.length - 1] ?? null;

  return (
    <div className="spit-game">
      <div className="spit-title">SPIT!</div>
      <div className="spit-status">
        Your reserve cards: <strong>{state.playerReserve.reduce((s, p) => s + p.length, 0)}</strong> |
        Bot reserve: <strong>{state.botReserve.reduce((s, p) => s + p.length, 0)}</strong>
      </div>

      {terminal && (
        <div className="spit-game-over">
          {state.winner === "player" ? "You win!" : "Bot wins!"} — Score: {terminal.score}
        </div>
      )}

      {state.phase === "spit-ready" && (
        <div className="spit-spit-banner">Both stuck — click SPIT!</div>
      )}

      <div className="spit-area">
        <div className="spit-label">Bot Reserve</div>
        <div className="spit-reserve">
          {state.botReserve.map((pile, i) => {
            const top = pile[pile.length - 1] ?? null;
            return <SCard key={i} card={top} />;
          })}
        </div>
      </div>

      <div className="spit-center">
        <div style={{ textAlign: "center" }}>
          <div className="spit-label">Pile 1 ({state.centerPile0.length})</div>
          <SCard card={top0} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button className="spit-btn spit" onClick={() => dis({ type: "spit" })} disabled={state.phase !== "spit-ready"}>
            SPIT!
          </button>
          <div style={{ fontSize: "0.7rem", color: "#ffcdd2", textAlign: "center" }}>
            Spit piles: {state.playerSpitPile.length}/{state.botSpitPile.length}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="spit-label">Pile 2 ({state.centerPile1.length})</div>
          <SCard card={top1} />
        </div>
      </div>

      <div className="spit-area">
        <div className="spit-label">Your Reserve — click to play</div>
        <div className="spit-reserve">
          {state.playerReserve.map((pile, i) => {
            const top = pile[pile.length - 1] ?? null;
            return <SCard key={i} card={top} onClick={() => tryPlay(i)} />;
          })}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#ffcdd2" }}>
          Click a reserve card to auto-play it to a valid center pile. Cards must be ±1 rank (Ace wraps to King).
        </div>
      </div>

      {terminal && (
        <button className="spit-btn primary" onClick={() => dis({ type: "restart" })}>Play Again</button>
      )}
    </div>
  );
}

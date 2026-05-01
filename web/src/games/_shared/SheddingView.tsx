import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SheddingState, SheddingAction } from "./shedding-engine.js";
import { canPlay, shedTerminal } from "./shedding-engine.js";
import type { Suit } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";

interface Props {
  prefix: string;
  title: string;
}

export function SheddingView({
  state, dispatch, onGameOver, prefix, title,
}: GameProps<SheddingState, unknown> & Props): JSX.Element {
  const t = shedTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const { playerHand, botHand, stock, pile, phase, message, activeSuit } = state;
  const top = pile.length > 0 ? pile[pile.length - 1] : null;
  const done = phase === "done";

  const suits: Suit[] = ["♠", "♥", "♦", "♣"];

  return (
    <div className={`${prefix}-wrap`}>
      <div className={`${prefix}-header`}>
        <span>{title}</span>
        <span>Stock: {stock.length}</span>
        <span>Suit: {activeSuit ?? "?"}</span>
        {state.pendingDraw > 0 && <span>Draw stack: +{state.pendingDraw}</span>}
      </div>
      <div className={`${prefix}-bot`}>
        <div className={`${prefix}-label`}>CPU ({botHand.length})</div>
        <div className={`${prefix}-row`}>
          {botHand.map((_, i) => <Card key={i} faceDown />)}
        </div>
      </div>
      <div className={`${prefix}-piles`}>
        <div className={`${prefix}-pile`}>
          <div className={`${prefix}-label`}>Stock ({stock.length})</div>
          {phase === "player" && (
            <Card faceDown onClick={() => dispatch({ type: "draw" } as SheddingAction)} />
          )}
        </div>
        <div className={`${prefix}-pile`}>
          <div className={`${prefix}-label`}>Pile</div>
          {top ? <Card card={top} /> : <div className={`${prefix}-empty`}>(empty)</div>}
        </div>
      </div>
      <div className={`${prefix}-status`}>{message}</div>
      {phase === "choose-suit" && (
        <div className={`${prefix}-actions`}>
          {suits.map(s =>
            <button key={s} className={`${prefix}-btn`}
              onClick={() => dispatch({ type: "pick-suit", suit: s } as SheddingAction)}>
              {s}
            </button>
          )}
        </div>
      )}
      {phase === "player" && (
        <div className={`${prefix}-actions`}>
          <button className={`${prefix}-btn`}
            onClick={() => dispatch({ type: "draw" } as SheddingAction)}>
            Draw
          </button>
        </div>
      )}
      <div className={`${prefix}-label`}>You ({playerHand.length})</div>
      <div className={`${prefix}-row`}>
        {[...playerHand]
          .sort((a, b) => {
            const so: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
            const sd = (so[a.suit] ?? 0) - (so[b.suit] ?? 0);
            return sd !== 0 ? sd : a.rank - b.rank;
          })
          .map(c => {
            const playable = phase === "player" && canPlay(c, state);
            return (
              <Card key={c.id} card={c}
                className={playable ? "playable" : "dim"}
                onClick={playable ? () => dispatch({ type: "play", cardId: c.id } as SheddingAction) : undefined} />
            );
          })}
      </div>
      {done && (
        <div className={`${prefix}-result`}>
          <h3>Game over</h3>
          <div>{message}</div>
          <div><strong>{state.winner === "player" ? "You win!" : state.winner === "bot" ? "CPU wins" : "Tie"}</strong></div>
        </div>
      )}
    </div>
  );
}

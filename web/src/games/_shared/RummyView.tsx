import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RummyState, RummyAction } from "./rummy-engine.js";
import { detectMelds, rummyTerminal } from "./rummy-engine.js";
import { Card } from "../../engines/deck/Card.js";

interface Props {
  prefix: string;
  title: string;
}

export function RummyView({
  state, dispatch, onGameOver, prefix, title,
}: GameProps<RummyState, unknown> & Props): JSX.Element {
  const t = rummyTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const { playerHand, botHand, stock, discardPile, phase, message, finalScore } = state;
  const top = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const { deadwoodValue, melds } = detectMelds(playerHand);
  const canKnock = deadwoodValue <= state.cfg.knockLimit && phase === "player-discard";
  const done = phase === "done";

  return (
    <div className={`${prefix}-wrap fade-in`}>
      <div className={`${prefix}-header`}>
        <span>{title}</span>
        <span>Phase: {phase}</span>
        <span>Deadwood: {deadwoodValue}</span>
        <span>Stock: {stock.length}</span>
      </div>
      <div className={`${prefix}-bot`}>
        <div className={`${prefix}-label`}>CPU ({botHand.length})</div>
        <div className={`${prefix}-row`}>
          {botHand.map((_, i) => <Card key={i} faceDown />)}
        </div>
      </div>
      <div className={`${prefix}-piles`}>
        <div className={`${prefix}-pile`} data-testid="hint-target-rummy-stock">
          <div className={`${prefix}-label`}>Stock ({stock.length})</div>
          {phase === "player-draw" && stock.length > 0 ? (
            <Card faceDown onClick={() => dispatch({ type: "draw", from: "stock" } as RummyAction)} />
          ) : (
            <Card faceDown />
          )}
        </div>
        <div className={`${prefix}-pile`} data-testid="hint-target-rummy-discard">
          <div className={`${prefix}-label`}>Discard</div>
          {top ? (
            phase === "player-draw"
              ? <Card card={top} onClick={() => dispatch({ type: "draw", from: "discard" } as RummyAction)} />
              : <Card card={top} />
          ) : <div className={`${prefix}-empty`}>(empty)</div>}
        </div>
      </div>
      <div className={`${prefix}-status`}>{message}</div>
      {!done && (
        <div className={`${prefix}-actions`}>
          <button className={`${prefix}-btn`} disabled={!canKnock}
            data-testid="hint-target-rummy-knock"
            onClick={() => dispatch({ type: "knock" } as RummyAction)}>
            Knock ({deadwoodValue} dw)
          </button>
        </div>
      )}
      <div className={`${prefix}-label`}>You ({playerHand.length}) — {melds.length} meld{melds.length === 1 ? "" : "s"}</div>
      <div className={`${prefix}-row`}>
        {[...playerHand]
          .sort((a, b) => {
            const so: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
            const sd = (so[a.suit] ?? 0) - (so[b.suit] ?? 0);
            return sd !== 0 ? sd : a.rank - b.rank;
          })
          .map((c, i) => (
            <span key={c.id} data-testid={`hint-target-rummy-card-${i}`}>
              {phase === "player-discard"
                ? <Card card={c} onClick={() => dispatch({ type: "discard", cardId: c.id } as RummyAction)} />
                : <Card card={c} />}
            </span>
          ))}
      </div>
      {done && finalScore !== null && (
        <div className={`${prefix}-result`}>
          <h3>Hand over</h3>
          <div>{message}</div>
          <div>Final: <strong>{finalScore > 0 ? `+${finalScore} (you win)` : finalScore < 0 ? `${finalScore} (CPU wins)` : "Tie"}</strong></div>
        </div>
      )}
    </div>
  );
}

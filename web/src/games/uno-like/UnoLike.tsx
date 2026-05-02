import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UnoCard, UnoColor, UnoLikeAction, UnoLikeState } from "@cards/shared";
import "./UnoLike.css";

type Settings = { bots: "1" | "2" | "3" };

export function UnoLike({ state, dispatch }: GameProps<UnoLikeState & { settings: Settings }, Settings>): JSX.Element {
  const [picking, setPicking] = useState<UnoCard | null>(null);
  const myHand = state.hands[0] ?? [];

  const play = (card: UnoCard): void => {
    if (card.card.kind === "wild" || card.card.kind === "wild-draw-4") {
      setPicking(card);
      return;
    }
    dispatch({ type: "play", cardId: card.id } satisfies UnoLikeAction);
  };

  const playWith = (color: UnoColor): void => {
    if (!picking) return;
    dispatch({ type: "play", cardId: picking.id, chosenColor: color } satisfies UnoLikeAction);
    setPicking(null);
  };

  return (
    <div className="uno-root">
      <div className="uno-status">
        Turn: {state.turn === 0 ? "you" : `bot ${state.turn}`} · active color: <span className={`uno-pill uno-${state.activeColor}`}>{state.activeColor}</span>
        {state.pendingDraws > 0 && <span> · stacked draws: {state.pendingDraws}</span>}
        {state.winner !== null && <span> · <strong>{state.winner === 0 ? "You won!" : `Bot ${state.winner} won`}</strong></span>}
      </div>

      <div className="uno-peers">
        {state.hands.slice(1).map((h, i) => (
          <div className="uno-peer" key={i}>
            bot {i + 1}: {h.length} card{h.length === 1 ? "" : "s"}
          </div>
        ))}
      </div>

      <div className="uno-center">
        <div className="uno-discard">{renderCard(state.discardTop)}</div>
        <button
          data-testid="hint-target-uno-like-draw"
          className="uno-draw"
          onClick={() => dispatch({ type: "draw" })}
          disabled={state.turn !== 0 || state.winner !== null}
        >Draw</button>
        <button
          className="uno-pass"
          onClick={() => dispatch({ type: "pass" })}
          disabled={state.turn !== 0 || state.winner !== null}
        >Pass</button>
      </div>

      <div className="uno-hand" data-testid="uno-hand">
        {myHand.map((c) => (
          <button
            key={c.id}
            className="uno-card"
            onClick={() => play(c)}
            disabled={state.turn !== 0 || state.winner !== null}
            data-testid={`hand-card-${c.id}`}
          >
            {renderCard(c)}
          </button>
        ))}
      </div>

      {picking && (
        <div className="uno-picker" role="dialog" aria-label="choose color">
          <p>Choose a color:</p>
          {(["red","yellow","green","blue"] as UnoColor[]).map((c) => (
            <button key={c} className={`uno-color uno-${c}`} onClick={() => playWith(c)}>{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function renderCard(c: UnoCard): JSX.Element {
  const card = c.card;
  if (card.kind === "wild" || card.kind === "wild-draw-4") {
    return <div className={`uno-face uno-wild`}>{card.kind === "wild" ? "W" : "+4"}</div>;
  }
  const color = card.color;
  const label =
    card.kind === "number" ? String(card.value)
    : card.kind === "skip" ? "⦸"
    : card.kind === "reverse" ? "⇄"
    : "+2";
  return <div className={`uno-face uno-${color}`}>{label}</div>;
}

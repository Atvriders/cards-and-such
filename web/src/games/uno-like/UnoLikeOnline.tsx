import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../platform/stores/auth.js";
import { useRoom } from "../../platform/api/useRoom.js";
import type { UnoCard, UnoColor, UnoLikeState } from "@cards/shared";
import { renderCard } from "./UnoLike.js";
import "./UnoLike.css";

export default function UnoLikeOnline(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const token = useAuth((s) => s.token);
  const [view, controls] = useRoom(roomId ?? null, token);
  const [picking, setPicking] = useState<UnoCard | null>(null);

  if (view.status === "closed") return <div>Disconnected.</div>;
  if (view.state === null) return <div>Loading room…</div>;

  const state = view.state as UnoLikeState;
  const mySeat = view.seat;
  if (mySeat === null) return <div>Joining…</div>;
  const myHand = state.hands[mySeat] ?? [];
  const isMyTurn = state.turn === mySeat && state.winner === null;

  const play = (card: UnoCard): void => {
    if (card.card.kind === "wild" || card.card.kind === "wild-draw-4") {
      setPicking(card);
      return;
    }
    controls.dispatch({ type: "play", cardId: card.id });
  };
  const playWith = (color: UnoColor): void => {
    if (!picking) return;
    controls.dispatch({ type: "play", cardId: picking.id, chosenColor: color });
    setPicking(null);
  };

  return (
    <div className="uno-root">
      <div className="uno-members">
        Room: {view.members.map((m) => m.username).join(", ")}
      </div>
      <div className="uno-status">
        {isMyTurn ? "Your turn" : `Turn: seat ${state.turn}`}
        · active color: <span className={`uno-pill uno-${state.activeColor}`}>{state.activeColor}</span>
        {state.pendingDraws > 0 && <span> · stacked draws: {state.pendingDraws}</span>}
        {state.winner !== null && <span> · winner: seat {state.winner}</span>}
      </div>

      <div className="uno-peers">
        {state.hands.map((h, i) => i !== mySeat && (
          <div className="uno-peer" key={i}>seat {i}: {h.length} cards</div>
        ))}
      </div>

      <div className="uno-center">
        <div className="uno-discard">{renderCard(state.discardTop)}</div>
        <button className="uno-draw" onClick={() => controls.dispatch({ type: "draw" })} disabled={!isMyTurn}>Draw</button>
        <button className="uno-pass" onClick={() => controls.dispatch({ type: "pass" })} disabled={!isMyTurn}>Pass</button>
      </div>

      <div className="uno-hand">
        {myHand.map((c) => (
          <button key={c.id} className="uno-card" onClick={() => play(c)} disabled={!isMyTurn}>
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

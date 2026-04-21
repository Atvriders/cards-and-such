import { useParams } from "react-router-dom";
import { useAuth } from "../../platform/stores/auth.js";
import { useRoom } from "../../platform/api/useRoom.js";
import { type Connect4State, COLS, ROWS } from "@cards/shared";
import "./Connect4.css";

export default function Connect4Online(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const token = useAuth((s) => s.token);
  const [view, controls] = useRoom(roomId ?? null, token);

  if (view.status === "closed") return <div>Disconnected.</div>;
  if (view.state === null) return <div>Loading room…</div>;

  const state = view.state as Connect4State;
  const mySeat = view.seat;
  const isMyTurn = mySeat !== null && state.turn === mySeat && state.winner === null;
  const winSet = new Set((state.winningLine ?? []).map(([r, c]) => `${r},${c}`));

  return (
    <div className="c4-root">
      <div className="c4-members">
        Room members: {view.members.map((m) => `${m.username}${m.seat === mySeat ? " (you)" : ""}`).join(", ")}
      </div>
      <div className="c4-status">
        {state.winner === null
          ? isMyTurn ? "Your turn" : `Turn: ${state.turn === 0 ? "Red" : "Yellow"}`
          : state.winner === "draw" ? "Draw" : `Winner: ${state.winner === 0 ? "Red" : "Yellow"}`}
      </div>
      <div className="c4-board">
        {Array.from({ length: ROWS }, (_, r) => (
          <div className="c4-row" key={r}>
            {Array.from({ length: COLS }, (_, c) => {
              const v = state.board[r * COLS + c];
              const winning = winSet.has(`${r},${c}`);
              return (
                <button
                  key={c}
                  className={`c4-cell ${v === 0 ? "red" : v === 1 ? "yellow" : ""} ${winning ? "win" : ""}`}
                  disabled={!isMyTurn}
                  onClick={() => controls.dispatch({ type: "drop", col: c })}
                  data-testid={`c4-col-${c}-row-${r}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

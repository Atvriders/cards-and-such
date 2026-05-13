import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PyramidGolfState, PyramidGolfAction, PyramidGolfSettings } from "./state.js";
import { isAvailable } from "./state.js";
import { Card as CardComponent } from "../../engines/deck/Card.js";
import "./PyramidGolf.css";

export function PyramidGolf({ state, dispatch, onGameOver }: GameProps<PyramidGolfState, PyramidGolfSettings>): JSX.Element {
  if (state.won || state.lost) {
    let removed = 0;
    for (const row of state.pyramid) for (const cell of row) if (cell && cell.removed) removed++;
    onGameOver(state.won ? 500 + state.stock.length * 10 : removed * 10);
  }

  const send = (action: PyramidGolfAction) => dispatch(action);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1]! : null;

  return (
    <div className="pyramid-golf fade-in">
      <div className="pg-info">
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
        {state.won && <span>Cleared!</span>}
        {state.lost && <span>No moves left</span>}
      </div>

      <div className="pg-pyramid">
        {state.pyramid.map((row, rIdx) => (
          <div key={rIdx} className="pg-row">
            {row.map((cell, cIdx) => {
              if (!cell) return <div key={cIdx} style={{ width: 60, height: 84 }} />;
              const avail = isAvailable(state.pyramid, rIdx, cIdx);
              const isSel = state.selected?.row === rIdx && state.selected?.col === cIdx;
              const cls = [
                "pg-cell",
                cell.removed ? "removed" : "",
                !avail && !cell.removed ? "blocked" : "",
                isSel ? "selected" : "",
              ].filter(Boolean).join(" ");
              return (
                <div key={cIdx} className={cls} data-testid={`hint-target-pyramid-golf-${rIdx}-${cIdx}`}>
                  {!cell.removed && avail && (
                    <CardComponent
                      card={cell.card}
                      onClick={() => {
                        if (cell.card.rank === 13) send({ type: "remove-king", row: rIdx, col: cIdx });
                        else send({ type: "select-pyramid", row: rIdx, col: cIdx });
                      }}
                    />
                  )}
                  {!cell.removed && !avail && (
                    <CardComponent card={cell.card} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="pg-bottom">
        <div className="pg-area">
          <span>Stock ({state.stock.length})</span>
          {state.stock.length > 0 ? (
            <CardComponent faceDown onClick={() => send({ type: "draw" })} />
          ) : (
            <div className="pg-placeholder">Empty</div>
          )}
          <button className="pg-btn" data-testid="hint-target-pyramid-golf-draw" disabled={state.stock.length === 0} onClick={() => send({ type: "draw" })}>Draw</button>
        </div>
        <div className="pg-area">
          <span>Waste (play on this)</span>
          {wasteTop ? <CardComponent card={wasteTop} /> : <div className="pg-placeholder">Empty</div>}
        </div>
      </div>
    </div>
  );
}

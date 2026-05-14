import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  SushiGoPartyFullState,
  SushiGoPartyFullAction,
  SushiGoPartyFullSettings,
} from "./state.js";
import {
  isTerminal,
  cardLabel,
  cardShort,
  cardCategory,
  HUMAN_SEAT,
  NUM_PLAYERS,
  TOTAL_ROUNDS,
} from "./state.js";
import "./Game.css";

const SEAT_LABELS = ["You", "CPU 1", "CPU 2", "CPU 3"];

export function SushiGoPartyFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SushiGoPartyFullState, SushiGoPartyFullSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const yourHand = state.hands[HUMAN_SEAT] ?? [];
  const youTotal = state.totals[HUMAN_SEAT] ?? 0;
  const ranks = state.totals
    .map((t, i) => ({ seat: i, total: t, puddings: state.puddings[i] ?? 0 }))
    .sort((a, b) => b.total - a.total || b.puddings - a.puddings);
  const winnerSeat = ranks[0]?.seat ?? 0;
  const youWin = winnerSeat === HUMAN_SEAT;

  return (
    <div className="sgpf-wrap fade-in" data-testid="sgpf-root">
      <h3 className="sgpf-title">Sushi Go Party</h3>
      <div className="sgpf-stats">
        <div className="sgpf-stat" title="Current round of three">
          <span>Round</span>
          <b data-testid="sgpf-round">
            {Math.min(state.round, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
          </b>
        </div>
        <div className="sgpf-stat" title="Cards picked this round so far">
          <span>Pick</span>
          <b>
            {state.pickIndex}/9
          </b>
        </div>
        <div className="sgpf-stat sgpf-stat-you" title="Your total points">
          <span>You</span>
          <b className="pulse" data-testid="sgpf-you-total">{youTotal}</b>
        </div>
        <div className="sgpf-stat" title="Pudding count carries across rounds">
          <span>Puddings</span>
          <b>{state.puddings[HUMAN_SEAT] ?? 0}</b>
        </div>
      </div>

      <div className="sgpf-scoreboard">
        {SEAT_LABELS.map((name, i) => (
          <div
            key={name}
            className={"sgpf-seat-row" + (i === HUMAN_SEAT ? " sgpf-seat-you" : "")}
          >
            <span className="sgpf-seat-name">{name}</span>
            <span className="sgpf-seat-total">{state.totals[i] ?? 0}</span>
            <span className="sgpf-seat-pud" title="Puddings collected">
              P{state.puddings[i] ?? 0}
            </span>
          </div>
        ))}
      </div>

      {state.phase === "picking" && (
        <>
          <div className="sgpf-prompt">
            Pick one card to keep. The remaining cards pass {state.round % 2 === 1 ? "left" : "right"}.
          </div>
          <div className="sgpf-hand" data-testid="sgpf-hand">
            {yourHand.map((c, i) => (
              <button
                key={c.id}
                className={"sgpf-card sgpf-cat-" + cardCategory(c.kind)}
                onClick={() =>
                  dispatch({ type: "pick", idx: i } as SushiGoPartyFullAction)
                }
                title={`Play ${cardLabel(c.kind)}`}
                data-testid={`sgpf-pick-${i}`}
              >
                <div className="sgpf-card-name">{cardLabel(c.kind)}</div>
                <div className="sgpf-card-tag">{cardShort(c.kind)}</div>
              </button>
            ))}
            {yourHand.length === 0 && (
              <div className="sgpf-empty">(awaiting score)</div>
            )}
          </div>
        </>
      )}

      {state.phase === "round-scored" && (
        <div className="sgpf-event bounce-in">
          <div className="sgpf-event-title">Round {state.round} scored</div>
          <ul className="sgpf-event-log">
            {state.lastRoundLog.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          <button
            className="sgpf-next"
            onClick={() => dispatch({ type: "next" } as SushiGoPartyFullAction)}
            title="Deal the next round"
            data-testid="sgpf-next"
          >
            Next Round &raquo;
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="sgpf-done bounce-in">
          <h3>{youWin ? "Victory!" : "Try Again"}</h3>
          <div className="sgpf-rank-list">
            {ranks.map((r, idx) => (
              <div
                key={r.seat}
                className={
                  "sgpf-rank " +
                  (r.seat === HUMAN_SEAT ? "sgpf-rank-you " : "") +
                  (idx === 0 ? "sgpf-rank-first" : "")
                }
              >
                <span className="sgpf-rank-pos">#{idx + 1}</span>
                <span className="sgpf-rank-name">{SEAT_LABELS[r.seat]}</span>
                <span className="sgpf-rank-score">{r.total}</span>
              </div>
            ))}
          </div>
          {state.finalLog.length > 0 && (
            <details className="sgpf-pudding-details">
              <summary>Pudding bonus</summary>
              <ul>
                {state.finalLog.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="sgpf-tableaus">
        {state.tableaus.map((tableau, seat) => (
          <div
            key={seat}
            className={
              "sgpf-tab" + (seat === HUMAN_SEAT ? " sgpf-tab-you" : "")
            }
          >
            <div className="sgpf-tab-label">
              {SEAT_LABELS[seat]} — {state.roundScores[seat]?.join("+") || "0"}
            </div>
            <div className="sgpf-tab-row">
              {tableau.map((c, i) => (
                <div
                  key={c.id + ":" + i}
                  className={"sgpf-mini sgpf-cat-" + cardCategory(c.kind)}
                  title={cardLabel(c.kind)}
                >
                  {cardShort(c.kind)}
                </div>
              ))}
              {tableau.length === 0 && (
                <div className="sgpf-empty-mini">(empty)</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sgpf-legend">
        <span>
          Sashimi×3=10 &middot; Tempura×2=5 &middot; Dumpling 1/3/6/10/15 &middot;
          Maki 6/3 &middot; Pudding most+6/least-6
        </span>
      </div>
      {/* anchor for NUM_PLAYERS — keeps import live for renderers depending on seat count */}
      <span className="sgpf-meta" aria-hidden="true">
        {NUM_PLAYERS}-player
      </span>
    </div>
  );
}

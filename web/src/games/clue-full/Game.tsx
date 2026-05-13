import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  Card,
  ClueFullAction,
  ClueFullSettings,
  ClueFullState,
  NoteMark,
  Room,
  Suspect,
  Weapon,
} from "./state.js";
import {
  isTerminal,
  passagePartner,
  ROOMS,
  SUSPECTS,
  WEAPONS,
} from "./state.js";
import "./Game.css";

const SEAT_NAMES = ["You", "Detective Mustard", "Detective Plum"] as const;

function NotebookCell({
  mark,
  label,
  onClick,
  testId,
}: {
  mark: NoteMark;
  label: string;
  onClick: () => void;
  testId: string;
}): JSX.Element {
  const icon = mark === "U" ? "·" : mark === "X" ? "X" : "?";
  const cls = `cf-note cf-note-${mark}`;
  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      data-testid={testId}
      title={`${label} — cycle U/X/? mark`}
      aria-label={`${label} marked ${mark}`}
    >
      <span className="cf-note-label">{label}</span>
      <span className="cf-note-icon" aria-hidden="true">{icon}</span>
    </button>
  );
}

export function ClueFullGame({ state, dispatch, onGameOver }: GameProps<ClueFullState, ClueFullSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Drive the CPUs automatically: whenever it's not the human's turn and
  // we're not waiting on a reveal-from-human, queue a cpuStep.
  useEffect(() => {
    if (state.phase === "won" || state.phase === "lost") return;
    if (state.turn === 0) return;
    if (state.phase === "reveal") return;
    const id = window.setTimeout(() => {
      dispatch({ type: "cpuStep" } as ClueFullAction);
    }, 350);
    return () => window.clearTimeout(id);
  }, [state, dispatch]);

  const [pickedSuspect, setPickedSuspect] = useState<Suspect>(SUSPECTS[0]);
  const [pickedWeapon, setPickedWeapon] = useState<Weapon>(WEAPONS[0]);
  const [accuseMode, setAccuseMode] = useState(false);
  const [accuseRoom, setAccuseRoom] = useState<Room>(ROOMS[0]);

  const myRoom = state.positions[0];
  const partner = passagePartner(myRoom);
  const myTurn = state.turn === 0;

  const phaseLabel = useMemo(() => {
    switch (state.phase) {
      case "roll": return myTurn ? "Roll the die or take a secret passage." : `${SEAT_NAMES[state.turn]} is rolling…`;
      case "move": return myTurn ? `You rolled a ${state.lastRoll}. Pick a room.` : `${SEAT_NAMES[state.turn]} is moving…`;
      case "suggest": return myTurn ? "Make a suggestion (or accuse if you're sure)." : `${SEAT_NAMES[state.turn]} is making a suggestion…`;
      case "reveal": return state.revealFrom === 0
        ? `${SEAT_NAMES[state.turn]} suggests ${state.pendingSuggestion?.suspect}, ${state.pendingSuggestion?.weapon}, in the ${state.pendingSuggestion?.room}. Show one of your matching cards.`
        : `${SEAT_NAMES[state.revealFrom ?? 0]} is revealing a card…`;
      case "accuse": return myTurn ? "You may make a final accusation or end your turn." : `${SEAT_NAMES[state.turn]} is finishing their turn…`;
      case "won": return state.winnerSeat === 0 ? "You solved the murder!" : `${SEAT_NAMES[state.winnerSeat ?? 0]} solved it before you.`;
      case "lost": return "The mansion remains a mystery.";
    }
  }, [state, myTurn]);

  const lastForMe = useMemo(() => {
    // Only entries where the suggester is the human and a card was shown by someone else.
    return state.log.filter((e) => e.seat === 0 && e.shownCard !== null);
  }, [state.log]);

  return (
    <div className="cf-root fade-in" data-testid="clue-full-root">
      <header className="cf-header">
        <div className="cf-title">Clue: The Tudor Mansion</div>
        <div className="cf-status pulse" data-testid="clue-full-status">{phaseLabel}</div>
      </header>

      <div className="cf-grid">
        <section className="cf-board" aria-label="Mansion rooms">
          {ROOMS.map((r) => {
            const present: number[] = [];
            for (let i = 0; i < 3; i++) if (state.positions[i] === r) present.push(i);
            const reachable = state.phase === "move" && myTurn && state.movableTo.includes(r);
            return (
              <button
                key={r}
                type="button"
                className={`cf-room ${r === myRoom ? "cf-room-me" : ""} ${reachable ? "cf-room-reachable" : ""}`}
                onClick={() => reachable && dispatch({ type: "move", to: r } as ClueFullAction)}
                data-testid={`clue-full-move-${r.replace(/\s+/g, "-")}`}
                title={reachable ? `Move to ${r}` : r}
                aria-label={`Room ${r}${present.length ? ` (${present.map((s) => SEAT_NAMES[s]).join(", ")} here)` : ""}`}
                disabled={!reachable}
              >
                <div className="cf-room-name">{r}</div>
                <div className="cf-room-pawns">
                  {present.map((p) => (
                    <span key={p} className={`cf-pawn cf-pawn-${p}`} aria-hidden="true">●</span>
                  ))}
                </div>
              </button>
            );
          })}
        </section>

        <aside className="cf-side">
          <section className="cf-controls">
            <div className="cf-controls-row">
              <button
                type="button"
                className="cf-btn cf-btn-primary"
                disabled={!myTurn || state.phase !== "roll"}
                onClick={() => dispatch({ type: "roll" } as ClueFullAction)}
                data-testid="clue-full-roll"
                title="Roll the die"
              >
                Roll 1d6
              </button>
              <button
                type="button"
                className="cf-btn"
                disabled={!myTurn || state.phase !== "roll" || !partner}
                onClick={() => dispatch({ type: "passage" } as ClueFullAction)}
                data-testid="clue-full-passage"
                title={partner ? `Use the secret passage to the ${partner}` : "No secret passage here"}
              >
                {partner ? `Passage → ${partner}` : "No passage"}
              </button>
            </div>
            <div className="cf-controls-row">
              <label className="cf-pick" title="Suspect for suggestion/accusation">
                <span>Suspect</span>
                <select
                  value={pickedSuspect}
                  onChange={(e) => setPickedSuspect(e.target.value as Suspect)}
                  data-testid="clue-full-pick-suspect"
                  aria-label="Pick a suspect"
                >
                  {SUSPECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="cf-pick" title="Weapon for suggestion/accusation">
                <span>Weapon</span>
                <select
                  value={pickedWeapon}
                  onChange={(e) => setPickedWeapon(e.target.value as Weapon)}
                  data-testid="clue-full-pick-weapon"
                  aria-label="Pick a weapon"
                >
                  {WEAPONS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </label>
              {accuseMode ? (
                <label className="cf-pick" title="Room for accusation">
                  <span>Room</span>
                  <select
                    value={accuseRoom}
                    onChange={(e) => setAccuseRoom(e.target.value as Room)}
                    data-testid="clue-full-pick-room"
                    aria-label="Pick a room for the accusation"
                  >
                    {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
              ) : (
                <div className="cf-pick">
                  <span>Room</span>
                  <output className="cf-room-output" data-testid="clue-full-room-output">{myRoom}</output>
                </div>
              )}
            </div>
            <div className="cf-controls-row">
              {!accuseMode && (
                <button
                  type="button"
                  className="cf-btn cf-btn-primary"
                  disabled={!myTurn || state.phase !== "suggest"}
                  onClick={() =>
                    dispatch({
                      type: "suggest",
                      suspect: pickedSuspect,
                      weapon: pickedWeapon,
                    } as ClueFullAction)
                  }
                  data-testid="clue-full-suggest"
                  title="Make a suggestion: opponents reveal a matching card if they have one"
                >
                  Suggest
                </button>
              )}
              {!accuseMode && (
                <button
                  type="button"
                  className="cf-btn cf-btn-warn"
                  disabled={!myTurn || (state.phase !== "accuse" && state.phase !== "suggest")}
                  onClick={() => setAccuseMode(true)}
                  data-testid="clue-full-accuse-mode"
                  title="Lock in a final accusation"
                >
                  Accuse…
                </button>
              )}
              {accuseMode && (
                <>
                  <button
                    type="button"
                    className="cf-btn cf-btn-warn"
                    onClick={() => {
                      setAccuseMode(false);
                      dispatch({
                        type: "accuse",
                        suspect: pickedSuspect,
                        weapon: pickedWeapon,
                        room: accuseRoom,
                      } as ClueFullAction);
                    }}
                    data-testid="clue-full-accuse"
                    title="Submit the accusation (game ends)"
                  >
                    Confirm accusation
                  </button>
                  <button
                    type="button"
                    className="cf-btn"
                    onClick={() => setAccuseMode(false)}
                    data-testid="clue-full-accuse-cancel"
                    title="Cancel the accusation"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                type="button"
                className="cf-btn"
                disabled={!myTurn || (state.phase !== "accuse" && state.phase !== "suggest")}
                onClick={() => dispatch({ type: "endTurn" } as ClueFullAction)}
                data-testid="clue-full-end-turn"
                title="End your turn"
              >
                End turn
              </button>
            </div>
            {state.phase === "reveal" && state.revealFrom === 0 && (
              <div className="cf-reveal-panel">
                <div className="cf-reveal-prompt">Reveal a card to the suggester:</div>
                <div className="cf-reveal-row">
                  {state.revealOptions.map((c) => (
                    <button
                      key={`${c.kind}-${c.value}`}
                      type="button"
                      className="cf-btn cf-btn-card"
                      onClick={() => dispatch({ type: "reveal", card: c } as ClueFullAction)}
                      data-testid={`clue-full-reveal-${c.kind}-${c.value.replace(/\s+/g, "-")}`}
                      title={`Show your ${c.value} card`}
                    >
                      {c.value}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="cf-notebook" aria-label="Detective notebook">
            <h3>Notebook</h3>
            <div className="cf-note-group">
              <h4>Suspects</h4>
              {SUSPECTS.map((s) => (
                <NotebookCell
                  key={s}
                  label={s}
                  mark={state.notebook.suspects[s]}
                  testId={`clue-full-note-suspect-${s.replace(/\s+/g, "-")}`}
                  onClick={() => dispatch({ type: "noteToggle", kind: "suspect", value: s } as ClueFullAction)}
                />
              ))}
            </div>
            <div className="cf-note-group">
              <h4>Weapons</h4>
              {WEAPONS.map((w) => (
                <NotebookCell
                  key={w}
                  label={w}
                  mark={state.notebook.weapons[w]}
                  testId={`clue-full-note-weapon-${w.replace(/\s+/g, "-")}`}
                  onClick={() => dispatch({ type: "noteToggle", kind: "weapon", value: w } as ClueFullAction)}
                />
              ))}
            </div>
            <div className="cf-note-group">
              <h4>Rooms</h4>
              {ROOMS.map((r) => (
                <NotebookCell
                  key={r}
                  label={r}
                  mark={state.notebook.rooms[r]}
                  testId={`clue-full-note-room-${r.replace(/\s+/g, "-")}`}
                  onClick={() => dispatch({ type: "noteToggle", kind: "room", value: r } as ClueFullAction)}
                />
              ))}
            </div>
          </section>

          <section className="cf-hand" aria-label="Your hand">
            <h3>Your cards</h3>
            <div className="cf-hand-row">
              {state.hands[0].map((c: Card, i) => (
                <span key={i} className={`cf-card cf-card-${c.kind}`}>{c.value}</span>
              ))}
            </div>
          </section>

          <section className="cf-log" aria-label="Game log">
            <h3>Recent shown to you</h3>
            <ol>
              {lastForMe.slice(-6).map((e, i) => (
                <li key={i}>
                  {`Sug. ${e.suggestion.suspect} / ${e.suggestion.weapon} / ${e.suggestion.room} — `}
                  {e.byPlayer === null
                    ? <em>nobody refuted</em>
                    : <strong>{e.shownCard ? `${SEAT_NAMES[e.byPlayer]} showed you ${e.shownCard.value}` : `${SEAT_NAMES[e.byPlayer]} refuted`}</strong>}
                </li>
              ))}
              {lastForMe.length === 0 && <li><em>No suggestions yet.</em></li>}
            </ol>
          </section>
        </aside>
      </div>

      {(state.phase === "won" || state.phase === "lost") && (
        <div className="cf-end bounce-in" data-testid="clue-full-end">
          <div className="cf-end-title">
            {state.phase === "won" ? "Case closed!" : "Mystery unsolved."}
          </div>
          <div className="cf-end-sub">
            Envelope: {state.envelope.suspect} · {state.envelope.weapon} · {state.envelope.room}
          </div>
          <div className="cf-end-score">
            Score: <strong>{state.finalScore ?? 0}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

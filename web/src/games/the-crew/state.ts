import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type CrewColor = "red" | "yellow" | "green" | "blue";
export type TrumpColor = "rocket";
export const CREW_COLORS: CrewColor[] = ["red", "yellow", "green", "blue"];

export interface CrewCard {
  id: number;
  color: CrewColor | TrumpColor;
  value: number;
}

export interface Task {
  card: CrewCard;
  assignedTo: number; // player index who must win it
  completed: boolean;
}

export interface Trick {
  led: CrewColor | TrumpColor | null;
  plays: Array<{ player: number; card: CrewCard } | null>; // index = player
  winner: number | null;
}

export interface CrewState {
  hands: CrewCard[][]; // [player, bot1, bot2, bot3]
  tasks: Task[];
  tricks: Trick[];
  currentTrick: Trick;
  turnInTrick: number; // whose turn to play next in current trick
  leader: number; // who leads each trick
  won: boolean;
  lost: boolean;
  score: number;
  log: string[];
}

export type CrewAction = { type: "playCard"; cardId: number };

function buildDeck(rng: () => number): CrewCard[] {
  const cards: CrewCard[] = [];
  let id = 0;
  // 4 colors × 9 values
  for (const color of CREW_COLORS) {
    for (let v = 1; v <= 9; v++) {
      cards.push({ id: id++, color, value: v });
    }
  }
  // 4 rockets (trump) values 1-4
  for (let v = 1; v <= 4; v++) {
    cards.push({ id: id++, color: "rocket", value: v });
  }
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

function cardBeats(challenger: CrewCard, incumbent: CrewCard, led: CrewColor | TrumpColor): boolean {
  // Rocket (trump) beats non-rocket
  if (challenger.color === "rocket" && incumbent.color !== "rocket") return true;
  if (incumbent.color === "rocket" && challenger.color !== "rocket") return false;
  // Both same suit
  if (challenger.color === incumbent.color) return challenger.value > incumbent.value;
  // Challenger didn't follow suit and isn't trump
  return false;
}

function trickWinner(trick: Trick): number {
  const plays = trick.plays.filter(Boolean) as { player: number; card: CrewCard }[];
  if (plays.length === 0) return 0;
  let best = plays[0]!;
  for (const play of plays.slice(1)) {
    if (cardBeats(play.card, best.card, trick.led!)) best = play;
  }
  return best.player;
}

function botChooseCard(hand: CrewCard[], trick: Trick): CrewCard {
  const led = trick.led;
  if (led) {
    // Follow suit if possible
    const suitCards = hand.filter(c => c.color === led);
    if (suitCards.length > 0) {
      // Play highest in suit
      return suitCards.sort((a, b) => b.value - a.value)[0]!;
    }
  }
  // Play lowest non-trump
  const nonTrump = hand.filter(c => c.color !== "rocket");
  if (nonTrump.length > 0) return nonTrump.sort((a, b) => a.value - b.value)[0]!;
  return hand.sort((a, b) => a.value - b.value)[0]!;
}

function runBots(state: CrewState): CrewState {
  let s = state;
  while (!s.won && !s.lost && s.turnInTrick !== 0) {
    s = botPlay(s);
  }
  return s;
}

function botPlay(state: CrewState): CrewState {
  const playerIdx = state.turnInTrick;
  const hand = state.hands[playerIdx]!;
  const card = botChooseCard(hand, state.currentTrick);
  return applyPlayCard(state, playerIdx, card.id);
}

function applyPlayCard(state: CrewState, playerIdx: number, cardId: number): CrewState {
  const hand = state.hands[playerIdx]!;
  const cardIdx = hand.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return state;
  const card = hand[cardIdx]!;
  const newHand = hand.filter((_, i) => i !== cardIdx);
  const hands = state.hands.map((h, i) => i === playerIdx ? newHand : h);

  const plays = [...state.currentTrick.plays];
  plays[playerIdx] = { player: playerIdx, card };
  const led = state.currentTrick.led ?? (card.color as CrewColor | TrumpColor);
  const newTrick: Trick = { ...state.currentTrick, plays, led };

  const allPlayed = plays.filter(Boolean).length === 4;
  const log = [...state.log, `P${playerIdx} played ${card.color} ${card.value}`];

  if (!allPlayed) {
    // Next player
    const nextTurn = ((playerIdx + 1) % 4) as CrewState["turnInTrick"];
    return { ...state, hands, currentTrick: newTrick, turnInTrick: nextTurn, log };
  }

  // Trick complete
  const winner = trickWinner(newTrick);
  const completedTrick: Trick = { ...newTrick, winner };
  const tricks = [...state.tricks, completedTrick];

  // Check tasks completed
  const tasks = state.tasks.map(task => {
    if (task.completed) return task;
    const taskPlay = completedTrick.plays.find(p => p?.card.id === task.card.id);
    if (taskPlay && taskPlay.player === task.assignedTo && winner === task.assignedTo) {
      return { ...task, completed: true };
    }
    // Task failed if wrong player won it
    return task;
  });

  // Check loss: any task card won by wrong player
  let lost = false;
  for (const task of tasks) {
    if (!task.completed) {
      const taskPlay = completedTrick.plays.find(p => p?.card.id === task.card.id);
      if (taskPlay && winner !== task.assignedTo) {
        lost = true;
        break;
      }
    }
  }

  const won = tasks.every(t => t.completed);
  const score = won ? 100 : 0;

  const nextLeader = winner;
  const newCurrentTrick: Trick = { led: null, plays: [null, null, null, null], winner: null };

  log.push(`Trick won by P${winner}`);
  if (won) log.push("Mission complete!");
  if (lost) log.push("Mission failed!");

  return {
    ...state,
    hands,
    tasks,
    tricks,
    currentTrick: newCurrentTrick,
    turnInTrick: nextLeader as CrewState["turnInTrick"],
    leader: nextLeader,
    won,
    lost,
    score,
    log,
  };
}

export function initialState(seed: number): CrewState {
  const rng = mulberry32(seed);
  const deck = buildDeck(rng);

  // Deal 10 cards to each of 4 players (ignore remaining if any)
  const hands: CrewCard[][] = [[], [], [], []];
  for (let i = 0; i < 40; i++) {
    hands[i % 4]!.push(deck[i]!);
  }

  // Pick one task: a random card in player 0's hand
  const taskCardIdx = Math.floor(rng() * hands[0]!.length);
  const taskCard = hands[0]![taskCardIdx]!;
  const tasks: Task[] = [{ card: taskCard, assignedTo: 0, completed: false }];

  // Who leads: holder of rocket 4 leads (or player 0 if no one has it)
  const rocket4Holder = hands.findIndex(h => h.some(c => c.color === "rocket" && c.value === 4));
  const leader = rocket4Holder === -1 ? 0 : rocket4Holder;

  return {
    hands,
    tasks,
    tricks: [],
    currentTrick: { led: null, plays: [null, null, null, null], winner: null },
    turnInTrick: leader,
    leader,
    won: false,
    lost: false,
    score: 0,
    log: [`Mission: P0 must win ${taskCard.color} ${taskCard.value}. P${leader} leads.`],
  };
}

export function reducer(state: CrewState, action: CrewAction): CrewState {
  if (state.won || state.lost) return state;
  if (state.turnInTrick !== 0) return state;

  if (action.type !== "playCard") return state;

  const hand = state.hands[0]!;
  const card = hand.find(c => c.id === action.cardId);
  if (!card) return state;

  // Must follow suit if possible
  const led = state.currentTrick.led;
  if (led) {
    const hasSuit = hand.some(c => c.color === led);
    if (hasSuit && card.color !== led) return state; // must follow suit
  }

  const next = applyPlayCard(state, 0, action.cardId);
  return runBots(next);
}

export function isTerminal(state: CrewState): { score: number } | null {
  if (state.won) return { score: 100 };
  if (state.lost) return { score: 0 };
  return null;
}

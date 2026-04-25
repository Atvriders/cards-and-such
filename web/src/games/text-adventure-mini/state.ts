import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Node {
  id: string;
  text: string;
  choices: { label: string; next: string; scoreAdd?: number }[];
  terminal?: boolean;
  score?: number;
}

const NODES: Record<string, Node> = {
  start: {
    id: "start",
    text: "You stand at the entrance of a dark forest. A sign reads: 'Abandon hope'. Do you enter or turn back?",
    choices: [
      { label: "Enter the forest", next: "forest_path" },
      { label: "Turn back to town", next: "town" },
    ],
  },
  town: {
    id: "town",
    text: "You return to town and find a merchant selling a map to treasure. He wants 10 gold.",
    choices: [
      { label: "Buy the map (10g)", next: "map_bought" },
      { label: "Steal the map", next: "caught_stealing" },
      { label: "Head back to the forest", next: "forest_path" },
    ],
  },
  map_bought: {
    id: "map_bought",
    text: "The map leads to an old ruin on the cliff. You arrive at sunset. A locked gate blocks the way.",
    choices: [
      { label: "Pick the lock", next: "inside_ruin" },
      { label: "Climb over the wall", next: "ruin_wall" },
    ],
  },
  caught_stealing: {
    id: "caught_stealing",
    text: "The merchant grabs your wrist and calls the guards. You spend the night in jail and are fined 20 gold.",
    choices: [
      { label: "Accept punishment and leave town", next: "forest_path" },
    ],
  },
  forest_path: {
    id: "forest_path",
    text: "Deep in the forest you find a fork: left leads to the sound of water, right leads to smoke rising from trees.",
    choices: [
      { label: "Go left (water)", next: "river" },
      { label: "Go right (smoke)", next: "campfire" },
    ],
  },
  river: {
    id: "river",
    text: "A river blocks your path. A ferryman will take you across for a riddle answer. 'What runs but has no legs?'",
    choices: [
      { label: "Answer: Water", next: "river_cross", scoreAdd: 10 },
      { label: "Answer: Time", next: "river_wrong" },
      { label: "Swim across", next: "river_swim" },
    ],
  },
  river_cross: {
    id: "river_cross",
    text: "Correct! The ferryman smiles and takes you across. Beyond lies a hidden shrine.",
    choices: [
      { label: "Enter the shrine", next: "shrine" },
    ],
  },
  river_wrong: {
    id: "river_wrong",
    text: "The ferryman shakes his head but still takes you across, impressed by your confidence.",
    choices: [
      { label: "Continue to the shrine", next: "shrine" },
    ],
  },
  river_swim: {
    id: "river_swim",
    text: "You swim across and lose your pack. But on the far shore you spot the shrine.",
    choices: [
      { label: "Enter the shrine", next: "shrine" },
    ],
  },
  campfire: {
    id: "campfire",
    text: "You find a camp of outlaws. Their leader offers you a cut of stolen gold if you join them.",
    choices: [
      { label: "Join the outlaws", next: "outlaw_join" },
      { label: "Refuse and report them", next: "outlaw_report" },
      { label: "Sneak past camp", next: "ruins_entrance" },
    ],
  },
  outlaw_join: {
    id: "outlaw_join",
    text: "You raid a merchant convoy and earn 50 gold. But soldiers track you to a mountain hideout.",
    choices: [
      { label: "Fight the soldiers", next: "dead_outlaw" },
      { label: "Surrender and plead mercy", next: "pardoned" },
    ],
  },
  dead_outlaw: {
    id: "dead_outlaw",
    text: "Outnumbered, you fall in battle. Your story ends here.",
    choices: [],
    terminal: true,
    score: 20,
  },
  pardoned: {
    id: "pardoned",
    text: "You are pardoned for revealing the outlaw hideout. You return to town a free person — and richer by 30 gold.",
    choices: [],
    terminal: true,
    score: 55,
  },
  outlaw_report: {
    id: "outlaw_report",
    text: "The soldiers reward you with a map to the nearby ruins. The outlaws are captured.",
    choices: [
      { label: "Head to the ruins", next: "ruins_entrance" },
    ],
  },
  ruins_entrance: {
    id: "ruins_entrance",
    text: "You reach ancient ruins. Inside, two doors: one sealed with a dragon crest, one with a moon crest.",
    choices: [
      { label: "Dragon door", next: "dragon_door" },
      { label: "Moon door", next: "moon_door" },
    ],
  },
  dragon_door: {
    id: "dragon_door",
    text: "Behind the dragon door, a sleeping wyvern guards a chest. It stirs as you enter.",
    choices: [
      { label: "Sneak past to the chest", next: "chest_success" },
      { label: "Wake and fight it", next: "wyvern_fight" },
      { label: "Back away quietly", next: "moon_door" },
    ],
  },
  wyvern_fight: {
    id: "wyvern_fight",
    text: "The wyvern breathes fire! You dodge but take a wound. In the struggle you defeat it.",
    choices: [
      { label: "Take the chest", next: "chest_success" },
    ],
  },
  moon_door: {
    id: "moon_door",
    text: "The moon door reveals a library of ancient scrolls. You learn a spell of revealing — and spot a hidden door.",
    choices: [
      { label: "Open the hidden door", next: "chest_success" },
      { label: "Study the scrolls", next: "scholar_end" },
    ],
  },
  scholar_end: {
    id: "scholar_end",
    text: "You spend days reading. The knowledge is priceless. You return home a scholar of the ancient arts.",
    choices: [],
    terminal: true,
    score: 70,
  },
  chest_success: {
    id: "chest_success",
    text: "Inside the chest: a crown of starlight and a note — 'Heir to the Forgotten Throne'. Your adventure begins!",
    choices: [],
    terminal: true,
    score: 100,
  },
  inside_ruin: {
    id: "inside_ruin",
    text: "You pick the lock expertly. Inside the ruin a spirit guardian challenges you to a game of riddles.",
    choices: [
      { label: "Accept the challenge", next: "riddle_game" },
      { label: "Flee", next: "ruin_flee" },
    ],
  },
  ruin_wall: {
    id: "ruin_wall",
    text: "You scale the wall but fall, injuring your ankle. You hobble inside the ruin.",
    choices: [
      { label: "Press on to the inner chamber", next: "ruins_entrance" },
    ],
  },
  riddle_game: {
    id: "riddle_game",
    text: "The spirit asks: 'I have cities, but no houses live there. I have mountains, but no trees grow. What am I?'",
    choices: [
      { label: "A map", next: "riddle_win", scoreAdd: 15 },
      { label: "A painting", next: "riddle_lose" },
    ],
  },
  riddle_win: {
    id: "riddle_win",
    text: "Correct! The spirit dissolves revealing a passage to the treasure vault.",
    choices: [
      { label: "Enter the vault", next: "chest_success" },
    ],
  },
  riddle_lose: {
    id: "riddle_lose",
    text: "Wrong! The spirit sends you flying out of the ruins. You land safely outside.",
    choices: [
      { label: "Try the forest path instead", next: "forest_path" },
    ],
  },
  shrine: {
    id: "shrine",
    text: "The shrine holds an ancient sword that pulses with light. A voice says: 'Only the worthy may claim this.'",
    choices: [
      { label: "Take the sword", next: "sword_claimed" },
      { label: "Kneel and offer a prayer", next: "shrine_blessed" },
      { label: "Leave it undisturbed", next: "forest_path" },
    ],
  },
  sword_claimed: {
    id: "sword_claimed",
    text: "Your hand burns as you grab the sword — then cool clarity. You feel unstoppable. You emerge a hero.",
    choices: [],
    terminal: true,
    score: 90,
  },
  shrine_blessed: {
    id: "shrine_blessed",
    text: "The shrine blesses you with visions of the ruin's layout. You know every trap. You reach the treasure easily.",
    choices: [
      { label: "Claim the treasure", next: "chest_success" },
    ],
  },
  ruin_flee: {
    id: "ruin_flee",
    text: "You flee in panic and get lost in the forest for three days before finding your way home. Adventure over.",
    choices: [],
    terminal: true,
    score: 10,
  },
};

export interface TextAdventureState {
  nodeId: string;
  scoreBonus: number;
  visitedIds: readonly string[];
  phase: "playing" | "done";
}

export type TextAdventureAction =
  | { type: "choose"; nextId: string; scoreAdd: number };

export function initialState(_seed: number): TextAdventureState {
  return {
    nodeId: "start",
    scoreBonus: 0,
    visitedIds: ["start"],
    phase: "playing",
  };
}

export function getNode(id: string): Node {
  return NODES[id] ?? NODES["start"]!;
}

export function reducer(state: TextAdventureState, action: TextAdventureAction): TextAdventureState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "choose": {
      const node = getNode(action.nextId);
      const isTerminalNode = node.terminal || node.choices.length === 0;
      return {
        ...state,
        nodeId: action.nextId,
        scoreBonus: state.scoreBonus + (action.scoreAdd || 0),
        visitedIds: [...state.visitedIds, action.nextId],
        phase: isTerminalNode ? "done" : "playing",
      };
    }
  }
}

export function isTerminal(state: TextAdventureState): { score: number } | null {
  if (state.phase !== "done") return null;
  const node = getNode(state.nodeId);
  const base = node.score ?? 0;
  return { score: Math.min(100, base + state.scoreBonus) };
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HorrorNode {
  id: string;
  title: string;
  text: string;
  choices: { label: string; next: string; scoreAdd?: number }[];
  score?: number;
}

const NODES: Record<string, HorrorNode> = {
  start: {
    id: "start", title: "Stranded",
    text: "Your car breaks down outside the Ravenwood Manor on a stormy night. You see a light in the manor window. Your phone is dead. Do you approach the manor or shelter in your car?",
    choices: [
      { label: "Walk to the manor", next: "manor_door" },
      { label: "Stay in the car", next: "car_shelter" },
    ],
  },
  car_shelter: {
    id: "car_shelter", title: "Something Scratches",
    text: "You lock the doors. Scratching sounds come from the roof. A pale hand slaps against the window. The scratching moves to the door handle.",
    choices: [
      { label: "Honk the horn repeatedly", next: "horn_honk" },
      { label: "Run to the manor", next: "manor_door" },
      { label: "Stay perfectly still", next: "still_wait" },
    ],
  },
  horn_honk: {
    id: "horn_honk", title: "Lights On",
    text: "The horn echoes. Lights flicker on in the manor. The scratching stops. A figure with a lantern walks toward you — an old groundskeeper.",
    choices: [
      { label: "Follow the groundskeeper inside", next: "groundskeeper" },
    ],
  },
  still_wait: {
    id: "still_wait", title: "Gone",
    text: "After ten minutes the sounds stop. You fall asleep. You wake at dawn — safe, but no memory of the night. You drive away unsettled but alive.",
    choices: [],
    score: 50,
  },
  manor_door: {
    id: "manor_door", title: "The Entrance",
    text: "The door swings open on its own. Inside: a grand hall with a sweeping staircase. A journal on the table reads: 'Do not open the east wing.'",
    choices: [
      { label: "Go upstairs", next: "upstairs" },
      { label: "Open the east wing door", next: "east_wing" },
      { label: "Read more of the journal", next: "journal" },
    ],
  },
  groundskeeper: {
    id: "groundskeeper", title: "Old Malcolm",
    text: "Malcolm ushers you inside. He warns you: the manor is haunted by the Blackwood family — and their anger grows at midnight. You have one hour.",
    choices: [
      { label: "Ask how to stop the haunting", next: "ritual_info" },
      { label: "Find a place to hide until dawn", next: "hiding" },
    ],
  },
  ritual_info: {
    id: "ritual_info", title: "The Ritual",
    text: "Malcolm explains: burn the family portrait in the fireplace and speak the release words. But the portrait hangs in the east wing.",
    choices: [
      { label: "Head to the east wing with Malcolm", next: "east_ritual" },
    ],
  },
  hiding: {
    id: "hiding", title: "The Cellar",
    text: "Malcolm leads you to a fortified cellar. Midnight passes — screaming above, then silence. At dawn you emerge. The manor is quiet but unchanged.",
    choices: [],
    score: 55,
  },
  east_ritual: {
    id: "east_ritual", title: "Portrait Burns",
    text: "You find the portrait. Malcolm speaks the ancient words as you hold a torch to the canvas. The manor shudders. Then — peace. You have freed the Blackwood spirits.",
    choices: [],
    score: 100,
  },
  journal: {
    id: "journal", title: "The Warning",
    text: "The journal belongs to the last servant: 'The spirit only leaves if you find the locket in the library and place it on the altar in the chapel.' You now have a plan.",
    choices: [
      { label: "Find the library", next: "library" },
      { label: "Go upstairs first", next: "upstairs" },
    ],
  },
  library: {
    id: "library", title: "Books and Bones",
    text: "The library is dark. Books fly off shelves. You find the locket — but a shadow figure blocks the doorway.",
    choices: [
      { label: "Rush past the shadow", next: "chapel", scoreAdd: 5 },
      { label: "Speak calmly to it", next: "shadow_speak" },
      { label: "Hide behind a bookshelf", next: "library_hide" },
    ],
  },
  shadow_speak: {
    id: "shadow_speak", title: "The Lost Child",
    text: "The shadow is a child ghost. She points toward the chapel. She wants to be free.",
    choices: [
      { label: "Follow her to the chapel", next: "chapel", scoreAdd: 10 },
    ],
  },
  library_hide: {
    id: "library_hide", title: "Passed By",
    text: "The shadow passes without noticing you. You slip out and head to the chapel.",
    choices: [
      { label: "Go to the chapel", next: "chapel" },
    ],
  },
  chapel: {
    id: "chapel", title: "The Altar",
    text: "You place the locket on the stone altar. The manor groans. Wind howls through every room. Then absolute silence. The haunting is broken.",
    choices: [],
    score: 90,
  },
  upstairs: {
    id: "upstairs", title: "The Upper Hall",
    text: "A music box plays on its own in one room. A locked door creaks in another. Shadows move at the far end of the hall.",
    choices: [
      { label: "Open the music box room", next: "music_room" },
      { label: "Investigate the locked door", next: "locked_door" },
      { label: "Follow the shadows", next: "shadow_follow" },
    ],
  },
  music_room: {
    id: "music_room", title: "The Dancer",
    text: "A ballerina figure spins inside the box. As you watch, the music slows and stops. A whisper: 'Thank you.' The spirit departs.",
    choices: [],
    score: 70,
  },
  locked_door: {
    id: "locked_door", title: "Master Bedroom",
    text: "You kick open the door. Inside, a ghost in Victorian dress stares from a mirror. She screams — you are thrown back and wake up outside on the lawn.",
    choices: [],
    score: 30,
  },
  shadow_follow: {
    id: "shadow_follow", title: "Into the Attic",
    text: "The shadows lead you to an attic. There a treasure chest holds old letters — proof the Blackwood family was wrongly accused of murder. Publishing this truth will free their spirits.",
    choices: [],
    score: 80,
  },
  east_wing: {
    id: "east_wing", title: "The East Wing",
    text: "The east wing is freezing. Every painting watches you. A door at the far end glows with red light.",
    choices: [
      { label: "Open the glowing door", next: "ritual_chamber" },
      { label: "Turn back to the hall", next: "manor_door" },
    ],
  },
  ritual_chamber: {
    id: "ritual_chamber", title: "The Ritual Chamber",
    text: "Inside: a pentagram on the floor, candles burning, and a figure in robes chanting. You startle them — they reveal they were trying to contain the spirit, not summon it. They need your help.",
    choices: [
      { label: "Help complete the containment ritual", next: "east_ritual" },
      { label: "Run from this madness", next: "upstairs" },
    ],
  },
};

export interface CyoaHorrorState {
  nodeId: string;
  scoreBonus: number;
  steps: number;
  phase: "playing" | "done";
}

export type CyoaHorrorAction = { type: "choose"; nextId: string; scoreAdd: number };

export function initialState(_seed: number): CyoaHorrorState {
  return { nodeId: "start", scoreBonus: 0, steps: 0, phase: "playing" };
}

export function getNode(id: string): HorrorNode {
  return NODES[id] ?? NODES["start"]!;
}

export function reducer(state: CyoaHorrorState, action: CyoaHorrorAction): CyoaHorrorState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "choose": {
      const node = getNode(action.nextId);
      const done = node.choices.length === 0;
      return {
        ...state,
        nodeId: action.nextId,
        scoreBonus: state.scoreBonus + (action.scoreAdd || 0),
        steps: state.steps + 1,
        phase: done ? "done" : "playing",
      };
    }
  }
}

export function isTerminal(state: CyoaHorrorState): { score: number } | null {
  if (state.phase !== "done") return null;
  const node = getNode(state.nodeId);
  return { score: Math.min(100, (node.score ?? 0) + state.scoreBonus) };
}

void mulberry32;

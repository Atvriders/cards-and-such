import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GreekMythQuizSettings { questions: "10" | "20" | "30"; }
export interface GreekMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GreekMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who is the king of the Olympian gods?",
    "choices": [
      "Zeus",
      "Poseidon",
      "Hades",
      "Apollo"
    ],
    "correct": 0
  },
  {
    "question": "Which hero completed the Twelve Labors?",
    "choices": [
      "Theseus",
      "Heracles",
      "Perseus",
      "Achilles"
    ],
    "correct": 1
  },
  {
    "question": "Who is the Greek goddess of wisdom?",
    "choices": [
      "Hera",
      "Aphrodite",
      "Athena",
      "Artemis"
    ],
    "correct": 2
  },
  {
    "question": "Who flew too close to the sun?",
    "choices": [
      "Daedalus",
      "Icarus",
      "Bellerophon",
      "Phaeton"
    ],
    "correct": 1
  },
  {
    "question": "Which monster had snakes for hair?",
    "choices": [
      "Chimera",
      "Medusa",
      "Hydra",
      "Sphinx"
    ],
    "correct": 1
  },
  {
    "question": "Who was the messenger god?",
    "choices": [
      "Hermes",
      "Apollo",
      "Ares",
      "Dionysus"
    ],
    "correct": 0
  },
  {
    "question": "What was the home of the Olympian gods?",
    "choices": [
      "Mount Olympus",
      "Mount Ida",
      "Mount Pelion",
      "Mount Etna"
    ],
    "correct": 0
  },
  {
    "question": "Who killed the Minotaur?",
    "choices": [
      "Heracles",
      "Perseus",
      "Theseus",
      "Jason"
    ],
    "correct": 2
  },
  {
    "question": "Who was the goddess of love?",
    "choices": [
      "Hera",
      "Aphrodite",
      "Demeter",
      "Hestia"
    ],
    "correct": 1
  },
  {
    "question": "Who guarded the underworld with three heads?",
    "choices": [
      "Cerberus",
      "Ladon",
      "Argus",
      "Typhon"
    ],
    "correct": 0
  },
  {
    "question": "Who turned everything he touched into gold?",
    "choices": [
      "Sisyphus",
      "Tantalus",
      "Midas",
      "Croesus"
    ],
    "correct": 2
  },
  {
    "question": "Which goddess sprung fully grown from Zeus's head?",
    "choices": [
      "Aphrodite",
      "Athena",
      "Artemis",
      "Hera"
    ],
    "correct": 1
  },
  {
    "question": "Who was the Titan that held up the sky?",
    "choices": [
      "Prometheus",
      "Atlas",
      "Cronus",
      "Hyperion"
    ],
    "correct": 1
  },
  {
    "question": "What musical instrument did Orpheus famously play?",
    "choices": [
      "Flute",
      "Lyre",
      "Harp",
      "Pipes"
    ],
    "correct": 1
  },
  {
    "question": "Who is the god of the sea?",
    "choices": [
      "Zeus",
      "Hades",
      "Poseidon",
      "Apollo"
    ],
    "correct": 2
  },
  {
    "question": "What kind of creature was Pegasus?",
    "choices": [
      "Lion",
      "Horse",
      "Eagle",
      "Bull"
    ],
    "correct": 1
  },
  {
    "question": "Who led the Argonauts in search of the Golden Fleece?",
    "choices": [
      "Theseus",
      "Achilles",
      "Jason",
      "Heracles"
    ],
    "correct": 2
  },
  {
    "question": "Who was the goddess of the hunt?",
    "choices": [
      "Athena",
      "Artemis",
      "Demeter",
      "Persephone"
    ],
    "correct": 1
  },
  {
    "question": "What woman's face launched a thousand ships?",
    "choices": [
      "Helen",
      "Cassandra",
      "Andromache",
      "Penelope"
    ],
    "correct": 0
  },
  {
    "question": "Who was the wife of Zeus?",
    "choices": [
      "Demeter",
      "Hera",
      "Hestia",
      "Leto"
    ],
    "correct": 1
  },
  {
    "question": "Who solved the riddle of the Sphinx?",
    "choices": [
      "Perseus",
      "Oedipus",
      "Theseus",
      "Bellerophon"
    ],
    "correct": 1
  },
  {
    "question": "Which creature was half-man, half-horse?",
    "choices": [
      "Centaur",
      "Satyr",
      "Faun",
      "Minotaur"
    ],
    "correct": 0
  },
  {
    "question": "Who tricked Hades and was punished to roll a boulder forever?",
    "choices": [
      "Tantalus",
      "Sisyphus",
      "Prometheus",
      "Ixion"
    ],
    "correct": 1
  },
  {
    "question": "Who fought Hector outside the walls of Troy?",
    "choices": [
      "Achilles",
      "Odysseus",
      "Ajax",
      "Diomedes"
    ],
    "correct": 0
  },
  {
    "question": "Who was the hero of the Odyssey?",
    "choices": [
      "Achilles",
      "Odysseus",
      "Hector",
      "Paris"
    ],
    "correct": 1
  },
  {
    "question": "Who was the god of war?",
    "choices": [
      "Apollo",
      "Ares",
      "Hermes",
      "Hephaestus"
    ],
    "correct": 1
  },
  {
    "question": "Who opened a jar releasing all evils into the world?",
    "choices": [
      "Eve",
      "Pandora",
      "Psyche",
      "Ariadne"
    ],
    "correct": 1
  },
  {
    "question": "What were the three sisters of Fate called?",
    "choices": [
      "Furies",
      "Muses",
      "Moirai",
      "Horae"
    ],
    "correct": 2
  },
  {
    "question": "Who was the mortal mother of Heracles?",
    "choices": [
      "Alcmene",
      "Danae",
      "Leda",
      "Semele"
    ],
    "correct": 0
  },
  {
    "question": "Who built the Trojan horse plan?",
    "choices": [
      "Achilles",
      "Odysseus",
      "Agamemnon",
      "Menelaus"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GreekMythQuizSettings): GreekMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GreekMythQuizState, action: GreekMythQuizAction): GreekMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GreekMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

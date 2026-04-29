import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TeeKoQuizSettings { questions: "10"; }
export interface TeeKoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TeeKoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tee K.O. challenges players to design what?",
    "choices": [
      "T-shirts",
      "Pants",
      "Houses",
      "Spaceships"
    ],
    "correct": 0
  },
  {
    "question": "Tee K.O. uses what player input devices?",
    "choices": [
      "Phones to draw and write",
      "Console pads",
      "Joycons",
      "Stylus tablets only"
    ],
    "correct": 0
  },
  {
    "question": "Tee K.O. combines which two assets?",
    "choices": [
      "Drawings and slogans",
      "Maps and dice",
      "Voices and music",
      "Photos and text"
    ],
    "correct": 0
  },
  {
    "question": "Tee K.O. is in which Jackbox pack?",
    "choices": [
      "Party Pack 3",
      "Pack 1",
      "Pack 7",
      "Pack 10"
    ],
    "correct": 0
  },
  {
    "question": "How are winners determined in Tee K.O.?",
    "choices": [
      "Audience votes between matchups",
      "Solo timer",
      "Highest dice",
      "Drawing accuracy"
    ],
    "correct": 0
  },
  {
    "question": "After matchups, winners advance to?",
    "choices": [
      "Bracket finals",
      "Auction phase",
      "Co-op level",
      "Map mode"
    ],
    "correct": 0
  },
  {
    "question": "Tee K.O. plays well with how many?",
    "choices": [
      "1",
      "Solo only",
      "3-8",
      "30+"
    ],
    "correct": 2
  },
  {
    "question": "Tee K.O. publisher is?",
    "choices": [
      "Jackbox Games",
      "Hasbro",
      "USAopoly",
      "WotC"
    ],
    "correct": 0
  },
  {
    "question": "Tee K.O. drawings are scrambled with?",
    "choices": [
      "Other player's slogans",
      "AI captions",
      "Pre-set phrases only",
      "Random math"
    ],
    "correct": 0
  },
  {
    "question": "Tee K.O. encourages what kind of art?",
    "choices": [
      "Quick, weird, funny",
      "Photo-real",
      "Calligraphy only",
      "Vector design"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TeeKoQuizSettings): TeeKoQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TeeKoQuizState, action: TeeKoQuizAction): TeeKoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TeeKoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

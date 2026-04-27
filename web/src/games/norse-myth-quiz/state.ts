import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NorseMythQuizSettings { questions: "10" | "20" | "30"; }
export interface NorseMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NorseMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who is the chief of the Norse gods?",
    "choices": [
      "Thor",
      "Odin",
      "Loki",
      "Tyr"
    ],
    "correct": 1
  },
  {
    "question": "What is Thor's hammer called?",
    "choices": [
      "Gungnir",
      "Mjolnir",
      "Gram",
      "Skofnung"
    ],
    "correct": 1
  },
  {
    "question": "Who is the trickster god?",
    "choices": [
      "Odin",
      "Loki",
      "Heimdall",
      "Freyr"
    ],
    "correct": 1
  },
  {
    "question": "What is the doom of the gods called?",
    "choices": [
      "Asgard",
      "Midgard",
      "Ragnarok",
      "Yggdrasil"
    ],
    "correct": 2
  },
  {
    "question": "What is the world tree called?",
    "choices": [
      "Yggdrasil",
      "Bifrost",
      "Asgard",
      "Niflheim"
    ],
    "correct": 0
  },
  {
    "question": "Who guards the rainbow bridge?",
    "choices": [
      "Tyr",
      "Heimdall",
      "Bragi",
      "Vidar"
    ],
    "correct": 1
  },
  {
    "question": "Who is the goddess of love and fertility?",
    "choices": [
      "Frigg",
      "Freya",
      "Sif",
      "Idun"
    ],
    "correct": 1
  },
  {
    "question": "What is the realm of humans called?",
    "choices": [
      "Asgard",
      "Midgard",
      "Vanaheim",
      "Jotunheim"
    ],
    "correct": 1
  },
  {
    "question": "Who is Odin's wife?",
    "choices": [
      "Frigg",
      "Freya",
      "Sif",
      "Skadi"
    ],
    "correct": 0
  },
  {
    "question": "What is the wolf foretold to kill Odin at Ragnarok?",
    "choices": [
      "Fenrir",
      "Geri",
      "Freki",
      "Skoll"
    ],
    "correct": 0
  },
  {
    "question": "How many ravens does Odin keep?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "question": "What are Odin's ravens named?",
    "choices": [
      "Geri and Freki",
      "Huginn and Muninn",
      "Sleipnir and Gulltop",
      "Skoll and Hati"
    ],
    "correct": 1
  },
  {
    "question": "Loki is the parent of which giant serpent?",
    "choices": [
      "Nidhogg",
      "Jormungandr",
      "Fafnir",
      "Naga"
    ],
    "correct": 1
  },
  {
    "question": "What is the warriors' afterlife hall ruled by Odin?",
    "choices": [
      "Folkvangr",
      "Valhalla",
      "Helheim",
      "Asgard"
    ],
    "correct": 1
  },
  {
    "question": "What weapon does Odin wield?",
    "choices": [
      "Mjolnir",
      "Gungnir",
      "Gram",
      "Naegling"
    ],
    "correct": 1
  },
  {
    "question": "Sleipnir, Odin's horse, has how many legs?",
    "choices": [
      "4",
      "6",
      "8",
      "10"
    ],
    "correct": 2
  },
  {
    "question": "Who is Thor's wife?",
    "choices": [
      "Sif",
      "Freya",
      "Frigg",
      "Idun"
    ],
    "correct": 0
  },
  {
    "question": "Who is the god of poetry?",
    "choices": [
      "Bragi",
      "Heimdall",
      "Vidar",
      "Forseti"
    ],
    "correct": 0
  },
  {
    "question": "Who keeps the apples of youth?",
    "choices": [
      "Sif",
      "Idun",
      "Skadi",
      "Var"
    ],
    "correct": 1
  },
  {
    "question": "Which god is associated with summer and sunshine?",
    "choices": [
      "Tyr",
      "Freyr",
      "Heimdall",
      "Bragi"
    ],
    "correct": 1
  },
  {
    "question": "Which god lost a hand to bind Fenrir?",
    "choices": [
      "Tyr",
      "Vidar",
      "Bragi",
      "Forseti"
    ],
    "correct": 0
  },
  {
    "question": "What is the ship made from dead men's nails?",
    "choices": [
      "Skidbladnir",
      "Naglfar",
      "Ringhorn",
      "Hringhorni"
    ],
    "correct": 1
  },
  {
    "question": "What two clans of gods exist in Norse myth?",
    "choices": [
      "Aesir and Vanir",
      "Aesir and Jotunn",
      "Vanir and Alfar",
      "Asynjur and Aesir"
    ],
    "correct": 0
  },
  {
    "question": "Who was the first man in Norse creation?",
    "choices": [
      "Ask",
      "Buri",
      "Ymir",
      "Mimir"
    ],
    "correct": 0
  },
  {
    "question": "Who is the giant from whose body the world was formed?",
    "choices": [
      "Surtr",
      "Ymir",
      "Thrym",
      "Geirrod"
    ],
    "correct": 1
  },
  {
    "question": "Which fire giant burns the world at Ragnarok?",
    "choices": [
      "Surtr",
      "Hel",
      "Loki",
      "Hrym"
    ],
    "correct": 0
  },
  {
    "question": "Who is queen of the dead?",
    "choices": [
      "Hel",
      "Skadi",
      "Sigyn",
      "Frigg"
    ],
    "correct": 0
  },
  {
    "question": "Where is the dwarves' realm?",
    "choices": [
      "Svartalfheim",
      "Alfheim",
      "Niflheim",
      "Muspelheim"
    ],
    "correct": 0
  },
  {
    "question": "What is the home of the gods?",
    "choices": [
      "Asgard",
      "Midgard",
      "Vanaheim",
      "Jotunheim"
    ],
    "correct": 0
  },
  {
    "question": "Loki's offspring Hel rules over which realm?",
    "choices": [
      "Asgard",
      "Helheim",
      "Muspelheim",
      "Alfheim"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NorseMythQuizSettings): NorseMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NorseMythQuizState, action: NorseMythQuizAction): NorseMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NorseMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

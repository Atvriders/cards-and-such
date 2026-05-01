import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WimbledonQuizSettings { questions: "10" | "20" | "30"; }
export interface WimbledonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WimbledonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who has the most Wimbledon men's singles titles?",
    "choices": [
      "Federer",
      "Djokovic",
      "Sampras",
      "Borg"
    ],
    "correct": 0
  },
  {
    "question": "How many men's singles titles did Federer win at Wimbledon?",
    "choices": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correct": 1
  },
  {
    "question": "Which surface is Wimbledon played on?",
    "choices": [
      "Clay",
      "Hard",
      "Grass",
      "Carpet"
    ],
    "correct": 2
  },
  {
    "question": "Who has the most Wimbledon women's singles titles in the Open Era?",
    "choices": [
      "Navratilova",
      "Williams",
      "Graf",
      "Court"
    ],
    "correct": 0
  },
  {
    "question": "In which year was the first Wimbledon Championships?",
    "choices": [
      "1877",
      "1881",
      "1900",
      "1925"
    ],
    "correct": 0
  },
  {
    "question": "Who won the 2023 men's Wimbledon title?",
    "choices": [
      "Alcaraz",
      "Djokovic",
      "Sinner",
      "Medvedev"
    ],
    "correct": 0
  },
  {
    "question": "Which Czech-born player won 9 Wimbledon women's singles titles?",
    "choices": [
      "Navratilova",
      "Mandlikova",
      "Sukova",
      "Kvitova"
    ],
    "correct": 0
  },
  {
    "question": "Who is most associated with serve and volley at Wimbledon?",
    "choices": [
      "Sampras",
      "Federer",
      "Both Sampras and Federer",
      "Murray"
    ],
    "correct": 2
  },
  {
    "question": "Which British man won Wimbledon in 2013?",
    "choices": [
      "Andy Murray",
      "Tim Henman",
      "Greg Rusedski",
      "Cameron Norrie"
    ],
    "correct": 0
  },
  {
    "question": "Who won 5 straight Wimbledon men's titles 1976-80?",
    "choices": [
      "Borg",
      "McEnroe",
      "Connors",
      "Lendl"
    ],
    "correct": 0
  },
  {
    "question": "In which year was Wimbledon cancelled?",
    "choices": [
      "2020",
      "2018",
      "2019",
      "2021"
    ],
    "correct": 0
  },
  {
    "question": "Who won the 2024 men's Wimbledon final?",
    "choices": [
      "Alcaraz",
      "Djokovic",
      "Sinner",
      "Medvedev"
    ],
    "correct": 0
  },
  {
    "question": "Who won the 2024 women's Wimbledon final?",
    "choices": [
      "Krejcikova",
      "Paolini",
      "Swiatek",
      "Sabalenka"
    ],
    "correct": 0
  },
  {
    "question": "What is the iconic Wimbledon snack?",
    "choices": [
      "Strawberries and cream",
      "Hot dogs",
      "Fish and chips",
      "Tea sandwiches"
    ],
    "correct": 0
  },
  {
    "question": "How many Wimbledon women's singles titles does Serena Williams have?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "In what year was the tiebreak introduced at Wimbledon?",
    "choices": [
      "1971",
      "1980",
      "1990",
      "2000"
    ],
    "correct": 0
  },
  {
    "question": "What feature does Centre Court now have?",
    "choices": [
      "Retractable roof",
      "Open dome",
      "Ice rink",
      "Sand pit"
    ],
    "correct": 0
  },
  {
    "question": "Who played the longest Wimbledon match against Mahut?",
    "choices": [
      "Isner",
      "Federer",
      "Nadal",
      "Djokovic"
    ],
    "correct": 0
  },
  {
    "question": "What is the Wimbledon dress code?",
    "choices": [
      "All white",
      "Any color",
      "Light blue",
      "Pastels"
    ],
    "correct": 0
  },
  {
    "question": "How many Wimbledon women's singles titles does Steffi Graf have?",
    "choices": [
      "5",
      "6",
      "7",
      "8"
    ],
    "correct": 2
  },
  {
    "question": "Who won the 2022 Wimbledon women's title?",
    "choices": [
      "Rybakina",
      "Jabeur",
      "Swiatek",
      "Sabalenka"
    ],
    "correct": 0
  },
  {
    "question": "Which player won her first Slam at Wimbledon 2021?",
    "choices": [
      "Barty",
      "Krejcikova",
      "Halep",
      "Kerber"
    ],
    "correct": 0
  },
  {
    "question": "Who was Borg's famous rival in the 1980 final?",
    "choices": [
      "McEnroe",
      "Connors",
      "Lendl",
      "Vilas"
    ],
    "correct": 0
  },
  {
    "question": "Where is Wimbledon held?",
    "choices": [
      "London",
      "Manchester",
      "Edinburgh",
      "Birmingham"
    ],
    "correct": 0
  },
  {
    "question": "Who is the BBC's main rival broadcaster (none) in UK for Wimbledon?",
    "choices": [
      "BBC has exclusive rights",
      "ITV",
      "Sky",
      "Channel 4"
    ],
    "correct": 0
  },
  {
    "question": "Who won the men's Wimbledon title in 2021?",
    "choices": [
      "Djokovic",
      "Berrettini",
      "Federer",
      "Nadal"
    ],
    "correct": 0
  },
  {
    "question": "Wimbledon is officially known as what?",
    "choices": [
      "The Championships",
      "The Open",
      "The Cup",
      "The Slam"
    ],
    "correct": 0
  },
  {
    "question": "Which trophy does the men's Wimbledon winner receive?",
    "choices": [
      "Gentlemen's Singles Trophy",
      "Plate",
      "Bowl",
      "Salver"
    ],
    "correct": 0
  },
  {
    "question": "Which trophy does the women's Wimbledon winner receive?",
    "choices": [
      "Venus Rosewater Dish",
      "Wimbledon Cup",
      "Norman Brookes",
      "Daphne Akhurst"
    ],
    "correct": 0
  },
  {
    "question": "How many Wimbledon men's titles does Djokovic have as of 2024?",
    "choices": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WimbledonQuizSettings): WimbledonQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WimbledonQuizState, action: WimbledonQuizAction): WimbledonQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WimbledonQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

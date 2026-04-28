import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CannesQuizSettings { questions: "10" | "20"; }
export interface CannesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CannesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Cannes is in which country?",
    "choices": [
      "Italy",
      "France",
      "Spain",
      "Monaco"
    ],
    "correct": 1
  },
  {
    "question": "First Cannes Festival was held in?",
    "choices": [
      "1939 (canceled)",
      "1946",
      "1950",
      "1956"
    ],
    "correct": 1
  },
  {
    "question": "Top prize is called?",
    "choices": [
      "Palme d'Or",
      "Golden Bear",
      "Golden Lion",
      "Crystal Globe"
    ],
    "correct": 0
  },
  {
    "question": "Won Palme for Pulp Fiction (1994)?",
    "choices": [
      "Quentin Tarantino",
      "Robert Rodriguez",
      "Spike Lee",
      "David Lynch"
    ],
    "correct": 0
  },
  {
    "question": "Apocalypse Now Palme year?",
    "choices": [
      "1976",
      "1979",
      "1980",
      "1982"
    ],
    "correct": 1
  },
  {
    "question": "Bong Joon-ho's 'Parasite' Palme year?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 2
  },
  {
    "question": "Festival is held annually in which month?",
    "choices": [
      "April",
      "May",
      "June",
      "September"
    ],
    "correct": 1
  },
  {
    "question": "The grand venue is the?",
    "choices": [
      "Salle Pleyel",
      "Grand Théâtre Lumière",
      "Pompidou",
      "Opéra Garnier"
    ],
    "correct": 1
  },
  {
    "question": "Cannes 'parallel' anti-establishment section?",
    "choices": [
      "Quinzaine des Réalisateurs",
      "Mostra",
      "Arena",
      "Forum"
    ],
    "correct": 0
  },
  {
    "question": "Won 2 Palmes (Loach, Haneke, Coppola, Schlöndorff and a few others) — how many directors have done it?",
    "choices": [
      "About 4",
      "About 9",
      "About 15",
      "About 25"
    ],
    "correct": 1
  },
  {
    "question": "Year 'Taxi Driver' won Palme?",
    "choices": [
      "1973",
      "1976",
      "1979",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "Lars von Trier's controversial 2011 incident was at?",
    "choices": [
      "Cannes",
      "Berlin",
      "Venice",
      "Toronto"
    ],
    "correct": 0
  },
  {
    "question": "Beach where star photos happen?",
    "choices": [
      "Promenade des Anglais",
      "La Croisette",
      "Saint-Tropez",
      "Plage de la Garoupe"
    ],
    "correct": 1
  },
  {
    "question": "Festival president 2014-?",
    "choices": [
      "Gilles Jacob",
      "Pierre Lescure",
      "Thierry Frémaux",
      "Lambert Wilson"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CannesQuizSettings): CannesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CannesQuizState, action: CannesQuizAction): CannesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CannesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PalmeDorQuizSettings { questions: "10" | "20"; }
export interface PalmeDorQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PalmeDorQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Palme d'Or replaced what name in 1955?",
    "choices": [
      "Grand Prix du Festival",
      "Golden Palm",
      "Lion d'Or",
      "Croisette Award"
    ],
    "correct": 0
  },
  {
    "question": "Palme d'Or design is based on what tree?",
    "choices": [
      "Olive",
      "Palm",
      "Cypress",
      "Cedar"
    ],
    "correct": 1
  },
  {
    "question": "Festival hosting Palme d'Or is in?",
    "choices": [
      "Venice",
      "Cannes",
      "Berlin",
      "San Sebastian"
    ],
    "correct": 1
  },
  {
    "question": "Palme d'Or was suspended (renamed Grand Prix) between?",
    "choices": [
      "1955-60",
      "1964-74",
      "1975-80",
      "1980-89"
    ],
    "correct": 1
  },
  {
    "question": "First Palme d'Or (1955) winner?",
    "choices": [
      "Marty",
      "The Silent World",
      "Friendly Persuasion",
      "La Dolce Vita"
    ],
    "correct": 0
  },
  {
    "question": "La Dolce Vita won Palme in?",
    "choices": [
      "1958",
      "1960",
      "1962",
      "1964"
    ],
    "correct": 1
  },
  {
    "question": "Director with two Palmes (Dardennes, Loach, etc.)?",
    "choices": [
      "1",
      "2",
      "3",
      "Multiple directors"
    ],
    "correct": 3
  },
  {
    "question": "Pulp Fiction (Tarantino) Palme year?",
    "choices": [
      "1992",
      "1994",
      "1996",
      "1998"
    ],
    "correct": 1
  },
  {
    "question": "Apocalypse Now shared Palme in 1979 with?",
    "choices": [
      "The Tin Drum",
      "Don Giovanni",
      "Manhattan",
      "All That Jazz"
    ],
    "correct": 0
  },
  {
    "question": "The Tree of Life (Malick) won in?",
    "choices": [
      "2009",
      "2011",
      "2013",
      "2015"
    ],
    "correct": 1
  },
  {
    "question": "Amour (Haneke) won in?",
    "choices": [
      "2010",
      "2012",
      "2014",
      "2016"
    ],
    "correct": 1
  },
  {
    "question": "Haneke's other Palme winner?",
    "choices": [
      "Cache",
      "The White Ribbon",
      "Funny Games",
      "Code Unknown"
    ],
    "correct": 1
  },
  {
    "question": "Blue Is the Warmest Color won in?",
    "choices": [
      "2011",
      "2013",
      "2015",
      "2017"
    ],
    "correct": 1
  },
  {
    "question": "Winter Sleep (Ceylan) won in?",
    "choices": [
      "2012",
      "2014",
      "2016",
      "2018"
    ],
    "correct": 1
  },
  {
    "question": "Dheepan (Audiard) won in?",
    "choices": [
      "2013",
      "2015",
      "2017",
      "2019"
    ],
    "correct": 1
  },
  {
    "question": "I, Daniel Blake (Loach) won in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "The Square (Ostlund) Palme year?",
    "choices": [
      "2015",
      "2017",
      "2019",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "Shoplifters (Kore-eda) won in?",
    "choices": [
      "2016",
      "2017",
      "2018",
      "2019"
    ],
    "correct": 2
  },
  {
    "question": "Parasite Palme year?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "Titane (Ducournau) Palme year?",
    "choices": [
      "2020",
      "2021",
      "2022",
      "2023"
    ],
    "correct": 1
  },
  {
    "question": "Triangle of Sadness Palme year?",
    "choices": [
      "2020",
      "2021",
      "2022",
      "2023"
    ],
    "correct": 2
  },
  {
    "question": "Anatomy of a Fall (Triet) Palme year?",
    "choices": [
      "2021",
      "2022",
      "2023",
      "2024"
    ],
    "correct": 2
  },
  {
    "question": "Anora (Sean Baker) Palme year?",
    "choices": [
      "2022",
      "2023",
      "2024",
      "2021"
    ],
    "correct": 2
  },
  {
    "question": "The Piano (Campion) shared Palme in 1993 with?",
    "choices": [
      "Farewell My Concubine",
      "Three Colors: Blue",
      "Naked",
      "Short Cuts"
    ],
    "correct": 0
  },
  {
    "question": "Taxi Driver (Scorsese) Palme year?",
    "choices": [
      "1974",
      "1976",
      "1978",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "MASH (Altman) Palme year?",
    "choices": [
      "1968",
      "1970",
      "1972",
      "1974"
    ],
    "correct": 1
  },
  {
    "question": "If.... (Anderson) Palme year?",
    "choices": [
      "1967",
      "1968",
      "1969",
      "1970"
    ],
    "correct": 1
  },
  {
    "question": "All That Jazz / Kagemusha shared Palme in?",
    "choices": [
      "1978",
      "1980",
      "1982",
      "1984"
    ],
    "correct": 1
  },
  {
    "question": "4 Months, 3 Weeks and 2 Days Palme year?",
    "choices": [
      "2005",
      "2007",
      "2009",
      "2011"
    ],
    "correct": 1
  },
  {
    "question": "Number of Palmes typically awarded each festival?",
    "choices": [
      "One",
      "Two",
      "Three",
      "Up to four"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PalmeDorQuizSettings): PalmeDorQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PalmeDorQuizState, action: PalmeDorQuizAction): PalmeDorQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PalmeDorQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

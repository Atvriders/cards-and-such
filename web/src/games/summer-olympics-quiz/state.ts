import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SummerOlympicsQuizSettings { questions: "10" | "20"; }
export interface SummerOlympicsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SummerOlympicsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year did the modern Summer Olympics begin?", choices: ["1888", "1896", "1900", "1912"], correct: 1 },
  { question: "Where were the first modern Olympics held?", choices: ["Paris", "Athens", "London", "Rome"], correct: 1 },
  { question: "How often are the Summer Olympics held?", choices: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], correct: 2 },
  { question: "Which city hosted the 2008 Summer Olympics?", choices: ["Beijing", "Tokyo", "Rio de Janeiro", "London"], correct: 0 },
  { question: "Which city hosted the 2012 Summer Olympics?", choices: ["Athens", "London", "Sydney", "Atlanta"], correct: 1 },
  { question: "Which city hosted the 2016 Summer Olympics?", choices: ["Beijing", "Tokyo", "Rio de Janeiro", "London"], correct: 2 },
  { question: "Where were the 2020 (held 2021) Summer Olympics held?", choices: ["Paris", "Tokyo", "Beijing", "Madrid"], correct: 1 },
  { question: "Which sprinter is known as the fastest man ever?", choices: ["Carl Lewis", "Usain Bolt", "Justin Gatlin", "Tyson Gay"], correct: 1 },
  { question: "How many rings are on the Olympic flag?", choices: ["3", "4", "5", "6"], correct: 2 },
  { question: "Which swimmer has won the most Olympic gold medals?", choices: ["Mark Spitz", "Michael Phelps", "Ian Thorpe", "Ryan Lochte"], correct: 1 },
  { question: "What does the Olympic motto 'Citius, Altius, Fortius' mean?", choices: ["Faster, Higher, Stronger", "Together, Strong, Brave", "Run, Jump, Throw", "Win, Compete, Honor"], correct: 0 },
  { question: "Which country has hosted the Summer Olympics most often?", choices: ["France", "USA", "Greece", "UK"], correct: 1 },
  { question: "In which year did Berlin host the Summer Olympics?", choices: ["1932", "1936", "1948", "1960"], correct: 1 },
  { question: "Which athlete famously raised a gloved fist on the podium in 1968?", choices: ["Tommie Smith", "Jesse Owens", "Bob Beamon", "Muhammad Ali"], correct: 0 },
  { question: "Which year were the Olympics held in Sydney?", choices: ["1996", "2000", "2004", "2008"], correct: 1 },
  { question: "Where were the 2024 Summer Olympics held?", choices: ["Paris", "Los Angeles", "Brisbane", "Madrid"], correct: 0 },
  { question: "Which 1936 Olympian won 4 gold medals in Berlin?", choices: ["Carl Lewis", "Jesse Owens", "Bob Hayes", "Eric Liddell"], correct: 1 },
  { question: "Where will the 2028 Summer Olympics be held?", choices: ["Paris", "Brisbane", "Los Angeles", "Madrid"], correct: 2 },
  { question: "Which country boycotted the 1980 Moscow Olympics?", choices: ["USA", "France", "China", "Germany"], correct: 0 },
  { question: "Where were the 1984 Summer Olympics held?", choices: ["Los Angeles", "Seoul", "Moscow", "Munich"], correct: 0 },
  { question: "Which gymnast scored the first perfect 10 in Olympic history?", choices: ["Nadia Comaneci", "Olga Korbut", "Mary Lou Retton", "Larisa Latynina"], correct: 0 },
  { question: "Where were the 1992 Summer Olympics held?", choices: ["Barcelona", "Atlanta", "Seoul", "Sydney"], correct: 0 },
  { question: "Where were the 1996 Summer Olympics held?", choices: ["Athens", "Atlanta", "Sydney", "Barcelona"], correct: 1 },
  { question: "Where were the 2004 Summer Olympics held?", choices: ["Beijing", "Sydney", "Athens", "Rio"], correct: 2 },
  { question: "Which sprinter won 9 Olympic gold medals from 1984-1996?", choices: ["Carl Lewis", "Linford Christie", "Maurice Greene", "Donovan Bailey"], correct: 0 },
  { question: "Which boycott affected the 1984 Los Angeles Olympics?", choices: ["African nations", "Soviet bloc", "South America", "Middle East"], correct: 1 },
  { question: "Who lit the cauldron at the 1996 Atlanta Olympics?", choices: ["Carl Lewis", "Muhammad Ali", "Evander Holyfield", "Michael Johnson"], correct: 1 },
  { question: "Which sport returned to the Olympics in 2016 after 112 years?", choices: ["Rugby", "Golf", "Cricket", "Polo"], correct: 1 },
  { question: "Which marathoner ran barefoot to gold in 1960?", choices: ["Abebe Bikila", "Frank Shorter", "Emil Zatopek", "Kip Keino"], correct: 0 },
  { question: "How many gold medals did Michael Phelps win in 2008 Beijing?", choices: ["6", "7", "8", "9"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SummerOlympicsQuizSettings): SummerOlympicsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SummerOlympicsQuizState, action: SummerOlympicsQuizAction): SummerOlympicsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SummerOlympicsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MontyPythonQuizSettings { questions: "10" | "20" | "30"; }
export interface MontyPythonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MontyPythonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which film features the Black Knight?", choices: ["Holy Grail", "Life of Brian", "Meaning of Life", "And Now for Something Completely Different"], correct: 0 },
  { question: "How many Pythons were there?", choices: ["5", "6", "7", "4"], correct: 1 },
  { question: "Which member was American?", choices: ["Terry Gilliam", "Eric Idle", "John Cleese", "Michael Palin"], correct: 0 },
  { question: "What killed the parrot in the Dead Parrot sketch?", choices: ["Old age", "It's pining", "It is dead", "Owner claims various reasons"], correct: 3 },
  { question: "Year Holy Grail released?", choices: ["1969", "1971", "1975", "1979"], correct: 2 },
  { question: "Which film is about a man mistaken for the Messiah?", choices: ["Holy Grail", "Life of Brian", "Meaning of Life", "Jabberwocky"], correct: 1 },
  { question: "'Always look on the bright side of life' is from?", choices: ["Holy Grail", "Life of Brian", "Meaning of Life", "Spam"], correct: 1 },
  { question: "What's the Spanish surprise weapon?", choices: ["Knives", "Inquisition", "Surprise itself", "Dynamite"], correct: 1 },
  { question: "Which Python directed Brazil (1985)?", choices: ["John Cleese", "Terry Gilliam", "Eric Idle", "Terry Jones"], correct: 1 },
  { question: "John Cleese co-created what other classic British sitcom?", choices: ["Blackadder", "Fawlty Towers", "Yes Minister", "The Office"], correct: 1 },
  { question: "What is the airspeed velocity of an unladen swallow?", choices: ["African or European?", "11 mph", "42 mph", "Unknown"], correct: 0 },
  { question: "What does the king say about the bridgekeeper?", choices: ["He's a fool", "He's wise", "Can't say", "Cast into the gorge"], correct: 3 },
  { question: "Spam, spam, spam — sketch features what setting?", choices: ["Café", "Hotel", "Office", "Bus"], correct: 0 },
  { question: "Which sketch involves a Cheese Shop?", choices: ["A Cheese Shop", "Argument Clinic", "Spanish Inquisition", "Ministry of Silly Walks"], correct: 0 },
  { question: "Who plays King Arthur in Holy Grail?", choices: ["Graham Chapman", "John Cleese", "Eric Idle", "Michael Palin"], correct: 0 },
  { question: "Which Python died first (1989)?", choices: ["Graham Chapman", "John Cleese", "Eric Idle", "Terry Jones"], correct: 0 },
  { question: "Which Python died in 2020?", choices: ["Terry Jones", "John Cleese", "Eric Idle", "Michael Palin"], correct: 0 },
  { question: "What is the killer rabbit weakness?", choices: ["Holy Hand Grenade", "Sword", "Magic", "Fire"], correct: 0 },
  { question: "How does one count the Holy Hand Grenade?", choices: ["1, 2, 3", "1, 2, 5", "Three shall be the number", "To 10"], correct: 2 },
  { question: "Year Flying Circus first aired?", choices: ["1965", "1967", "1969", "1971"], correct: 2 },
  { question: "What is the 'Knights who say'?", choices: ["Ni!", "Ekki-Ekki", "Both", "Hi!"], correct: 2 },
  { question: "Eric Idle later created which musical?", choices: ["Spamalot", "Avenue Q", "The Producers", "Wicked"], correct: 0 },
  { question: "Which sketch features 'Nobody expects…'?", choices: ["Argument Clinic", "Spanish Inquisition", "Cheese Shop", "Dead Parrot"], correct: 1 },
  { question: "Lumberjack Song character wants to be a?", choices: ["Lumberjack", "Mountie", "Carpenter", "Florist"], correct: 0 },
  { question: "Brian's mother is played by?", choices: ["John Cleese", "Terry Jones", "Eric Idle", "Michael Palin"], correct: 1 },
  { question: "Which Python plays Mr. Creosote?", choices: ["John Cleese", "Terry Jones", "Graham Chapman", "Eric Idle"], correct: 1 },
  { question: "Who voices God in Holy Grail?", choices: ["Animation", "Graham Chapman", "Eric Idle", "Terry Gilliam"], correct: 0 },
  { question: "Famous closing of Flying Circus?", choices: ["'And now…'", "'Goodnight'", "Animation chase", "'Stop that!'"], correct: 0 },
  { question: "Holy Grail ends with?", choices: ["Battle", "Police arrest", "Wedding", "King is killed"], correct: 1 },
  { question: "Meaning of Life year?", choices: ["1979", "1981", "1983", "1985"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MontyPythonQuizSettings): MontyPythonQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MontyPythonQuizState, action: MontyPythonQuizAction): MontyPythonQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MontyPythonQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

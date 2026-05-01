import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MontyPythonQuizSettings { questions: "10" | "20" | "30"; }
export interface MontyPythonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MontyPythonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many original members were in Monty Python?", choices: ["4", "5", "6", "7"], correct: 2 },
  { question: "Which member was the only American in Monty Python?", choices: ["Terry Gilliam", "Eric Idle", "John Cleese", "Graham Chapman"], correct: 0 },
  { question: "What year did 'Monty Python's Flying Circus' first air on the BBC?", choices: ["1967", "1969", "1971", "1973"], correct: 1 },
  { question: "Which film features the Knights Who Say 'Ni'?", choices: ["Life of Brian", "The Holy Grail", "Meaning of Life", "And Now for Something Completely Different"], correct: 1 },
  { question: "In 'Holy Grail', what is the airspeed velocity question about?", choices: ["A swallow", "A sparrow", "An eagle", "A starling"], correct: 0 },
  { question: "Who plays King Arthur in 'Monty Python and the Holy Grail'?", choices: ["John Cleese", "Graham Chapman", "Eric Idle", "Michael Palin"], correct: 1 },
  { question: "What 1979 Python film satirizes religious life around a Jesus contemporary?", choices: ["Life of Brian", "The Meaning of Life", "Jabberwocky", "Erik the Viking"], correct: 0 },
  { question: "Which song closes 'Life of Brian'?", choices: ["Always Look on the Bright Side of Life", "The Lumberjack Song", "Spam", "Galaxy Song"], correct: 0 },
  { question: "What sketch involves a customer trying to return a deceased parrot?", choices: ["Cheese Shop", "Dead Parrot", "Argument Clinic", "Spanish Inquisition"], correct: 1 },
  { question: "Which member did the animations for Monty Python?", choices: ["Terry Gilliam", "Terry Jones", "Eric Idle", "John Cleese"], correct: 0 },
  { question: "What does the Black Knight famously say after losing his arms?", choices: ["I yield!", "Tis but a scratch", "Mercy!", "Have at thee!"], correct: 1 },
  { question: "Which sketch repeats a Spanish historical body's name with 'Nobody expects...'?", choices: ["Spanish Inquisition", "Argument Clinic", "Dead Parrot", "Spam"], correct: 0 },
  { question: "What 1983 film is about the meaning of existence?", choices: ["Life of Brian", "The Meaning of Life", "Time Bandits", "Brazil"], correct: 1 },
  { question: "What food is featured in the famous Viking-singing sketch?", choices: ["Spam", "Eggs", "Bacon", "Beans"], correct: 0 },
  { question: "Which Python directed 'Brazil' (1985)?", choices: ["Terry Gilliam", "Terry Jones", "John Cleese", "Eric Idle"], correct: 0 },
  { question: "Who played the Spanish Inquisition's Cardinal Ximenez?", choices: ["Michael Palin", "John Cleese", "Eric Idle", "Graham Chapman"], correct: 0 },
  { question: "What does the bridge keeper ask in 'Holy Grail'?", choices: ["Three questions", "Five questions", "A riddle", "Your favorite color"], correct: 0 },
  { question: "Which Python member died in 1989?", choices: ["Graham Chapman", "John Cleese", "Eric Idle", "Terry Jones"], correct: 0 },
  { question: "Eric Idle wrote and starred in which Holy Grail-based musical?", choices: ["Spamalot", "Brian!", "Brazil!", "Argument!"], correct: 0 },
  { question: "What is John Cleese's famous Ministry sketch called?", choices: ["Ministry of Silly Walks", "Ministry of Nonsense", "Department of Funny Steps", "Office of Walking"], correct: 0 },
  { question: "Who plays Brian's mother in 'Life of Brian'?", choices: ["Terry Jones", "Eric Idle", "Michael Palin", "John Cleese"], correct: 0 },
  { question: "The 'Cheese Shop' sketch features which actor as the customer?", choices: ["John Cleese", "Eric Idle", "Michael Palin", "Graham Chapman"], correct: 0 },
  { question: "What killer creature is dispatched by the Holy Hand Grenade?", choices: ["The killer rabbit", "The killer mouse", "The black knight", "The Nazgul"], correct: 0 },
  { question: "Which Python founded Handmade Films's predecessor team in spirit, focusing on TV travel?", choices: ["Michael Palin", "Eric Idle", "John Cleese", "Terry Gilliam"], correct: 0 },
  { question: "What number is 'The Holy Hand Grenade of Antioch' counted to?", choices: ["Two", "Three", "Five", "Seven"], correct: 1 },
  { question: "What live tour title did the surviving members do in 2014?", choices: ["Monty Python Live (Mostly)", "Reunion 2014", "Almost the Last Show", "Spamalot Tour"], correct: 0 },
  { question: "Which Python played the snooty French taunter in Holy Grail?", choices: ["John Cleese", "Eric Idle", "Michael Palin", "Graham Chapman"], correct: 0 },
  { question: "Who co-directed 'Holy Grail' with Terry Gilliam?", choices: ["Terry Jones", "John Cleese", "Eric Idle", "Michael Palin"], correct: 0 },
  { question: "What kind of shop has 'no cheese' in the famous sketch?", choices: ["Specialist cheese shop", "Grocery", "Bakery", "Deli"], correct: 0 },
  { question: "What Python film centered on time-traveling little people?", choices: ["Time Bandits", "Brazil", "Jabberwocky", "Erik the Viking"], correct: 0 },
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

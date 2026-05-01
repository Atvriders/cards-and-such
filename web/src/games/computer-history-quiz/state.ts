import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComputerHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface ComputerHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComputerHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is widely credited as the first computer programmer?", choices: ["Charles Babbage","Ada Lovelace","Alan Turing","Grace Hopper"], correct: 1 },
  { question: "Charles Babbage designed which mechanical computer?", choices: ["Difference Engine","ENIAC","UNIVAC","Mark I"], correct: 0 },
  { question: "ENIAC was completed in what year?", choices: ["1943","1945","1946","1948"], correct: 2 },
  { question: "Alan Turing helped break which WWII cipher machine?", choices: ["Lorenz","Enigma","Purple","SIGABA"], correct: 1 },
  { question: "The first electronic stored-program computer is often cited as?", choices: ["ENIAC","Manchester Baby","UNIVAC I","Z3"], correct: 1 },
  { question: "Who developed the first compiler (A-0)?", choices: ["Grace Hopper","John Backus","Donald Knuth","Edsger Dijkstra"], correct: 0 },
  { question: "The transistor was invented at Bell Labs in what year?", choices: ["1945","1947","1950","1953"], correct: 1 },
  { question: "The integrated circuit was independently invented by Jack Kilby and?", choices: ["Robert Noyce","Gordon Moore","William Shockley","Andrew Grove"], correct: 0 },
  { question: "Intel was founded in what year?", choices: ["1965","1968","1971","1975"], correct: 1 },
  { question: "The Intel 4004, released in 1971, was the first commercial?", choices: ["RAM chip","Microprocessor","GPU","Hard drive"], correct: 1 },
  { question: "Apple was founded in what year?", choices: ["1974","1976","1978","1980"], correct: 1 },
  { question: "The Apple II launched in what year?", choices: ["1975","1977","1979","1981"], correct: 1 },
  { question: "IBM's first PC (5150) was released in?", choices: ["1979","1981","1983","1985"], correct: 1 },
  { question: "Microsoft was founded by Bill Gates and?", choices: ["Steve Ballmer","Paul Allen","Steve Jobs","Tim Paterson"], correct: 1 },
  { question: "MS-DOS 1.0 was released in what year?", choices: ["1979","1981","1983","1985"], correct: 1 },
  { question: "The first version of Windows was released in?", choices: ["1983","1985","1987","1990"], correct: 1 },
  { question: "The Macintosh launched in what year?", choices: ["1982","1984","1986","1988"], correct: 1 },
  { question: "Tim Berners-Lee invented the World Wide Web at?", choices: ["MIT","CERN","Bell Labs","Stanford"], correct: 1 },
  { question: "Linux kernel 0.01 was released by Linus Torvalds in?", choices: ["1989","1991","1993","1995"], correct: 1 },
  { question: "Moore's Law predicts a doubling of transistors every approximately?", choices: ["6 months","1 year","2 years","5 years"], correct: 2 },
  { question: "The first commercial GUI computer was the?", choices: ["Alto","Lisa","Macintosh","Star"], correct: 3 },
  { question: "Xerox PARC's Alto pioneered the GUI in what decade?", choices: ["1960s","1970s","1980s","1990s"], correct: 1 },
  { question: "Who co-founded Apple alongside Steve Jobs and Ronald Wayne?", choices: ["Steve Wozniak","Bill Gates","Tim Cook","Andy Hertzfeld"], correct: 0 },
  { question: "The Altair 8800, often called the first PC, debuted in?", choices: ["1973","1975","1977","1979"], correct: 1 },
  { question: "ARPANET sent its first message in?", choices: ["1967","1969","1971","1973"], correct: 1 },
  { question: "Doug Engelbart's 'Mother of All Demos' occurred in?", choices: ["1965","1968","1972","1975"], correct: 1 },
  { question: "Who created the C programming language?", choices: ["Ken Thompson","Dennis Ritchie","Brian Kernighan","Bjarne Stroustrup"], correct: 1 },
  { question: "Unix was developed at?", choices: ["MIT","Bell Labs","Xerox PARC","IBM Research"], correct: 1 },
  { question: "The first iPhone launched in what year?", choices: ["2005","2007","2009","2011"], correct: 1 },
  { question: "The Turing Award is given by which organization?", choices: ["IEEE","ACM","ISO","NIST"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ComputerHistoryQuizSettings): ComputerHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ComputerHistoryQuizState, action: ComputerHistoryQuizAction): ComputerHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ComputerHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

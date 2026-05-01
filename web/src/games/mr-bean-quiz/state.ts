import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MrBeanQuizSettings { questions: "10" | "20" | "30"; }
export interface MrBeanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MrBeanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who plays Mr. Bean?", choices: ["Rowan Atkinson", "Hugh Laurie", "Stephen Fry", "John Cleese"], correct: 0 },
  { question: "What year did Mr. Bean first air on TV?", choices: ["1988", "1990", "1992", "1994"], correct: 1 },
  { question: "What car does Mr. Bean famously drive?", choices: ["Mini Cooper", "Austin Mini", "Lime green Mini", "Yellow Beetle"], correct: 2 },
  { question: "What is the make/model of Mr. Bean's iconic car?", choices: ["BMC Mini 1000", "Austin Metro", "Morris Marina", "Vauxhall Viva"], correct: 0 },
  { question: "What is Bean's stuffed companion?", choices: ["Teddy", "Bunny", "Mr. Pooky", "Bear-Bear"], correct: 0 },
  { question: "What year did the first Mr. Bean theatrical film release?", choices: ["1995", "1997", "1999", "2001"], correct: 1 },
  { question: "What painting features in 'Bean: The Ultimate Disaster Movie' (1997)?", choices: ["Whistler's Mother", "Mona Lisa", "American Gothic", "The Scream"], correct: 0 },
  { question: "What is the title of the 2007 Bean sequel film?", choices: ["Mr. Bean's Holiday", "Bean Goes French", "Bean's Vacation", "Bean Returns"], correct: 0 },
  { question: "Where does Bean go in 'Mr. Bean's Holiday'?", choices: ["France", "Spain", "Italy", "Germany"], correct: 0 },
  { question: "Who created Mr. Bean with Rowan Atkinson?", choices: ["Richard Curtis", "Ben Elton", "Robin Driscoll", "Both Curtis and Driscoll"], correct: 3 },
  { question: "What network originally aired Mr. Bean?", choices: ["BBC", "ITV", "Channel 4", "Sky"], correct: 1 },
  { question: "How many original live-action TV episodes were made (1990-1995)?", choices: ["10", "15", "20", "25"], correct: 1 },
  { question: "What is the animated Mr. Bean cartoon series called?", choices: ["Mr. Bean: The Animated Series", "Bean Cartoons", "Bean Toons", "Mr. Bean's World"], correct: 0 },
  { question: "What does the opening of the original show feature?", choices: ["Bean falling from the sky", "Bean leaving home", "Bean driving", "Bean shopping"], correct: 0 },
  { question: "What latin choir piece plays during the show's intro?", choices: ["Ecce homo qui est faba", "Dies irae", "Ave Maria", "Carmina Burana"], correct: 0 },
  { question: "What language does Mr. Bean primarily communicate in?", choices: ["English (rarely speaks)", "French", "Sign language", "Mime only"], correct: 0 },
  { question: "Who is Bean's longtime girlfriend in the series?", choices: ["Irma Gobb", "Mrs. Wicket", "Auntie Hyacinth", "No girlfriend"], correct: 0 },
  { question: "What animal lives at Bean's flat (in animated series)?", choices: ["A landlady's cat", "A dog", "A parrot", "A turtle"], correct: 0 },
  { question: "Rowan Atkinson studied what subject at Oxford?", choices: ["Electrical engineering", "Theology", "English", "History"], correct: 0 },
  { question: "Atkinson is also known for which other British comedy series?", choices: ["Blackadder", "Fawlty Towers", "Yes Minister", "Only Fools and Horses"], correct: 0 },
  { question: "What Olympics did Mr. Bean perform at the opening ceremony?", choices: ["London 2012", "Sydney 2000", "Athens 2004", "Beijing 2008"], correct: 0 },
  { question: "Which classical piece did Bean accompany in the 2012 Olympics?", choices: ["Chariots of Fire", "Symphony No. 9", "Bolero", "Rhapsody in Blue"], correct: 0 },
  { question: "What year did the animated Mr. Bean series debut?", choices: ["2002", "2004", "2006", "2008"], correct: 0 },
  { question: "Mr. Bean's flat is located in what English town?", choices: ["Highbury, London", "Brighton", "Manchester", "Liverpool"], correct: 0 },
  { question: "Atkinson played a vicar in which Richard Curtis film?", choices: ["Four Weddings and a Funeral", "Notting Hill", "Love Actually", "About Time"], correct: 0 },
  { question: "What item does Bean often hide in his pocket or jacket?", choices: ["Pen", "Snacks", "Various objects (gag dependent)", "Money"], correct: 2 },
  { question: "What color is Mr. Bean's signature jacket?", choices: ["Brown tweed", "Black", "Blue", "Grey"], correct: 0 },
  { question: "What style of pants does Mr. Bean wear?", choices: ["Brown corduroy", "Jeans", "Khakis", "Slacks"], correct: 0 },
  { question: "What spy parody franchise does Atkinson lead?", choices: ["Johnny English", "Austin Powers", "Spy Hard", "Get Smart"], correct: 0 },
  { question: "Atkinson received which honor in 2013?", choices: ["CBE", "Knighthood", "OBE", "MBE"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MrBeanQuizSettings): MrBeanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MrBeanQuizState, action: MrBeanQuizAction): MrBeanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MrBeanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

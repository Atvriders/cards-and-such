import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AmericanLitQuizSettings { questions: "10" | "20" | "30"; }
export interface AmericanLitQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AmericanLitQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'The Adventures of Huckleberry Finn'?", choices: ["Twain","Hemingway","Melville","Faulkner"], correct: 0 },
  { question: "Who wrote 'The Great Gatsby'?", choices: ["Hemingway","Fitzgerald","Steinbeck","Faulkner"], correct: 1 },
  { question: "'Call me Ishmael' opens which novel?", choices: ["Moby-Dick","Billy Budd","Typee","Omoo"], correct: 0 },
  { question: "Who wrote 'The Scarlet Letter'?", choices: ["Hawthorne","Melville","Poe","James"], correct: 0 },
  { question: "Who wrote 'The Old Man and the Sea'?", choices: ["Fitzgerald","Hemingway","Steinbeck","Faulkner"], correct: 1 },
  { question: "Who wrote 'The Grapes of Wrath'?", choices: ["Hemingway","Steinbeck","Fitzgerald","Faulkner"], correct: 1 },
  { question: "Who wrote 'Of Mice and Men'?", choices: ["Steinbeck","Hemingway","Caldwell","Wolfe"], correct: 0 },
  { question: "Who wrote 'The Sound and the Fury'?", choices: ["Hemingway","Faulkner","Wolfe","Anderson"], correct: 1 },
  { question: "Who wrote 'As I Lay Dying'?", choices: ["Faulkner","Hemingway","Wolfe","Steinbeck"], correct: 0 },
  { question: "Who wrote 'To Kill a Mockingbird'?", choices: ["Harper Lee","Toni Morrison","Flannery O'Connor","Carson McCullers"], correct: 0 },
  { question: "Atticus Finch appears in which novel?", choices: ["The Help","To Kill a Mockingbird","Beloved","A Lesson Before Dying"], correct: 1 },
  { question: "Who wrote 'Beloved'?", choices: ["Alice Walker","Toni Morrison","Maya Angelou","Zora Neale Hurston"], correct: 1 },
  { question: "Who wrote 'The Color Purple'?", choices: ["Alice Walker","Toni Morrison","Maya Angelou","Octavia Butler"], correct: 0 },
  { question: "Who wrote 'Their Eyes Were Watching God'?", choices: ["Hurston","Morrison","Walker","Wright"], correct: 0 },
  { question: "Who wrote 'Invisible Man' (1952)?", choices: ["Richard Wright","Ralph Ellison","James Baldwin","Toni Morrison"], correct: 1 },
  { question: "Who wrote 'Native Son'?", choices: ["Wright","Ellison","Baldwin","Hughes"], correct: 0 },
  { question: "Who wrote 'Go Tell It on the Mountain'?", choices: ["Baldwin","Wright","Ellison","Morrison"], correct: 0 },
  { question: "Who wrote 'The Catcher in the Rye'?", choices: ["Salinger","Updike","Cheever","Roth"], correct: 0 },
  { question: "Holden Caulfield appears in?", choices: ["Franny and Zooey","The Catcher in the Rye","Nine Stories","Rabbit, Run"], correct: 1 },
  { question: "Who wrote 'Slaughterhouse-Five'?", choices: ["Vonnegut","Heller","Pynchon","Roth"], correct: 0 },
  { question: "Who wrote 'Catch-22'?", choices: ["Heller","Vonnegut","Mailer","Pynchon"], correct: 0 },
  { question: "Who wrote 'On the Road'?", choices: ["Kerouac","Ginsberg","Burroughs","Salinger"], correct: 0 },
  { question: "Who wrote 'Leaves of Grass'?", choices: ["Whitman","Dickinson","Frost","Longfellow"], correct: 0 },
  { question: "Who wrote 'The Raven'?", choices: ["Hawthorne","Poe","Whitman","Longfellow"], correct: 1 },
  { question: "Who wrote 'The Sun Also Rises'?", choices: ["Fitzgerald","Hemingway","Steinbeck","Cather"], correct: 1 },
  { question: "Who wrote 'My Antonia'?", choices: ["Cather","Wharton","Glasgow","Stein"], correct: 0 },
  { question: "Who wrote 'The Age of Innocence'?", choices: ["Wharton","Cather","James","Chopin"], correct: 0 },
  { question: "Who wrote 'The Awakening' (1899)?", choices: ["Chopin","Wharton","James","Cather"], correct: 0 },
  { question: "Who wrote 'Uncle Tom's Cabin'?", choices: ["Stowe","Alcott","Dickinson","Fuller"], correct: 0 },
  { question: "Who wrote 'Little Women'?", choices: ["Alcott","Stowe","Wharton","Cather"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AmericanLitQuizSettings): AmericanLitQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AmericanLitQuizState, action: AmericanLitQuizAction): AmericanLitQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AmericanLitQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

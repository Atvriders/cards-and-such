import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KurosawaQuizSettings { questions: "10" | "20" | "30"; }
export interface KurosawaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KurosawaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Akira Kurosawa was born in what year?", choices: ["1906", "1910", "1914", "1918"], correct: 1 },
  { question: "Kurosawa was born in?", choices: ["Tokyo", "Kyoto", "Osaka", "Nagoya"], correct: 0 },
  { question: "What 1950 film popularized non-linear storytelling?", choices: ["Rashomon", "Seven Samurai", "Ikiru", "Yojimbo"], correct: 0 },
  { question: "Rashomon won what major international prize?", choices: ["Golden Lion at Venice", "Palme d'Or", "Berlin Bear", "Tokyo Award"], correct: 0 },
  { question: "What 1954 film features defending a village from bandits?", choices: ["Seven Samurai", "Yojimbo", "Sanjuro", "Hidden Fortress"], correct: 0 },
  { question: "Seven Samurai was remade as what Western?", choices: ["The Magnificent Seven", "The Wild Bunch", "High Noon", "Shane"], correct: 0 },
  { question: "Who is Kurosawa's most frequent leading actor?", choices: ["Toshiro Mifune", "Tatsuya Nakadai", "Takashi Shimura", "Ryunosuke Tsukigata"], correct: 0 },
  { question: "How many films did Kurosawa and Mifune make together?", choices: ["16", "12", "20", "8"], correct: 0 },
  { question: "What 1961 film stars Mifune as a wandering samurai?", choices: ["Yojimbo", "Sanjuro", "Hidden Fortress", "Throne of Blood"], correct: 0 },
  { question: "Yojimbo was remade as what Sergio Leone film?", choices: ["A Fistful of Dollars", "Once Upon a Time in the West", "The Good the Bad and the Ugly", "Duck You Sucker"], correct: 0 },
  { question: "What 1957 film is Kurosawa's adaptation of Macbeth?", choices: ["Throne of Blood", "Ran", "The Lower Depths", "The Bad Sleep Well"], correct: 0 },
  { question: "What 1985 epic is Kurosawa's adaptation of King Lear?", choices: ["Ran", "Kagemusha", "Throne of Blood", "Dreams"], correct: 0 },
  { question: "What 1980 film won Palme d'Or for Kurosawa?", choices: ["Kagemusha", "Ran", "Dersu Uzala", "Dreams"], correct: 0 },
  { question: "What 1952 film is about a bureaucrat with cancer?", choices: ["Ikiru", "Red Beard", "Stray Dog", "High and Low"], correct: 0 },
  { question: "What 1958 film inspired Star Wars?", choices: ["The Hidden Fortress", "Yojimbo", "Sanjuro", "Throne of Blood"], correct: 0 },
  { question: "Which Star Wars character was inspired by Hidden Fortress?", choices: ["R2-D2 and C-3PO (peasant duo)", "Darth Vader", "Yoda", "Han Solo"], correct: 0 },
  { question: "Kurosawa's nickname among admirers?", choices: ["The Emperor", "The Master", "Sensei", "All of these"], correct: 0 },
  { question: "What 1963 detective drama stars Mifune as a businessman in a kidnapping case?", choices: ["High and Low", "Stray Dog", "The Bad Sleep Well", "Drunken Angel"], correct: 0 },
  { question: "What 1949 film features a detective searching for his stolen pistol?", choices: ["Stray Dog", "Drunken Angel", "Quiet Duel", "Scandal"], correct: 0 },
  { question: "Kurosawa won an honorary Oscar in what year?", choices: ["1990", "1985", "1995", "1980"], correct: 0 },
  { question: "Kurosawa attempted suicide in what year after a financial setback?", choices: ["1971", "1965", "1975", "1980"], correct: 0 },
  { question: "What 1975 Soviet co-production won Foreign Film Oscar?", choices: ["Dersu Uzala", "Kagemusha", "Ran", "Dreams"], correct: 0 },
  { question: "What 1990 anthology film by Kurosawa?", choices: ["Dreams (Akira Kurosawa's Dreams)", "Madadayo", "Rhapsody in August", "Dodes'ka-den"], correct: 0 },
  { question: "Kurosawa's last film (1993)?", choices: ["Madadayo", "Dreams", "Rhapsody in August", "Ran"], correct: 0 },
  { question: "Kurosawa influenced which director who made Magnificent Seven?", choices: ["John Sturges", "George Stevens", "Howard Hawks", "John Ford"], correct: 0 },
  { question: "Throne of Blood relocates Macbeth to which era?", choices: ["Feudal Japan", "Modern Japan", "Edo period", "Heian period"], correct: 0 },
  { question: "Kurosawa often shot scenes with how many cameras?", choices: ["Multiple cameras simultaneously", "Single camera only", "Two", "Always one"], correct: 0 },
  { question: "What 1965 medical drama stars Mifune as a doctor?", choices: ["Red Beard", "Drunken Angel", "Quiet Duel", "Stray Dog"], correct: 0 },
  { question: "Red Beard was Kurosawa's last collaboration with whom?", choices: ["Toshiro Mifune", "Tatsuya Nakadai", "Takashi Shimura", "Yoshio Tsuchiya"], correct: 0 },
  { question: "Kurosawa died in what year?", choices: ["1998", "1995", "2000", "1992"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KurosawaQuizSettings): KurosawaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KurosawaQuizState, action: KurosawaQuizAction): KurosawaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KurosawaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

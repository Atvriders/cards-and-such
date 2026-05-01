import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HorrorFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface HorrorFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HorrorFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What 1960 Hitchcock film features the shower scene?", choices: ["Psycho","The Birds","Vertigo","Rear Window"], correct: 0 },
  { question: "Who plays the killer in Psycho?", choices: ["Anthony Perkins (Norman Bates)","Janet Leigh","Hitchcock","Other"], correct: 0 },
  { question: "What 1973 film features Linda Blair as possessed girl?", choices: ["The Exorcist","Carrie","Rosemary's Baby","Omen"], correct: 0 },
  { question: "What 1978 slasher film features Michael Myers?", choices: ["Halloween","Friday the 13th","Nightmare on Elm","Texas Chainsaw"], correct: 0 },
  { question: "Who directed Halloween (1978)?", choices: ["John Carpenter","Wes Craven","Tobe Hooper","Sean Cunningham"], correct: 0 },
  { question: "What 1980 film features Jason Voorhees?", choices: ["Friday the 13th","Halloween","Nightmare on Elm","Texas Chainsaw"], correct: 0 },
  { question: "What 1984 film features Freddy Krueger?", choices: ["A Nightmare on Elm Street","Friday 13th","Halloween 4","Hellraiser"], correct: 0 },
  { question: "Who plays Freddy?", choices: ["Robert Englund","Kane Hodder","Tony Todd","Doug Bradley"], correct: 0 },
  { question: "What 1980 Stanley Kubrick film?", choices: ["The Shining","2001","Eyes Wide Shut","Clockwork"], correct: 0 },
  { question: "Who plays Jack in The Shining?", choices: ["Jack Nicholson","Anthony Hopkins","Robert De Niro","Al Pacino"], correct: 0 },
  { question: "What hotel is The Shining set in?", choices: ["The Overlook","Bates","Stanley","Hilton"], correct: 0 },
  { question: "What 1979 film featured a chestburster scene?", choices: ["Alien","The Thing","The Fly","Predator"], correct: 0 },
  { question: "What 1968 zombie film starts the genre?", choices: ["Night of the Living Dead","Dawn of the Dead","Day of the Dead","White Zombie"], correct: 0 },
  { question: "Who directed Night of the Living Dead?", choices: ["George A. Romero","John Carpenter","Wes Craven","Sam Raimi"], correct: 0 },
  { question: "What 1981 film featured Bruce Campbell as Ash?", choices: ["The Evil Dead","Army of Darkness","Both","Drag Me to Hell"], correct: 0 },
  { question: "Who directed The Evil Dead?", choices: ["Sam Raimi","George Romero","John Carpenter","Wes Craven"], correct: 0 },
  { question: "What 1991 film features Anthony Hopkins as Lecter?", choices: ["The Silence of the Lambs","Hannibal","Red Dragon","Manhunter"], correct: 0 },
  { question: "What 2017 horror by Jordan Peele?", choices: ["Get Out","Us","Nope","All by him"], correct: 0 },
  { question: "What 2014 film features the Babadook?", choices: ["The Babadook","It Follows","The Witch","Hereditary"], correct: 0 },
  { question: "What 2018 film by Ari Aster features family horror?", choices: ["Hereditary","Midsommar","Both","Just Hereditary"], correct: 0 },
  { question: "What 1990 King adaptation features Pennywise?", choices: ["It (TV miniseries)","2017 It film","Both","Carrie"], correct: 2 },
  { question: "What 2017 film features Pennywise?", choices: ["It","It Chapter Two","Both","Just first"], correct: 0 },
  { question: "Who plays Pennywise in 2017's It?", choices: ["Bill Skarsgard","Tim Curry (1990)","Both played him","Just Skarsgard"], correct: 0 },
  { question: "What 1996 Wes Craven film satirized horror?", choices: ["Scream","Cabin in the Woods","I Know What You Did","Final Destination"], correct: 0 },
  { question: "What 1973 horror by Sutherland features Venice?", choices: ["Don't Look Now","Wicker Man","Exorcist","Carrie"], correct: 0 },
  { question: "What 1976 King adaptation features prom?", choices: ["Carrie","Christine","The Shining","Salem's Lot"], correct: 0 },
  { question: "Who plays Carrie in 1976?", choices: ["Sissy Spacek","Piper Laurie (mother)","Both","Just Spacek"], correct: 0 },
  { question: "What 1968 Polanski film features a creepy baby?", choices: ["Rosemary's Baby","Repulsion","Don't Look Now","The Tenant"], correct: 0 },
  { question: "What 1975 Spielberg horror about a shark?", choices: ["Jaws","Duel","Close Encounters","ET"], correct: 0 },
  { question: "What 2002 Asian horror has the famous well girl?", choices: ["The Ring","Ju-On","Both","Audition"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HorrorFilmsQuizSettings): HorrorFilmsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HorrorFilmsQuizState, action: HorrorFilmsQuizAction): HorrorFilmsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HorrorFilmsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

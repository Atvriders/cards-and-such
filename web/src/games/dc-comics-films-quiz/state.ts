import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DcComicsFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface DcComicsFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DcComicsFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who plays Bruce Wayne in 'The Dark Knight'?", choices: ["Ben Affleck", "Christian Bale", "Robert Pattinson", "Michael Keaton"], correct: 1 },
  { question: "Who directed 'The Dark Knight' trilogy?", choices: ["Tim Burton", "Christopher Nolan", "Zack Snyder", "Matt Reeves"], correct: 1 },
  { question: "Who plays the Joker in 'The Dark Knight' (2008)?", choices: ["Joaquin Phoenix", "Jared Leto", "Heath Ledger", "Cesar Romero"], correct: 2 },
  { question: "Superman's home planet is?", choices: ["Mars", "Krypton", "Apokolips", "Oa"], correct: 1 },
  { question: "Who plays Superman in 'Man of Steel' (2013)?", choices: ["Brandon Routh", "Tom Welling", "Henry Cavill", "Tyler Hoechlin"], correct: 2 },
  { question: "Wonder Woman comes from what island?", choices: ["Atlantis", "Themyscira", "Krypton", "Genosha"], correct: 1 },
  { question: "Who plays Wonder Woman?", choices: ["Lynda Carter", "Gal Gadot", "Brie Larson", "Scarlett Johansson"], correct: 1 },
  { question: "Aquaman's true name is?", choices: ["Arthur Curry", "Bruce Wayne", "Barry Allen", "Hal Jordan"], correct: 0 },
  { question: "The Flash's secret identity?", choices: ["Hal Jordan", "Barry Allen", "Wally West", "Bart Allen"], correct: 1 },
  { question: "Who plays the Joker in the 2019 film 'Joker'?", choices: ["Joaquin Phoenix", "Jared Leto", "Heath Ledger", "Jack Nicholson"], correct: 0 },
  { question: "Who is Batman's loyal butler?", choices: ["Lucius", "Alfred", "Robin", "Gordon"], correct: 1 },
  { question: "The Batmobile is owned by?", choices: ["Clark Kent", "Bruce Wayne", "Tony Stark", "Hal Jordan"], correct: 1 },
  { question: "Lois Lane's love interest?", choices: ["Bruce Wayne", "Clark Kent", "Lex Luthor", "Hal Jordan"], correct: 1 },
  { question: "Superman's archnemesis?", choices: ["Joker", "Lex Luthor", "Brainiac", "General Zod"], correct: 1 },
  { question: "Green Lantern's power source?", choices: ["Solar", "His ring", "Vibranium", "Kryptonite"], correct: 1 },
  { question: "Robin's real name (original)?", choices: ["Tim Drake", "Dick Grayson", "Jason Todd", "Damian Wayne"], correct: 1 },
  { question: "Who plays Batman in 'The Batman' (2022)?", choices: ["Ben Affleck", "Robert Pattinson", "Christian Bale", "Michael Keaton"], correct: 1 },
  { question: "Suicide Squad villain who's a baseball-bat-wielding girlfriend?", choices: ["Catwoman", "Harley Quinn", "Poison Ivy", "Talia"], correct: 1 },
  { question: "Who plays Harley Quinn?", choices: ["Margot Robbie", "Anne Hathaway", "Michelle Pfeiffer", "Halle Berry"], correct: 0 },
  { question: "Catwoman's alter ego?", choices: ["Selina Kyle", "Pamela Isley", "Talia al Ghul", "Vicki Vale"], correct: 0 },
  { question: "Justice League members include all EXCEPT?", choices: ["Wonder Woman", "Aquaman", "Spider-Man", "Cyborg"], correct: 2 },
  { question: "Who is the speedster villain to The Flash?", choices: ["Captain Cold", "Reverse-Flash", "Gorilla Grodd", "All of the above"], correct: 3 },
  { question: "Krypton was destroyed by?", choices: ["Brainiac", "Its core/sun", "Doomsday", "Lex Luthor"], correct: 1 },
  { question: "Wonder Woman's lasso compels?", choices: ["Honesty", "Loyalty", "Speed", "Strength"], correct: 0 },
  { question: "Who is the demonic Spirit of Vengeance hero in DC?", choices: ["Spawn", "Spectre", "Etrigan", "Deadman"], correct: 1 },
  { question: "Doomsday is famous for killing whom?", choices: ["Batman", "Superman", "Robin", "Wonder Woman"], correct: 1 },
  { question: "Gotham City's commissioner?", choices: ["Lt. Bullock", "Cmdr. Gordon", "Cmsr. Gordon", "Cmsr. Loeb"], correct: 2 },
  { question: "Aquaman lives in?", choices: ["Krypton", "Atlantis", "Themyscira", "Apokolips"], correct: 1 },
  { question: "Bizarro is a flawed clone of?", choices: ["Batman", "Superman", "Flash", "Aquaman"], correct: 1 },
  { question: "Who founded the Justice League in most continuities?", choices: ["Aquaman", "Superman", "Batman", "All seven founders"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DcComicsFilmsQuizSettings): DcComicsFilmsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DcComicsFilmsQuizState, action: DcComicsFilmsQuizAction): DcComicsFilmsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DcComicsFilmsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

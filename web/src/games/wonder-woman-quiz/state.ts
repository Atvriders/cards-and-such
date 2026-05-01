import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WonderWomanQuizSettings { questions: "10" | "20"; }
export interface WonderWomanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WonderWomanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Wonder Woman's real name?", choices: ["Diana of Themyscira / Diana Prince", "Selina Kyle", "Hippolyta", "Donna Troy"], correct: 0 },
  { question: "Wonder Woman's homeland?", choices: ["Themyscira (Paradise Island)", "Atlantis", "Asgard", "Olympus"], correct: 0 },
  { question: "Wonder Woman's mother is?", choices: ["Queen Hippolyta", "Athena", "Hera", "Artemis"], correct: 0 },
  { question: "Wonder Woman's lasso compels?", choices: ["Truth", "Loyalty", "Sleep", "Fear"], correct: 0 },
  { question: "Wonder Woman's bracelets are made of?", choices: ["Bracelets of Submission (Amazonian metal)", "Vibranium", "Adamantium", "Mithril"], correct: 0 },
  { question: "Wonder Woman first appeared in?", choices: ["All Star Comics #8 (1941)", "Sensation Comics #1", "Wonder Woman #1", "Action Comics"], correct: 0 },
  { question: "Wonder Woman's creator?", choices: ["William Moulton Marston", "Bob Kane", "Stan Lee", "Jerry Siegel"], correct: 0 },
  { question: "Wonder Woman's love interest (classic)?", choices: ["Steve Trevor", "Bruce Wayne", "Clark Kent", "Hal Jordan"], correct: 0 },
  { question: "Wonder Woman's archenemies include?", choices: ["Cheetah / Ares / Circe", "Joker", "Lex Luthor", "Sinestro"], correct: 0 },
  { question: "Cheetah's real name (Barbara Minerva)?", choices: ["Barbara Ann Minerva", "Selina Kyle", "Pamela Isley", "Lana Lang"], correct: 0 },
  { question: "Wonder Woman is a member of?", choices: ["Justice League", "Avengers", "X-Men", "Teen Titans"], correct: 0 },
  { question: "The Greek god of war (her foe)?", choices: ["Ares", "Zeus", "Hades", "Apollo"], correct: 0 },
  { question: "Wonder Woman's invisible vehicle?", choices: ["Invisible Jet", "Invisible Boat", "Invisible Bike", "Invisible Tank"], correct: 0 },
  { question: "Wonder Woman is a princess of?", choices: ["The Amazons", "Atlantis", "Asgard", "Avalon"], correct: 0 },
  { question: "Diana Prince's profession (modern)?", choices: ["Curator at Smithsonian/museum", "Reporter", "Lawyer", "Doctor"], correct: 0 },
  { question: "Wonder Woman's tiara can be used as a?", choices: ["Throwing weapon", "Shield", "Compass", "Communicator only"], correct: 0 },
  { question: "Donna Troy is Diana's?", choices: ["Sister", "Cousin", "Daughter", "Aunt"], correct: 0 },
  { question: "The Amazons are based on?", choices: ["Greek mythology", "Roman mythology", "Norse mythology", "Egyptian"], correct: 0 },
  { question: "Wonder Woman's first solo film (DCEU) star?", choices: ["Gal Gadot", "Lynda Carter", "Diane Lane", "Margot Robbie"], correct: 0 },
  { question: "Lynda Carter played WW in?", choices: ["1970s TV series", "1990s film", "1960s cartoon", "Comic only"], correct: 0 },
  { question: "Wonder Woman 1984 villain?", choices: ["Maxwell Lord and Cheetah", "Joker", "Lex Luthor", "Doomsday"], correct: 0 },
  { question: "Wonder Woman's god/father is?", choices: ["Zeus (modern continuity)", "Hades", "Hermes", "Apollo"], correct: 0 },
  { question: "Wonder Woman's classic shield material?", choices: ["Aegis-derived (mythic)", "Vibranium", "Steel", "Wood"], correct: 0 },
  { question: "Wonder Woman has the strength of?", choices: ["Demeter (myth gifts)", "Mortal humans", "Robots", "Magic only"], correct: 0 },
  { question: "Hippolyta is queen of the?", choices: ["Amazons", "Atlanteans", "Olympians", "Spartans"], correct: 0 },
  { question: "Themyscira's location is?", choices: ["A hidden island", "Athens", "Mt. Olympus", "Sparta"], correct: 0 },
  { question: "WW's friend Etta Candy is a?", choices: ["Sorority sister/military aide", "Greek goddess", "Robot", "Villainess"], correct: 0 },
  { question: "The Amazons were created by?", choices: ["The Greek goddesses", "Zeus alone", "Hades", "Hera"], correct: 0 },
  { question: "Wonder Woman's iconic colors?", choices: ["Red, blue, gold", "Green, gold", "Black, red", "White, blue"], correct: 0 },
  { question: "Wonder Girl (Cassie) full name?", choices: ["Cassandra Sandsmark", "Donna Troy", "Diana Prince", "Yara Flor"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WonderWomanQuizSettings): WonderWomanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WonderWomanQuizState, action: WonderWomanQuizAction): WonderWomanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WonderWomanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

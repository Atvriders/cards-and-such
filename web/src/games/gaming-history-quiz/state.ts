import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GamingHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface GamingHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GamingHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year was Pong released?", choices: ["1962", "1972", "1980", "1985"], correct: 1 },
  { question: "Who created Mario?", choices: ["Shigeru Miyamoto", "Hironobu Sakaguchi", "Hideo Kojima", "Yu Suzuki"], correct: 0 },
  { question: "Which company made the Atari 2600?", choices: ["Atari", "Nintendo", "Sega", "Coleco"], correct: 0 },
  { question: "What year was Super Mario Bros released?", choices: ["1983", "1985", "1989", "1991"], correct: 1 },
  { question: "Which company made the Sega Genesis?", choices: ["Sega", "Atari", "Nintendo", "NEC"], correct: 0 },
  { question: "Sony's first console was?", choices: ["PlayStation", "PS2", "PS3", "PSP"], correct: 0 },
  { question: "What year did the PlayStation launch in the US?", choices: ["1990", "1995", "1998", "2000"], correct: 1 },
  { question: "Which company made the Xbox?", choices: ["Microsoft", "Sony", "Sega", "Nintendo"], correct: 0 },
  { question: "What was the first FPS game widely credited?", choices: ["Doom", "Wolfenstein 3D", "Quake", "Half-Life"], correct: 1 },
  { question: "Who created Pac-Man?", choices: ["Toru Iwatani", "Shigeru Miyamoto", "Yu Suzuki", "Hideo Kojima"], correct: 0 },
  { question: "What year did Pac-Man release?", choices: ["1980", "1982", "1985", "1990"], correct: 0 },
  { question: "What was the original GameBoy released year?", choices: ["1985", "1989", "1992", "1995"], correct: 1 },
  { question: "Who created Sonic the Hedgehog?", choices: ["Sega's Sonic Team", "Capcom", "Konami", "Namco"], correct: 0 },
  { question: "Which game popularized the battle royale genre?", choices: ["Apex Legends", "PUBG", "Fortnite", "Call of Duty"], correct: 1 },
  { question: "What is Minecraft's creator's name?", choices: ["Notch (Markus Persson)", "Gabe Newell", "John Carmack", "Sid Meier"], correct: 0 },
  { question: "Who founded Valve?", choices: ["Newell and Harrington", "Carmack and Romero", "Miyamoto and Yamauchi", "Wright and Brin"], correct: 0 },
  { question: "Who created Doom?", choices: ["Carmack and Romero", "Sid Meier", "John Newell", "Jeff Minter"], correct: 0 },
  { question: "Which arcade game crashed Donkey Kong?", choices: ["Donkey Kong (1981 itself was a smash)", "Pac-Man", "Galaga", "Space Invaders"], correct: 0 },
  { question: "What year was the NES released in NA?", choices: ["1983", "1985", "1989", "1992"], correct: 1 },
  { question: "What is Tetris' country of origin?", choices: ["Japan", "USA", "Soviet Union", "UK"], correct: 2 },
  { question: "Who designed Tetris?", choices: ["Alexey Pajitnov", "Hideo Kojima", "Sid Meier", "Will Wright"], correct: 0 },
  { question: "Which famous platformer features Lara Croft?", choices: ["Tomb Raider", "Indiana Jones", "Uncharted", "Far Cry"], correct: 0 },
  { question: "Which engine powers many Bethesda games?", choices: ["Unity", "Creation Engine", "Unreal", "CryEngine"], correct: 1 },
  { question: "Who designed The Legend of Zelda?", choices: ["Miyamoto", "Sakaguchi", "Kojima", "Aonuma"], correct: 0 },
  { question: "Which company did Nintendo originally start as?", choices: ["Toy maker", "Playing card company", "Restaurant", "Camera maker"], correct: 1 },
  { question: "What's the best-selling console of all time?", choices: ["PS2", "Xbox 360", "Nintendo Switch", "DS"], correct: 0 },
  { question: "What year was Half-Life 2 released?", choices: ["2001", "2004", "2008", "2010"], correct: 1 },
  { question: "Which game did Sid Meier create?", choices: ["Civilization", "Doom", "Tetris", "Mario"], correct: 0 },
  { question: "What does MMORPG stand for?", choices: ["Massive Multiplayer Online Roleplaying Game", "Multi-Mode Online RPG", "Massive Online Game", "Massively Online Realm Game"], correct: 0 },
  { question: "Which fighting game franchise's cast includes Ryu, Ken?", choices: ["Mortal Kombat", "Street Fighter", "Tekken", "Killer Instinct"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GamingHistoryQuizSettings): GamingHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GamingHistoryQuizState, action: GamingHistoryQuizAction): GamingHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GamingHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

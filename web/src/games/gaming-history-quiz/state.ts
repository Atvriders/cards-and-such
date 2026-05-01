import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GamingHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface GamingHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GamingHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year was Pong released by Atari?", choices: ["1968", "1972", "1975", "1978"], correct: 1 },
  { question: "Who designed Super Mario Bros.?", choices: ["Shigeru Miyamoto", "Satoshi Tajiri", "Hideo Kojima", "Yu Suzuki"], correct: 0 },
  { question: "Which company produced the Atari 2600?", choices: ["Atari", "Coleco", "Magnavox", "Mattel"], correct: 0 },
  { question: "In what year did Super Mario Bros. release in Japan?", choices: ["1983", "1985", "1987", "1989"], correct: 1 },
  { question: "Who created Sonic the Hedgehog at Sega?", choices: ["Yuji Naka", "Hironobu Sakaguchi", "Tomonobu Itagaki", "Keiji Inafune"], correct: 0 },
  { question: "Sony's first home console was named what?", choices: ["PlayStation", "PSX-1", "Sony Beta", "PS One"], correct: 0 },
  { question: "In what year did the original PlayStation launch in North America?", choices: ["1993", "1995", "1997", "1999"], correct: 1 },
  { question: "Microsoft entered the console market with which system?", choices: ["Xbox", "Zune", "Windows Console", "Surface"], correct: 0 },
  { question: "Which 1992 id Software title popularized first-person shooters?", choices: ["Doom", "Wolfenstein 3D", "Quake", "Hexen"], correct: 1 },
  { question: "Who designed Pac-Man for Namco?", choices: ["Toru Iwatani", "Masaya Nakamura", "Tomohiro Nishikado", "Yu Suzuki"], correct: 0 },
  { question: "Pac-Man was first released in which year?", choices: ["1978", "1980", "1982", "1984"], correct: 1 },
  { question: "In what year did the Nintendo Game Boy launch in Japan?", choices: ["1987", "1989", "1991", "1993"], correct: 1 },
  { question: "Which 2017 game popularized the modern battle royale boom?", choices: ["Apex Legends", "PUBG", "Fortnite", "Call of Duty: Warzone"], correct: 1 },
  { question: "Who is the original creator of Minecraft?", choices: ["Markus 'Notch' Persson", "Jens Bergensten", "Gabe Newell", "Tim Sweeney"], correct: 0 },
  { question: "Who co-founded Valve Corporation in 1996?", choices: ["Gabe Newell and Mike Harrington", "John Carmack and John Romero", "Tim Sweeney and Mark Rein", "Ken Levine and Jon Chey"], correct: 0 },
  { question: "Which programmers were behind id Software's Doom?", choices: ["John Carmack and John Romero", "Sid Meier and Bruce Shelley", "Will Wright and Jeff Braun", "Ron Gilbert and Tim Schafer"], correct: 0 },
  { question: "In which year was the NES released in North America?", choices: ["1983", "1985", "1987", "1989"], correct: 1 },
  { question: "Tetris was created in 1984 in which country?", choices: ["Japan", "United States", "Soviet Union", "United Kingdom"], correct: 2 },
  { question: "Who designed Tetris?", choices: ["Alexey Pajitnov", "Hideo Kojima", "Will Wright", "Sid Meier"], correct: 0 },
  { question: "Which series stars adventurer Lara Croft?", choices: ["Tomb Raider", "Uncharted", "Indiana Jones", "Far Cry"], correct: 0 },
  { question: "Which engine has powered most Bethesda RPGs since Oblivion?", choices: ["Unreal", "Unity", "Creation Engine", "CryEngine"], correct: 2 },
  { question: "Who created The Legend of Zelda?", choices: ["Shigeru Miyamoto", "Eiji Aonuma", "Takashi Tezuka", "Koji Kondo"], correct: 0 },
  { question: "Nintendo originally began in 1889 as a maker of what?", choices: ["Toys", "Hanafuda playing cards", "Vacuum cleaners", "Cameras"], correct: 1 },
  { question: "Which is the best-selling home console of all time?", choices: ["PlayStation 2", "Nintendo Wii", "Xbox 360", "PlayStation 4"], correct: 0 },
  { question: "In what year was Half-Life 2 released?", choices: ["2002", "2004", "2006", "2008"], correct: 1 },
  { question: "Which strategy series did Sid Meier create?", choices: ["Civilization", "Age of Empires", "Total War", "StarCraft"], correct: 0 },
  { question: "What does MMORPG stand for?", choices: ["Massively Multiplayer Online Role-Playing Game", "Multi-Mode Online RPG", "Massive Online Realm Game", "Modern Multiplayer Online RPG"], correct: 0 },
  { question: "Ryu and Ken are signature characters of which fighting franchise?", choices: ["Mortal Kombat", "Street Fighter", "Tekken", "Virtua Fighter"], correct: 1 },
  { question: "The 1983 North American video game crash is most associated with which game?", choices: ["E.T. the Extra-Terrestrial", "Pac-Man", "Donkey Kong", "Asteroids"], correct: 0 },
  { question: "Which company developed the original Final Fantasy?", choices: ["Square", "Enix", "Capcom", "Konami"], correct: 0 },
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

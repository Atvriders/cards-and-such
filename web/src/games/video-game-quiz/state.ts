import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface VideoGameQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type VideoGameQuizAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" };
export interface VideoGameQuizSettings { questions: "10"|"20" }
const ALL_QUESTIONS: QuizQuestion[] = [
  { question:"Who is the plumber hero of Nintendo's flagship franchise?", choices:["Donkey Kong","Mario","Luigi","Wario"], correct:1 },
  { question:"Which game popularized the battle royale genre in 2017?", choices:["Warzone","PUBG","Fortnite","Apex Legends"], correct:1 },
  { question:"The Legend of Zelda protagonist is named?", choices:["Zelda","Ganon","Link","Sheik"], correct:2 },
  { question:"Which company made the original PlayStation?", choices:["Sega","Nintendo","Microsoft","Sony"], correct:3 },
  { question:"Pac-Man was originally called what?", choices:["Gobbler","Chomp Man","Puck Man","Circle Man"], correct:2 },
  { question:"In Minecraft, what resource is needed to craft a torch?", choices:["Redstone","Coal or Charcoal","Iron","Flint"], correct:1 },
  { question:"Which RPG series features protagonist Cloud Strife?", choices:["Dragon Quest","Final Fantasy","Tales of","Persona"], correct:1 },
  { question:"GTA stands for?", choices:["Grand Theft Auto","Game Time Action","Great Territory Adventure","Global Tactical Assault"], correct:0 },
  { question:"Which game features the fictional country of Hyrule?", choices:["Fire Emblem","Metroid","The Legend of Zelda","Xenoblade"], correct:2 },
  { question:"The Doom Slayer battles demons from where?", choices:["Purgatory","Hell","Another dimension","A simulation"], correct:1 },
  { question:"Which game uses the Paragon/Renegade morality system?", choices:["Dragon Age","Mass Effect","KOTOR","Fable"], correct:1 },
  { question:"Pikachu is from which franchise?", choices:["Digimon","Yo-kai Watch","Pokémon","Monster Hunter"], correct:2 },
  { question:"Which studio made The Witcher 3?", choices:["Bethesda","Rockstar","CD Projekt Red","Larian"], correct:2 },
  { question:"Halo's main protagonist is known as?", choices:["Noble Six","Spartan-117 (Master Chief)","Doomguy","Samus"], correct:1 },
  { question:"What year did the original Super Mario Bros. release?", choices:["1983","1984","1985","1986"], correct:2 },
  { question:"Tetris was invented by which nationality?", choices:["American","Japanese","British","Russian"], correct:3 },
  { question:"Which game popularized 'Candy Crush' match-3 mechanics?", choices:["Bejeweled","Puzzle Bobble","Candy Crush Saga","Gems of War"], correct:2 },
  { question:"Red Dead Redemption 2 is set in which era?", choices:["Civil War","Wild West 1899","Prohibition 1920s","Great Depression"], correct:1 },
  { question:"Which sandbox game lets you build with virtual Lego-style blocks?", choices:["Terraria","Roblox","Minecraft","Core"], correct:2 },
  { question:"The Dark Souls series was made by which studio?", choices:["Bandai Namco","Capcom","FromSoftware","Atlus"], correct:2 },
];
function shuffle<T>(arr: T[], rng: ()=>number): T[] { const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VideoGameQuizSettings): VideoGameQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const indexed=q.choices.map((c,i)=>({c,i}));const sh=shuffle(indexed,rng);const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};});
  return { questions, currentIndex:0, selected:null, submitted:false, score:0, correctCount:0, phase:"playing" };
}
export function reducer(state: VideoGameQuizState, action: VideoGameQuizAction): VideoGameQuizState {
  if(state.phase==="done") return state;
  switch(action.type){
    case "select": return state.submitted?state:{...state,selected:action.choice};
    case "submit": {if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;return{...state,submitted:true,score:state.score+(ok?100:0),correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "next": {const next=state.currentIndex+1;if(next>=state.questions.length)return{...state,phase:"done"};return{...state,currentIndex:next,selected:null,submitted:false,phase:"playing"};}
    default: return state;
  }
}
export function isTerminal(state: VideoGameQuizState): { score:number }|null { return state.phase==="done"?{score:state.score}:null; }

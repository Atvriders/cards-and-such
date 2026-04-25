import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface MusicDecadeQuizState {
  questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean;
  score: number; correctCount: number; phase: "playing"|"result"|"done";
}
export type MusicDecadeQuizAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" };
export interface MusicDecadeQuizSettings { questions: "10"|"20" }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question:"Which decade did rock and roll emerge?", choices:["1940s","1950s","1960s","1930s"], correct:1 },
  { question:"'Bohemian Rhapsody' was released in which decade?", choices:["1960s","1980s","1970s","1990s"], correct:2 },
  { question:"Which decade saw disco dominate pop culture?", choices:["1960s","1980s","1970s","1990s"], correct:2 },
  { question:"Nirvana's 'Nevermind' was released in which decade?", choices:["1980s","1990s","2000s","2010s"], correct:1 },
  { question:"The Beatles formed in which decade?", choices:["1950s","1970s","1960s","1980s"], correct:0 },
  { question:"Hip-hop originated in which decade?", choices:["1960s","1980s","1990s","1970s"], correct:3 },
  { question:"'Thriller' by Michael Jackson was released in which decade?", choices:["1970s","1980s","1990s","2000s"], correct:1 },
  { question:"Punk rock exploded onto the scene in which decade?", choices:["1960s","1980s","1970s","1990s"], correct:2 },
  { question:"Which decade produced Woodstock (original)?", choices:["1960s","1970s","1950s","1980s"], correct:0 },
  { question:"Grunge music peaked in which decade?", choices:["1980s","2000s","1990s","1970s"], correct:2 },
  { question:"Which decade featured the British Invasion?", choices:["1950s","1970s","1980s","1960s"], correct:3 },
  { question:"Eminem's 'The Slim Shady LP' came out in which decade?", choices:["1980s","2000s","1990s","2010s"], correct:2 },
  { question:"Electronic dance music (EDM) mainstream rise occurred in which decade?", choices:["1990s","2010s","1980s","2000s"], correct:1 },
  { question:"Bob Dylan went electric at Newport in which decade?", choices:["1950s","1970s","1960s","1980s"], correct:2 },
  { question:"'Smells Like Teen Spirit' was a hit in which decade?", choices:["1980s","2000s","1990s","1970s"], correct:2 },
  { question:"Motown Records was founded in which decade?", choices:["1940s","1960s","1970s","1950s"], correct:3 },
  { question:"Which decade featured synthesizer-heavy New Wave music?", choices:["1970s","1990s","1980s","2000s"], correct:2 },
  { question:"'Purple Rain' by Prince was released in which decade?", choices:["1970s","1990s","1980s","2000s"], correct:2 },
  { question:"The Eagles 'Hotel California' came from which decade?", choices:["1960s","1980s","1990s","1970s"], correct:3 },
  { question:"Taylor Swift debuted in which decade?", choices:["1990s","2010s","2000s","2020s"], correct:2 },
];

function shuffle<T>(arr: T[], rng: ()=>number): T[] {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a;
}

export function initialState(seed: number, settings: MusicDecadeQuizSettings): MusicDecadeQuizState {
  const rng=mulberry32(seed);
  const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{
    const indexed=q.choices.map((c,i)=>({c,i}));
    const sh=shuffle(indexed,rng);
    const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;
    return { ...q, choices:sh.map(x=>x.c) as [string,string,string,string], correct:newCorrect };
  });
  return { questions, currentIndex:0, selected:null, submitted:false, score:0, correctCount:0, phase:"playing" };
}

export function reducer(state: MusicDecadeQuizState, action: MusicDecadeQuizAction): MusicDecadeQuizState {
  if(state.phase==="done") return state;
  switch(action.type) {
    case "select": return state.submitted ? state : { ...state, selected:action.choice };
    case "submit": {
      if(state.submitted||state.selected===null) return state;
      const q=state.questions[state.currentIndex]!;
      const ok=state.selected===q.correct;
      return { ...state, submitted:true, score:state.score+(ok?100:0), correctCount:state.correctCount+(ok?1:0), phase:"result" };
    }
    case "next": {
      const next=state.currentIndex+1;
      if(next>=state.questions.length) return { ...state, phase:"done" };
      return { ...state, currentIndex:next, selected:null, submitted:false, phase:"playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: MusicDecadeQuizState): { score:number }|null {
  return state.phase==="done" ? { score:state.score } : null;
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface TvShowQuizState {
  questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean;
  score: number; correctCount: number; phase: "playing"|"result"|"done";
}
export type TvShowQuizAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" };
export interface TvShowQuizSettings { questions: "10"|"20" }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question:"Which show features the fictional Dunder Mifflin paper company?", choices:["Parks and Recreation","The Office","30 Rock","Arrested Development"], correct:1 },
  { question:"Walter White is the main character in which series?", choices:["Dexter","Ozark","Breaking Bad","Better Call Saul"], correct:2 },
  { question:"'Winter is Coming' is the motto of which TV house?", choices:["Lannister","Baratheon","Stark","Targaryen"], correct:2 },
  { question:"Which show follows the Pearson family across multiple timelines?", choices:["Brothers & Sisters","This Is Us","Parenthood","Grey's Anatomy"], correct:1 },
  { question:"The Upside Down appears in which Netflix series?", choices:["Dark","Sense8","Stranger Things","Black Mirror"], correct:2 },
  { question:"Which show is set in the fictional town of Pawnee, Indiana?", choices:["The Good Place","Parks and Recreation","Community","Brooklyn Nine-Nine"], correct:1 },
  { question:"Tony Soprano runs which type of criminal organization?", choices:["Drug cartel","Russian mob","New Jersey mafia","Biker gang"], correct:2 },
  { question:"Which series follows the Bluth family and their frozen banana stand?", choices:["Curb Your Enthusiasm","Arrested Development","It's Always Sunny","Veep"], correct:1 },
  { question:"'You know nothing, Jon Snow' is from which show?", choices:["Vikings","The Last Kingdom","Game of Thrones","Outlander"], correct:2 },
  { question:"The Island appears in which ABC mystery series?", choices:["Prison Break","24","Lost","Alias"], correct:2 },
  { question:"Which sitcom is set in the fictional Greendale Community College?", choices:["The Big Bang Theory","Community","New Girl","Happy Endings"], correct:1 },
  { question:"Don Draper is an ad executive in which AMC drama?", choices:["Halt and Catch Fire","Rubicon","Mad Men","The Americans"], correct:2 },
  { question:"Which show features a 'Multiverse of Madness' with animated characters alongside humans?", choices:["Rick and Morty","Solar Opposites","Futurama","BoJack Horseman"], correct:0 },
  { question:"Sheldon Cooper appears in which CBS sitcom?", choices:["How I Met Your Mother","Two and a Half Men","The Big Bang Theory","Mike & Molly"], correct:2 },
  { question:"Which show is a prequel to Breaking Bad?", choices:["Ozark","El Camino","Better Call Saul","Narcos"], correct:2 },
  { question:"The Scofield brothers escape from Fox River Penitentiary in which series?", choices:["Alcatraz","Prison Break","Escape at Dannemora","Justified"], correct:1 },
  { question:"Which anthology series explores technology's dark side?", choices:["Years and Years","Electric Dreams","Black Mirror","Westworld"], correct:2 },
  { question:"Which show follows a chemistry teacher who becomes a drug lord?", choices:["Narcos","Weeds","Ozark","Breaking Bad"], correct:3 },
  { question:"Yellowstone follows the Dutton family in which US state?", choices:["Wyoming","Montana","Colorado","Idaho"], correct:1 },
  { question:"Which show coined the phrase 'How you doin'?", choices:["Seinfeld","Friends","Frasier","Will & Grace"], correct:1 },
];

function shuffle<T>(arr: T[], rng: ()=>number): T[] {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a;
}

export function initialState(seed: number, settings: TvShowQuizSettings): TvShowQuizState {
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

export function reducer(state: TvShowQuizState, action: TvShowQuizAction): TvShowQuizState {
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

export function isTerminal(state: TvShowQuizState): { score:number }|null {
  return state.phase==="done" ? { score:state.score } : null;
}

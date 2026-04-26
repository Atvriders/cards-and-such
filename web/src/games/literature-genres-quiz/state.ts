import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface LitGenresState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type LitGenresAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface LitGenresSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Which genre features magic, invented worlds, and non-human creatures?", choices:["Science fiction","Fantasy","Horror","Thriller"], correct:1 },
  { question:"What literary genre is set in the future and involves advanced technology?", choices:["Fantasy","Romance","Science fiction","Historical fiction"], correct:2 },
  { question:"Which genre focuses on a romantic relationship as the central plot?", choices:["Mystery","Romance","Crime","Satire"], correct:1 },
  { question:"In which genre does the protagonist solve a crime or puzzle?", choices:["Western","Satire","Mystery","Comedy"], correct:2 },
  { question:"Which genre parodies or mocks social conventions for comic effect?", choices:["Satire","Gothic","Realism","Tragedy"], correct:0 },
  { question:"Which genre depicts the American frontier and cowboy life?", choices:["Historical fiction","Western","Adventure","Spy fiction"], correct:1 },
  { question:"Which genre blends horror, romance, and the supernatural in gloomy settings?", choices:["Gothic","Realism","Modernism","Surrealism"], correct:0 },
  { question:"Which genre aims to portray everyday life truthfully without idealization?", choices:["Fantasy","Realism","Magical realism","Surrealism"], correct:1 },
  { question:"Which genre mixes realistic settings with magical elements matter-of-factly?", choices:["Surrealism","Realism","Magical realism","Fantasy"], correct:2 },
  { question:"Which genre involves covert agents, espionage, and international intrigue?", choices:["Thriller","Spy fiction","Western","Adventure"], correct:1 },
  { question:"Which genre centers on personal growth, often from youth to adulthood?", choices:["Bildungsroman","Epic","Satire","Allegory"], correct:0 },
  { question:"An allegory is best described as?", choices:["A poem with no rhyme","A story with a hidden symbolic meaning","A narrative set at sea","A comedy with music"], correct:1 },
  { question:"Which genre uses extreme fear and dread as its primary emotion?", choices:["Thriller","Comedy","Horror","Adventure"], correct:2 },
  { question:"Which genre features high-stakes suspense and danger to the protagonist?", choices:["Romance","Thriller","Satire","Pastoral"], correct:1 },
  { question:"Which genre depicts rural, idealized country life?", choices:["Urban fiction","Pastoral","Naturalism","Realism"], correct:1 },
  { question:"Which genre shows that environment and heredity determine character?", choices:["Naturalism","Modernism","Expressionism","Romanticism"], correct:0 },
  { question:"Romanticism (literary) emphasizes?", choices:["Reason and logic","Emotion, nature, and the individual","Industry and progress","Urban life"], correct:1 },
  { question:"Which genre is set in a real historical period with fictionalized events?", choices:["Alternate history","Historical fiction","Biography","Science fiction"], correct:1 },
  { question:"Alternate history asks which question?", choices:["What will happen next?","What if history had gone differently?","Who committed the crime?","How does technology evolve?"], correct:1 },
  { question:"Which genre is written in verse and often expresses personal feeling?", choices:["Prose fiction","Poetry","Essay","Drama"], correct:1 },
  { question:"Which genre is intended to be performed on stage?", choices:["Epic","Lyric","Drama","Novel"], correct:2 },
  { question:"Which sub-genre features detective fiction with hard-boiled protagonists?", choices:["Cozy mystery","Noir","Police procedural","Legal thriller"], correct:1 },
  { question:"A picaresque novel follows what type of protagonist?", choices:["A noble hero","A lovable rogue on episodic adventures","A scientist","A ghost"], correct:1 },
  { question:"Which genre often uses dystopian or utopian societies to critique society?", choices:["Romance","Speculative fiction","Historical fiction","Comedy"], correct:1 },
  { question:"Which genre specifically explores African American experience and culture?", choices:["Magical realism","Harlem Renaissance literature","Gothic fiction","Pastoral"], correct:1 },
  { question:"Which genre features very short, compressed stories (often under 1000 words)?", choices:["Flash fiction","Novella","Epic","Saga"], correct:0 },
  { question:"An epistolary novel is told through?", choices:["Dialogue only","Letters, diary entries, or documents","Third-person omniscient narrator","Verse"], correct:1 },
  { question:"Which genre features an anti-hero navigating moral ambiguity in an urban setting?", choices:["Pastoral","Urban noir","Epic fantasy","Comedy of manners"], correct:1 },
  { question:"Which genre uses absurdist humor to explore existential themes?", choices:["Comedy of manners","Absurdist fiction","Satire","Gothic"], correct:1 },
  { question:"Which genre is rooted in folklore, fairy tales, and oral tradition?", choices:["Postmodernism","Folk literature","Naturalism","New Journalism"], correct:1 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:LitGenresSettings):LitGenresState {
  const rng=mulberry32(seed);
  const count=parseInt(settings.questions,10);
  let pool=shuffle([...ALL_Q],rng).slice(0,Math.min(count,ALL_Q.length));
  const questions=pool.map(q=>{
    const idx=q.choices.map((c,i)=>({c,i}));
    const sh=shuffle(idx,rng);
    const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;
    return {...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};
  });
  return {questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}

export function reducer(state:LitGenresState, action:LitGenresAction):LitGenresState {
  if(state.phase==="done") return state;
  switch(action.type){
    case"select": if(state.submitted) return state; return {...state,selected:action.choice};
    case"submit":{
      if(state.submitted||state.selected===null) return state;
      const q=state.questions[state.currentIndex]!;
      const ok=state.selected===q.correct;
      const pts=ok?100+Math.floor(state.timeLeft*10):0;
      return {...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};
    }
    case"tick":{
      if(state.submitted) return state;
      const t=state.timeLeft-1;
      if(t<=0) return {...state,timeLeft:0,submitted:true,phase:"result"};
      return {...state,timeLeft:t};
    }
    case"next":{
      const next=state.currentIndex+1;
      if(next>=state.questions.length) return {...state,phase:"done"};
      return {...state,currentIndex:next,selected:null,submitted:false,timeLeft:15,phase:"playing"};
    }
    default: return state;
  }
}

export function isTerminal(state:LitGenresState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}

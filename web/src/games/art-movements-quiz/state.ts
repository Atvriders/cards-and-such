import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface ArtMovementsState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type ArtMovementsAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface ArtMovementsSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Which movement, begun in 1870s France, used short brushstrokes to capture light?", choices:["Cubism","Impressionism","Realism","Baroque"], correct:1 },
  { question:"Who painted The Starry Night?", choices:["Claude Monet","Paul Gauguin","Vincent van Gogh","Paul Cézanne"], correct:2 },
  { question:"Cubism was pioneered by Picasso and which other artist?", choices:["Salvador Dalí","Georges Braque","Wassily Kandinsky","Henri Matisse"], correct:1 },
  { question:"Which movement depicted dreams and the unconscious mind?", choices:["Futurism","Dadaism","Surrealism","Pop Art"], correct:2 },
  { question:"Salvador Dalí belonged to which movement?", choices:["Expressionism","Surrealism","Abstract Expressionism","Art Nouveau"], correct:1 },
  { question:"Which movement, started in WWI, rejected conventional art as protest?", choices:["Bauhaus","Dadaism","Fauvism","De Stijl"], correct:1 },
  { question:"Action painting and dripping techniques define which movement?", choices:["Pop Art","Minimalism","Abstract Expressionism","Conceptual Art"], correct:2 },
  { question:"Jackson Pollock is associated with which movement?", choices:["Impressionism","Abstract Expressionism","Surrealism","Fauvism"], correct:1 },
  { question:"Which movement used bold flat colors and was called wild beasts?", choices:["Expressionism","Fauvism","Cubism","Pointillism"], correct:1 },
  { question:"Henri Matisse was a leading figure in which movement?", choices:["Fauvism","Dadaism","Pop Art","Realism"], correct:0 },
  { question:"Which movement celebrated machine age and speed, founded in Italy in 1909?", choices:["Futurism","Constructivism","Bauhaus","De Stijl"], correct:0 },
  { question:"Which design school combined fine arts and crafts, founded in Germany in 1919?", choices:["Art Nouveau","Bauhaus","De Stijl","Constructivism"], correct:1 },
  { question:"Pop Art used imagery from which source?", choices:["Nature","Mass media and consumer culture","Ancient mythology","Abstract geometry"], correct:1 },
  { question:"Andy Warhol is famous for which movement?", choices:["Abstract Expressionism","Minimalism","Pop Art","Conceptual Art"], correct:2 },
  { question:"Which movement used everyday objects as art, including Marcel Duchamp's urinal?", choices:["Dadaism","Conceptual Art","Fluxus","Minimalism"], correct:0 },
  { question:"Which movement features clean geometric abstraction and 'less is more'?", choices:["Baroque","Minimalism","Fauvism","Expressionism"], correct:1 },
  { question:"The Baroque style is known for?", choices:["Simple flat colors","Dramatic lighting and ornate detail","Geometric abstraction","Dreamlike imagery"], correct:1 },
  { question:"Pointillism used what technique?", choices:["Short curved strokes","Tiny dots of color","Dripped paint","Collage"], correct:1 },
  { question:"Georges Seurat pioneered which technique?", choices:["Action painting","Pointillism","Cubism","Collage"], correct:1 },
  { question:"Which movement sought harmony with nature using organic curves (c.1890)?", choices:["Constructivism","Art Nouveau","De Stijl","Futurism"], correct:1 },
  { question:"De Stijl used which colors exclusively in its strictest form?", choices:["Pastels","Primary colors plus black and white","Earth tones","Neon colors"], correct:1 },
  { question:"Which 19th-century movement idealized medieval craftsmanship in reaction to industry?", choices:["Neoclassicism","Arts and Crafts Movement","Realism","Romanticism"], correct:1 },
  { question:"Romantic landscape painting emphasized?", choices:["Industrial scenes","Sublime nature and emotion","Still life","Urban poverty"], correct:1 },
  { question:"Which movement emerged in the 1960s and placed meaning above aesthetics?", choices:["Pop Art","Conceptual Art","Minimalism","Op Art"], correct:1 },
  { question:"Op Art creates illusions of?", choices:["Texture","Movement and depth through pattern","Emotion","Sound"], correct:1 },
  { question:"Which German movement expressed raw emotion through distorted forms?", choices:["Fauvism","Expressionism","Impressionism","Dadaism"], correct:1 },
  { question:"The Harlem Renaissance was primarily known as a flowering of?", choices:["European art","African American art, literature, and music","Latin American art","Asian art"], correct:1 },
  { question:"Street art and graffiti are associated with which movement?", choices:["Fluxus","Post-Modernism","Urban art movement","Land Art"], correct:2 },
  { question:"Land Art uses which materials?", choices:["Canvas and oil","The natural landscape itself","Digital tools","Paper collage"], correct:1 },
  { question:"Which movement reacted against modernism using historical references and irony?", choices:["Postmodernism","Neo-Expressionism","Minimalism","De Stijl"], correct:0 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:ArtMovementsSettings):ArtMovementsState {
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

export function reducer(state:ArtMovementsState, action:ArtMovementsAction):ArtMovementsState {
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

export function isTerminal(state:ArtMovementsState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}

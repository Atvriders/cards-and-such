import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AiHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface AiHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AiHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who proposed the Turing test?", choices: ["Alan Turing", "Marvin Minsky", "John McCarthy", "Geoffrey Hinton"], correct: 0 },
  { question: "Who coined 'artificial intelligence'?", choices: ["John McCarthy", "Alan Turing", "Marvin Minsky", "Claude Shannon"], correct: 0 },
  { question: "Where was the famous 1956 AI workshop held?", choices: ["MIT", "Dartmouth", "Stanford", "Carnegie Mellon"], correct: 1 },
  { question: "What was the first chatbot?", choices: ["ELIZA", "PARRY", "ALICE", "Cleverbot"], correct: 0 },
  { question: "Who developed ELIZA?", choices: ["Joseph Weizenbaum", "John McCarthy", "Marvin Minsky", "Allen Newell"], correct: 0 },
  { question: "What is a neural network's basic unit?", choices: ["Neuron/perceptron", "Bit", "Atom", "Algorithm"], correct: 0 },
  { question: "Who invented the perceptron?", choices: ["Rosenblatt", "Minsky", "Hinton", "LeCun"], correct: 0 },
  { question: "What book criticized perceptrons in 1969?", choices: ["Perceptrons", "GEB", "Society of Mind", "AI: A Modern Approach"], correct: 0 },
  { question: "Which IBM AI beat Garry Kasparov?", choices: ["Deep Blue", "Watson", "Project Debater", "Lab"], correct: 0 },
  { question: "What year did Deep Blue beat Kasparov?", choices: ["1990", "1995", "1997", "2000"], correct: 2 },
  { question: "Which AI beat Lee Sedol at Go?", choices: ["AlphaGo", "Watson", "Deep Blue", "AlphaZero"], correct: 0 },
  { question: "Who founded DeepMind?", choices: ["Demis Hassabis et al", "Yann LeCun", "Andrew Ng", "Geoffrey Hinton"], correct: 0 },
  { question: "What is GPT short for?", choices: ["Generative Pre-trained Transformer", "Global Predictive Token", "Generic Prompt Tool", "General Process Type"], correct: 0 },
  { question: "Who is called a 'godfather of deep learning'?", choices: ["Hinton", "Bengio", "LeCun", "All three"], correct: 3 },
  { question: "What architecture introduced 'attention' for NLP?", choices: ["RNN", "CNN", "Transformer", "GAN"], correct: 2 },
  { question: "Who introduced GANs (2014)?", choices: ["Goodfellow et al", "Hinton", "LeCun", "Ng"], correct: 0 },
  { question: "What does ML stand for?", choices: ["Machine Learning", "Multi-layer", "Massive Logic", "Memory Loop"], correct: 0 },
  { question: "Which 1980s era is known as 'AI winter'?", choices: ["Boom era", "Period of reduced AI funding", "Recession of computing", "Internet bubble"], correct: 1 },
  { question: "What does CNN (in DL) stand for?", choices: ["Convolutional Neural Network", "Cable News Network", "Channel Net", "Compressed Net"], correct: 0 },
  { question: "What is reinforcement learning?", choices: ["Learning from rewards/penalties", "Learning from labels only", "Memory only", "Symbolic AI"], correct: 0 },
  { question: "Who built Watson (Jeopardy)?", choices: ["IBM", "Google", "Microsoft", "Apple"], correct: 0 },
  { question: "What does NLP stand for?", choices: ["Natural Language Processing", "Neural Loop Path", "Native List Protocol", "Network Logic Plan"], correct: 0 },
  { question: "Which framework is by Google Brain?", choices: ["PyTorch", "TensorFlow", "Keras (joined into TF later)", "MXNet"], correct: 1 },
  { question: "Which framework is from Meta/Facebook AI?", choices: ["TensorFlow", "PyTorch", "JAX", "Theano"], correct: 1 },
  { question: "What is a transformer best known for?", choices: ["Translation/NLP", "Image only", "Reinforcement only", "Sound only"], correct: 0 },
  { question: "Who runs OpenAI as CEO (2024)?", choices: ["Sam Altman", "Elon Musk", "Demis Hassabis", "Jensen Huang"], correct: 0 },
  { question: "What was AlphaFold known for?", choices: ["Game playing", "Protein structure prediction", "Image generation", "Speech recognition"], correct: 1 },
  { question: "What is overfitting?", choices: ["Model fits training too closely, fails to generalize", "Underpowered model", "Not enough data", "Slow training"], correct: 0 },
  { question: "Which is a generative AI text product (early)?", choices: ["ChatGPT", "Excel", "Photoshop", "Word"], correct: 0 },
  { question: "What year did ChatGPT launch?", choices: ["2018", "2020", "2022", "2024"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AiHistoryQuizSettings): AiHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AiHistoryQuizState, action: AiHistoryQuizAction): AiHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AiHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

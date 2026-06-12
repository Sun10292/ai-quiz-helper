// Types for the quiz application

export type QuestionType = 'choice' | 'fill' | 'essay';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ChoiceOption {
  label: string; // A, B, C, D
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options?: ChoiceOption[];        // for choice questions
  correctAnswer?: string;          // for choice (A/B/C/D) and fill-in-blank
  explanation: string;
  reference?: string;              // for essay - model answer
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
}

export interface QuizSession {
  id: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questions: Question[];
  answers: UserAnswer[];
  score?: number;
  totalQuestions: number;
  createdAt: string;
}

export interface GenerateRequest {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  count: number;
  types: QuestionType[];
  weakPointsPrompt?: string;  // from history analysis
}

export interface ScoreRequest {
  question: Question;
  userAnswer: string;
}

export interface ScoreResult {
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
}

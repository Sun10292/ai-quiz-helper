'use client';

import { useState, useEffect, useCallback } from 'react';
import { Question, UserAnswer, ScoreResult, Difficulty, QuestionType, QuizSession } from '@/types';
import { saveSession, getHistory } from '@/lib/storage';
import SetupForm from './SetupForm';
import QuizCard from './QuizCard';
import ResultSummary from './ResultSummary';
import HistoryPanel from './HistoryPanel';

type AppState = 'setup' | 'quiz' | 'result';

export default function QuizApp() {
  const [appState, setAppState] = useState<AppState>('setup');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, ScoreResult>>({});
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  // Check if there's history on mount
  useEffect(() => {
    setHasHistory(getHistory().length > 0);
  }, []);

  // Refresh history indicator
  const refreshHistory = useCallback(() => {
    setHasHistory(getHistory().length > 0);
  }, []);

  const handleStart = async (config: {
    subject: string;
    topic: string;
    difficulty: Difficulty;
    count: number;
    types: QuestionType[];
    weakPointsPrompt?: string;
  }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '生成失败');
      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswers({});
      setResults({});
      setAppState('quiz');
    } catch (err: any) {
      setError(err.message || '出题失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer: UserAnswer) => {
    const question = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [question.id]: answer.answer }));

    if (question.type === 'choice' || question.type === 'fill') {
      try {
        const res = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, userAnswer: answer.answer }),
        });
        const data = await res.json();
        if (res.ok) {
          setResults(prev => ({ ...prev, [question.id]: data }));
        }
      } catch {
        const isCorrect = question.correctAnswer
          ? answer.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
          : true;
        setResults(prev => ({
          ...prev,
          [question.id]: {
            isCorrect,
            explanation: question.explanation,
            correctAnswer: question.correctAnswer,
          },
        }));
      }
    } else {
      try {
        const res = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, userAnswer: answer.answer }),
        });
        const data = await res.json();
        if (res.ok) {
          setResults(prev => ({ ...prev, [question.id]: data }));
        }
      } catch {
        setResults(prev => ({
          ...prev,
          [question.id]: {
            isCorrect: true,
            explanation: question.explanation,
          },
        }));
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Save session to localStorage
      const correctCount = Object.values(results).filter(r => r.isCorrect !== false).length;
      const session: QuizSession = {
        id: `session_${Date.now()}`,
        subject: questions[0]?.subject || '',
        topic: questions[0]?.topic || '',
        difficulty: questions[0]?.difficulty || 'medium',
        questions,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
          isCorrect: results[questionId]?.isCorrect,
        })),
        score: correctCount,
        totalQuestions: questions.length,
        createdAt: new Date().toISOString(),
      };
      saveSession(session);
      refreshHistory();
      setAppState('result');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setResults({});
    setAppState('quiz');
  };

  const handleNewQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setResults({});
    setAppState('setup');
  };

  const handleLoadHistory = (session: QuizSession) => {
    setQuestions(session.questions);
    setAnswers(Object.fromEntries(session.answers.map(a => [a.questionId, a.answer])));
    setResults(Object.fromEntries(
      session.answers
        .filter(a => a.isCorrect !== undefined)
        .map(a => [a.questionId, {
          isCorrect: a.isCorrect!,
          explanation: session.questions.find(q => q.id === a.questionId)?.explanation || '',
          correctAnswer: session.questions.find(q => q.id === a.questionId)?.correctAnswer,
        }])
    ));
    setCurrentIndex(0);
    setShowHistory(false);
    setAppState('result');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            📝 AI 智能出题助手
          </h1>
          <div className="flex items-center gap-2">
            {hasHistory && (
              <button
                onClick={() => setShowHistory(true)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-1"
              >
                📋 历史
              </button>
            )}
            {appState !== 'setup' && (
              <button
                onClick={handleNewQuiz}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                ← 返回首页
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline">关闭</button>
          </div>
        )}

        {appState === 'setup' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">开始你的练习之旅</h2>
              <p className="text-gray-500">输入课程和知识点，AI 为你智能出题</p>
            </div>
            <SetupForm onStart={handleStart} loading={loading} hasHistory={hasHistory} />
          </div>
        )}

        {appState === 'quiz' && questions.length > 0 && (
          <QuizCard
            key={questions[currentIndex].id}
            question={questions[currentIndex]}
            index={currentIndex}
            total={questions.length}
            onSubmit={handleSubmitAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            hasPrev={currentIndex > 0}
            showResult={!!results[questions[currentIndex].id]}
            result={results[questions[currentIndex].id]}
            savedAnswer={answers[questions[currentIndex].id]}
          />
        )}

        {appState === 'result' && (
          <ResultSummary
            questions={questions}
            answers={answers}
            results={results}
            onRetry={handleRetry}
            onNewQuiz={handleNewQuiz}
          />
        )}
      </main>

      {/* History Modal */}
      {showHistory && (
        <HistoryPanel
          onLoad={handleLoadHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        由 DeepSeek AI 驱动 · 题目仅供参考学习
      </footer>
    </div>
  );
}

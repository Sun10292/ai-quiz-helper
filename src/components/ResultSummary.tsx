'use client';

import { Question, ScoreResult } from '@/types';

interface ResultSummaryProps {
  questions: Question[];
  answers: Record<string, string>;
  results: Record<string, ScoreResult>;
  onRetry: () => void;
  onNewQuiz: () => void;
}

export default function ResultSummary({
  questions,
  answers,
  results,
  onRetry,
  onNewQuiz,
}: ResultSummaryProps) {
  const total = questions.length;
  const correct = Object.values(results).filter(r => r.isCorrect !== false).length;
  const percentage = Math.round((correct / total) * 100);
  const wrongQuestions = questions.filter(q => results[q.id]?.isCorrect === false);

  const getEmoji = (pct: number) => {
    if (pct >= 90) return '🏆';
    if (pct >= 70) return '👍';
    if (pct >= 50) return '📚';
    return '💪';
  };

  const getMessage = (pct: number) => {
    if (pct >= 90) return '太棒了！你对这个知识点掌握得很好！';
    if (pct >= 70) return '不错！继续保持，还有进步空间！';
    if (pct >= 50) return '还行，建议针对薄弱环节多加练习。';
    return '加油！多练练，一定会进步的！';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Score Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <span className="text-6xl">{getEmoji(percentage)}</span>
        <div className="mt-4 text-5xl font-bold text-indigo-600">
          {correct}/{total}
        </div>
        <p className="mt-2 text-xl text-gray-600">{getMessage(percentage)}</p>

        {/* Progress ring */}
        <div className="mt-6 relative w-32 h-32 mx-auto">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={percentage >= 70 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 339.3} 339.3`}
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-700">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Incorrect Questions Review */}
      {wrongQuestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-red-600 mb-4">
            ❌ 需要复习的题目（{wrongQuestions.length}道）
          </h3>
          <div className="space-y-4">
            {wrongQuestions.map((q, i) => (
              <div key={q.id} className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="font-medium text-gray-800 mb-2">
                  {i + 1}. {q.question}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  你的答案：<span className="text-red-600">{answers[q.id]}</span>
                </p>
                {results[q.id]?.correctAnswer && (
                  <p className="text-sm text-gray-500 mb-2">
                    正确答案：<span className="text-green-600 font-medium">{results[q.id].correctAnswer}</span>
                  </p>
                )}
                <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                  📖 {results[q.id]?.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correct Questions */}
      {correct > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-green-600 mb-4">
            ✅ 答对的题目（{correct}道）
          </h3>
          <div className="space-y-3">
            {questions
              .filter(q => results[q.id]?.isCorrect !== false)
              .map((q, i) => (
                <details key={q.id} className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <summary className="font-medium text-gray-800 cursor-pointer">
                    {i + 1}. {q.question.slice(0, 50)}...
                  </summary>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm text-green-700">你的答案：{answers[q.id]}</p>
                    <p className="text-sm text-gray-600 mt-2">📖 {results[q.id]?.explanation}</p>
                  </div>
                </details>
              ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
        >
          🔄 再来一遍
        </button>
        <button
          onClick={onNewQuiz}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
        >
          🆕 换一批题目
        </button>
      </div>
    </div>
  );
}

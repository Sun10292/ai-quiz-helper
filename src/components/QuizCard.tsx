'use client';

import { useState, useRef, useEffect } from 'react';
import { Question, UserAnswer } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuizCardProps {
  question: Question;
  index: number;
  total: number;
  onSubmit: (answer: UserAnswer) => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  showResult: boolean;
  result?: {
    isCorrect?: boolean;
    explanation: string;
    correctAnswer?: string;
  };
  savedAnswer?: string;
}

export default function QuizCard({
  question,
  index,
  total,
  onSubmit,
  onNext,
  onPrev,
  hasPrev,
  showResult,
  result,
  savedAnswer,
}: QuizCardProps) {
  const [answer, setAnswer] = useState(savedAnswer || '');
  const [selectedOption, setSelectedOption] = useState(savedAnswer || '');
  const [submitted, setSubmitted] = useState(!!savedAnswer);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync state when question changes (navigate prev/next)
  useEffect(() => {
    setAnswer(savedAnswer || '');
    setSelectedOption(savedAnswer || '');
    setSubmitted(!!savedAnswer);
    setChatMessages([]);
    setChatInput('');
  }, [question.id, savedAnswer]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = () => {
    const finalAnswer = question.type === 'choice' ? selectedOption : answer;
    if (!finalAnswer.trim()) return;
    setSubmitted(true);
    onSubmit({ questionId: question.id, answer: finalAnswer });
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrev = () => {
    onPrev();
  };

  const handleChatSend = async () => {
    const input = chatInput.trim();
    if (!input || chatLoading) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: input }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `你是一个耐心的学习辅导老师。学生正在做这道题目：

题目：${question.question}
${question.options ? `选项：${question.options.map(o => `${o.label}. ${o.text}`).join('；')}` : ''}
${question.correctAnswer ? `正确答案：${question.correctAnswer}` : ''}
解析：${result?.explanation || question.explanation}

学生的进一步追问。请针对这道题目进行解答，帮助学生理解。`,
            },
            ...newMessages,
          ],
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '抱歉，请求失败，请稍后重试。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const typeLabel = {
    choice: '选择题',
    fill: '填空题',
    essay: '大题',
  }[question.type];

  const typeColor = {
    choice: 'bg-blue-100 text-blue-700',
    fill: 'bg-amber-100 text-amber-700',
    essay: 'bg-purple-100 text-purple-700',
  }[question.type];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColor}`}>
          {typeLabel}
        </span>
        <span className="text-sm text-gray-500">
          第 {index + 1} / {total} 题
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
          {question.question}
        </h3>

        {/* Choice options */}
        {question.type === 'choice' && question.options && (
          <div className="space-y-3">
            {question.options.map(option => {
              let optionStyle = 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50';
              if (submitted && showResult) {
                if (option.label === question.correctAnswer) {
                  optionStyle = 'border-green-500 bg-green-50 ring-2 ring-green-500';
                } else if (option.label === selectedOption && option.label !== question.correctAnswer) {
                  optionStyle = 'border-red-500 bg-red-50 ring-2 ring-red-500';
                }
              } else if (selectedOption === option.label) {
                optionStyle = 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500';
              }

              return (
                <button
                  key={option.label}
                  onClick={() => !submitted && setSelectedOption(option.label)}
                  disabled={submitted}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionStyle}`}
                >
                  <span className="font-bold text-gray-500 mr-3">{option.label}.</span>
                  <span className="text-gray-700">{option.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Fill in blank */}
        {question.type === 'fill' && (
          <div>
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={submitted}
              placeholder="请输入你的答案..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg disabled:bg-gray-100"
            />
          </div>
        )}

        {/* Essay */}
        {question.type === 'essay' && (
          <div>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={submitted}
              rows={5}
              placeholder="请输入你的答案..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none disabled:bg-gray-100"
            />
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mb-6">
        {hasPrev && (
          <button
            onClick={handlePrev}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            👈 上一题
          </button>
        )}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={question.type === 'choice' ? !selectedOption : !answer.trim()}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            ✅ 提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            {index < total - 1 ? '👉 下一题' : '🏁 查看成绩'}
          </button>
        )}
      </div>

      {/* Result */}
      {submitted && showResult && result && (
        <div className={`mb-6 p-6 rounded-2xl border-2 ${
          result.isCorrect !== false ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">
              {result.isCorrect !== false ? '✅' : '❌'}
            </span>
            <span className={`font-bold text-lg ${
              result.isCorrect !== false ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.isCorrect !== false ? '回答正确！' : '回答错误'}
            </span>
          </div>

          {result.correctAnswer && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">正确答案：</span>
              <span className="font-bold text-green-700">{result.correctAnswer}</span>
            </p>
          )}

          <div className="mt-3 p-4 bg-white rounded-xl">
            <p className="text-sm font-medium text-gray-500 mb-1">📖 解析：</p>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
          </div>

          {question.type === 'essay' && question.reference && (
            <div className="mt-3 p-4 bg-white rounded-xl">
              <p className="text-sm font-medium text-gray-500 mb-1">📝 参考答案：</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{question.reference}</p>
            </div>
          )}

          {/* Chat / Follow-up */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-500 mb-3">💬 追问 AI 老师</p>

            {/* Chat messages */}
            {chatMessages.length > 0 && (
              <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-100 text-indigo-800 ml-8'
                        : 'bg-gray-100 text-gray-700 mr-8'
                    }`}
                  >
                    <p className="text-xs font-medium mb-1 opacity-60">
                      {msg.role === 'user' ? '你' : '🤖 AI 老师'}
                    </p>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Chat input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                placeholder="追问：为什么选这个？有没有更简单的解法？..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                disabled={chatLoading}
              />
              <button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || chatLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                {chatLoading ? '...' : '发送'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

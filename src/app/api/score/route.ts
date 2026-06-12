import { NextRequest, NextResponse } from 'next/server';
import getDeepseek from '@/lib/deepseek';
import { ScoreRequest, ScoreResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ScoreRequest = await request.json();
    const { question, userAnswer } = body;

    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: '请提供题目和用户答案' },
        { status: 400 }
      );
    }

    const prompt = `你是一个严格的阅卷老师。请批改以下题目并给出反馈。

题目类型：${question.type === 'choice' ? '选择题' : question.type === 'fill' ? '填空题' : '简答题'}
题目：${question.question}
${question.options ? `选项：${question.options.map(o => `${o.label}. ${o.text}`).join('\n')}` : ''}
${question.correctAnswer ? `标准答案：${question.correctAnswer}` : `参考答案：${question.reference || '无'}`}

学生答案：${userAnswer}

请判断对错并提供解析。返回严格JSON格式（不要markdown代码块）：
{
  "isCorrect": true或false,
  "correctAnswer": "如果是选择题/填空题，返回正确答案",
  "explanation": "详细的批改解析，说明对在哪里或错在哪里"
}`;

    const completion = await getDeepseek().chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let result: ScoreResult;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: '批改解析失败', raw: content },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Score error:', error);
    return NextResponse.json(
      { error: error.message || '批改失败' },
      { status: 500 }
    );
  }
}

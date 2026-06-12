import { NextRequest, NextResponse } from 'next/server';
import getDeepseek from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '请提供消息列表' },
        { status: 400 }
      );
    }

    const completion = await getDeepseek().chat.completions.create({
      model: 'deepseek-v4-flash',
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 2048,
    });

    const reply = completion.choices[0]?.message?.content || '抱歉，我没有理解你的问题。';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || '对话失败' },
      { status: 500 }
    );
  }
}

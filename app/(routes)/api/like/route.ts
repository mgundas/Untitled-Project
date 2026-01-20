// app/api/like/route.ts
import { getProducer } from '@/lib/kafka';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { postId, userId } = await req.json();
  
  const producer = await getProducer();
  
  await producer.send({
    topic: 'likes',
    messages: [
      { 
        key: postId, // Keeps events for the same post in the same partition
        value: JSON.stringify({ type: 'LIKE', postId, userId }) 
      },
    ],
  });

  return NextResponse.json({ success: true });
}
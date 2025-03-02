'use server';
import { db } from '@/app/db';
import { auth } from "@/auth";
import { eq, and, or, desc } from 'drizzle-orm'
import { chats, bots } from '@/app/db/schema';

export const addBotInServer = async (botInfo: {
  title: string;
  desc?: string;
  prompt: string;
  avatar: string;
  avatarType: 'emoji' | 'url';
}) => {
  const session = await auth();
  if (!session?.user.id) {
    return {
      status: 'fail',
      message: 'please login first.'
    }
  }

  const botResult = await db.insert(bots)
    .values({
      ...botInfo,
      creator: session.user.id
    })
    .returning();
  return {
    status: 'success',
    data: botResult[0]
  }
}

export const deleteBotInServer = async (botId: number) => {
  const session = await auth();
  if (!session?.user.id) {
    return {
      status: 'fail',
      message: 'please login first.'
    }
  }

  await db.delete(bots)
    .where(
      and(
        eq(bots.id, botId),
        eq(bots.creator, session.user.id)
      ));
  return {
    status: 'success'
  }
}

export const addBotToChatInServer = async (botId: number) => {
  const session = await auth();
  if (!session?.user.id) {
    return {
      status: 'fail',
      message: 'please login first.'
    }
  }

  const result = await db.select()
    .from(bots)
    .where(
      eq(bots.id, botId),
    );
  if (result.length > 0) {
    const botInfo = result[0];

    const chatResult = await db.insert(chats)
      .values({
        title: botInfo.title,
        botId: botInfo.id,
        avatar: botInfo.avatar,
        avatarType: botInfo.avatarType,
        isWithBot: true,
        prompt: botInfo.prompt,
        userId: session.user.id
      })
      .returning();
    return {
      status: 'success',
      data: chatResult[0]
    }
  } else {
    return {
      status: 'fail',
    }
  }
}

export async function getBotListInServer() {
  try {
    const botsData = await db.select().from(bots).orderBy(desc(bots.id));
    
    return { success: true, data: botsData };
  } catch (error) {
    console.error('Error fetching bots:', error);
    return { success: false, error: 'Failed to fetch bots' };
  }
}

export const getBotInfoInServer = async (botId: number) => {

  const result = await db.select()
    .from(bots)
    .where(
      eq(bots.id, botId),
    );
  if (result.length > 0) {
    return {
      status: 'success',
      data: result[0]
    }
  } else {
    return {
      status: 'fail',
    }
  }
}

export async function createBotInServer(botData: {
  title: string;
  desc?: string;
  avatar: string;
  avatarType: string;
  prompt: string;
  tag: string;
}) {
  try {
    const newBot = await db.insert(bots).values({
      ...botData,
      tag: botData.tag || '通用',
    }).returning();
    
    return { success: true, data: newBot[0] };
  } catch (error) {
    console.error('Error creating bot:', error);
    return { success: false, error: 'Failed to create bot' };
  }
}

export async function updateBotInServer(botId: number, botData: {
  tag?: string;
}) {
  // 更新逻辑...
}

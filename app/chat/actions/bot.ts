'use server';
import { db } from '@/app/db';
import { auth } from "@/auth";
import { eq, and, or, desc, sql, inArray } from 'drizzle-orm'
import { chats, bots } from '@/app/db/schema';
import { users } from '@/app/db/schema';

export const addBotInServer = async (botInfo: {
  title: string;
  desc?: string;
  prompt: string;
  avatar: string;
  avatarType: 'emoji' | 'url';
  tag?: string;
}) => {
  const session = await auth();
  if (!session?.user.id) {
    return {
      status: 'fail',
      message: 'please login first.'
    }
  }

  // 如果用户没有提供tag，普通用户默认为"个人"，管理员默认为"通用"
  const defaultTag = session.user.isAdmin ? '通用' : '个人';

  const botResult = await db.insert(bots)
    .values({
      ...botInfo,
      tag: botInfo.tag || defaultTag,
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
    const session = await auth();
    if (!session?.user.id) {
      return { success: false, message: "请先登录" };
    }

    let botsData;
    
    if (session.user.isAdmin) {
      // 管理员可以看到所有机器人
      botsData = await db.select().from(bots).orderBy(desc(bots.id));
    } else {
      // 获取所有管理员的ID
      const adminUsers = await db.select().from(users).where(eq(users.isAdmin, true));
      const adminIds = adminUsers.map(user => user.id);
      
      // 普通用户只能看到自己创建的、公共的和管理员创建的机器人
      botsData = await db.select().from(bots)
        .where(
          or(
            eq(bots.creator, session.user.id),  // 自己创建的
            eq(bots.creator, 'public'),         // 公共机器人
            inArray(bots.creator, adminIds)     // 管理员创建的
          )
        )
        .orderBy(desc(bots.id));
    }
    
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
    const session = await auth();
    if (!session?.user.id) {
      return { success: false, message: "请先登录" };
    }
    
    const newBot = await db.insert(bots).values({
      ...botData,
      tag: botData.tag || '通用',
      creator: session.user.id
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

async function isUserAdmin(userId: string) {
  const userRecord = await db.select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return userRecord.length > 0 && userRecord[0].isAdmin;
}

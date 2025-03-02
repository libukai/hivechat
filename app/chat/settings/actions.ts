'use server';
import { users } from '@/app/db/schema';
import { db } from '@/app/db';
import { eq } from 'drizzle-orm';
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { messages } from '@/app/db/schema';

export async function updatePassword(username: string, oldPassword: string, newPassword: string,) {
  const session = await auth();
  if (session?.user.username !== username) {
    throw new Error('not allowed');
  }
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!existingUser) {
      return {
        success: false,
        message: '该用户不存在',
      };
    }
    const isMatch = await bcrypt.compare(oldPassword, existingUser.password || '');
    if (!isMatch) {
      return {
        success: false,
        message: '旧密码错误',
      };
    }

    let updateResult = null;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    // 更新用户信息
    updateResult = await db.update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.username, username));
    return {
      success: true,
      message: '已更新',
    };

  } catch (error) {
    return {
      success: false,
      message: 'database delete error'
    }
  }
}

export async function deleteAllMessages() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: '未登录'
    };
  }
  
  try {
    // 只删除当前用户的消息
    const result = await db.delete(messages)
      .where(eq(messages.userId, session.user.id));
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting messages:', error);
    return {
      success: false,
      message: '删除失败'
    };
  }
}

import { sql } from 'drizzle-orm';
import { db } from '@/app/db';

export async function addTagToBotsTable() {
  // 添加 tag 列
  await db.execute(sql`
    ALTER TABLE bots 
    ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT '通用'
  `);
  
  // 为现有记录设置默认标签
  await db.execute(sql`
    UPDATE bots 
    SET tag = '通用' 
    WHERE tag IS NULL
  `);
}

// 执行迁移
addTagToBotsTable()
  .then(() => console.log('Migration completed: Added tag column to bots table'))
  .catch(console.error); 

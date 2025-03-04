'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { BotType } from '@/app/db/schema';
import { getBotListInServer } from '@/app/chat/actions/bot';
import { Button, Skeleton, Divider } from 'antd';
import { useTranslations } from 'next-intl';

const BotDiscover = () => {
  const t = useTranslations('Chat');
  const [botList, setBotList] = useState<BotType[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [tagGroups, setTagGroups] = useState<{[key: string]: BotType[]}>({});
  const [activeTag, setActiveTag] = useState<string>('');
  
  // 预定义标签顺序，可以根据需要调整
  const tagOrder = ["知音集团", "木兰花家政", "通用", "个人"];
  
  useEffect(() => {
    async function getBotsList() {
      const bots = await getBotListInServer();
      
      if (bots.success && bots.data) {
        setBotList(bots.data as BotType[]);
        
        // 按标签分组
        const groups: {[key: string]: BotType[]} = {};
        bots.data.forEach((bot: BotType) => {
          const tag = bot.tag || "通用";
          if (!groups[tag]) {
            groups[tag] = [];
          }
          groups[tag].push(bot);
        });
        
        setTagGroups(groups);
        // 设置第一个有机器人的标签为默认活跃标签
        const availableTags = Object.keys(groups);
        if (availableTags.length > 0) {
          // 尝试按预定义顺序找到第一个有效标签
          const firstOrderedTag = tagOrder.find(tag => availableTags.includes(tag));
          setActiveTag(firstOrderedTag || availableTags[0]);
        }
      }
      
      setIsPending(false);
    }
    getBotsList();
  }, []);

  // 获取排序后的标签列表
  const getSortedTags = () => {
    const availableTags = Object.keys(tagGroups);
    
    // 先按预定义顺序排序已知标签
    const orderedTags = tagOrder.filter(tag => availableTags.includes(tag));
    
    // 将未在预定义列表中的标签添加到末尾
    const remainingTags = availableTags.filter(tag => !tagOrder.includes(tag));
    
    return [...orderedTags, ...remainingTags];
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className='w-full flex flex-row justify-between items-center'>
        <h1 className='text-xl font-bold mb-4 mt-6'>{t('discoverBots')}</h1>
        <Link href='/chat/bot/create'>
          <Button type="primary" icon={<PlusOutlined />} shape='round'>
            <div className='flex flex-row'>
              {t('createBot')}
            </div>
          </Button>
        </Link>
      </div>

      {isPending ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-medium mb-3">加载中...</h2>
            <div className="grid grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tag Navigation Bar */}
          <div className="flex overflow-x-auto pb-2 mb-4 border-b">
            {getSortedTags().map((tag) => (
              <button
                key={tag}
                className={`px-4 py-2 mr-2 whitespace-nowrap rounded-md transition-colors ${
                  activeTag === tag 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTag(tag)}
              >
                {tag} <span className="text-xs ml-1">({tagGroups[tag].length})</span>
              </button>
            ))}
          </div>
          
          {/* Display bots for active tag */}
          {activeTag && tagGroups[activeTag] && (
            <div>
              <div className="grid grid-cols-2 gap-4">
                {tagGroups[activeTag].map((bot, index) => (
                  <ServiceCard key={index} bot={bot} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl border-gray-200 border p-4 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
      <div className="flex items-start gap-4">
        <Skeleton.Avatar active size={48} style={{ borderRadius: 8 }} shape='square' />
        <div className="flex flex-col w-full">
          <Skeleton.Node active style={{ width: 160, height: 22 }} />
          <Skeleton.Node active style={{ width: '90%', height: 16, marginTop: 8 }} />
        </div>
      </div>
    </div>
  );
};

const ServiceCard = (props: { bot: BotType }) => {
  return (
    <div className="bg-white rounded-xl border-gray-200 border p-4 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
      <Link href={`/chat/bot/${props.bot.id}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg flex bg-slate-200 items-center justify-center overflow-hidden flex-shrink-0">
            {props.bot.avatarType === 'emoji' && <span className="text-4xl">{props.bot.avatar}</span>}
            {props.bot.avatarType === 'url' &&
              <Image
                src={props.bot.avatar}
                alt={props.bot.title}
                width={52}
                height={52}
                className="w-full h-full object-cover"
                unoptimized
              />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900 font-medium text-lg mb-1 truncate">
              {props.bot.title}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-2">
              {props.bot.desc}
            </p>
            {props.bot.tag && (
              <div className="mt-2">
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {props.bot.tag}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BotDiscover;

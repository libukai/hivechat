'use client';
import React, { useState, useEffect } from 'react'
import { EmojiPicker } from '@/app/components/EmojiPicker';
import { Input, Form, message, Select } from "antd";
import Link from 'next/link';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';
import { addBotInServer } from '@/app/chat/actions/bot';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';

const { Option } = Select;

const CreateBot = () => {
  const t = useTranslations('Chat');
  const [selectedEmoji, setSelectedEmoji] = useState('🤖');
  const [isPending, setIsPending] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const [tag, setTag] = useState('通用');
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  
  const tagOptions = ['个人', '通用', '学习', '工作', '娱乐', '生活', '其他'];
  
  type FormValues = {
    avatar: string;
    name: string;
    desc: string;
    prompt: string;
  }
  
  const onFinish = async (values: FormValues) => {
    setIsPending(true);
    const result = await addBotInServer({
      title: values.name,
      avatar: selectedEmoji,
      desc: values.desc,
      prompt: values.prompt,
      avatarType: 'emoji',
      tag: isAdmin ? tag : '个人', // 管理员使用选择的tag，普通用户固定为"个人"
    });
    if (result.status === 'success') {
      router.push(`/chat/bot/${result.data?.id}`)
    } else {
      message.error('创建失败，请稍后重试');
    }
    setIsPending(false);
  };
  
  return (
    <div className="container max-w-3xl mx-auto flex flex-col items-center px-16">
      <div className='w-full'>
        <Link href='/chat/bot/discover'>
          <Button type='link' size='small' icon={<LeftOutlined />}>{t('back')}</Button>
        </Link>
      </div>

      <h1 className='text-xl mb-8 mt-4'>{t('createBot')}</h1>
      <EmojiPicker
        currentEmoji={selectedEmoji}
        onEmojiSelect={(emoji) => setSelectedEmoji(emoji)}
      />
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        className='w-full'
      >
        <Form.Item label={<span className='font-medium'>{t('botName')}</span>} name='name'>
          <Input size="large" placeholder={t('botNameNotice')} />
        </Form.Item>

        <Form.Item label={<span className='font-medium'>{t('botDesc')}</span>} name='desc'>
          <Input.TextArea size="large" placeholder={t('botDescNotice')} />
        </Form.Item>

        {isAdmin && (
          <Form.Item label={<span className='font-medium'>{t('botTag')}</span>}>
            <Select
              value={tag}
              onChange={setTag}
              placeholder={t('botTagPlaceholder')}
            >
              {tagOptions.map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item label={<span className='font-medium'>{t('prompt')}</span>} name='prompt'>
          <Input.TextArea
            size="large"
            autoSize={{ minRows: 5, maxRows: 12 }}
            placeholder={t('promptNotice')} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            size='large'
            shape='round'
            className='w-full'
            htmlType="submit"
            loading={isPending}
          >
            {t('createBot')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CreateBot;

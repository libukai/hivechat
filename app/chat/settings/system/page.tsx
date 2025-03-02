'use client'
import React, { useState } from 'react'
import { Button, message, Modal } from "antd";
import useChatListStore from '@/app/store/chatList';
import { deleteAllMessages } from '@/app/chat/settings/actions';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Alert } from 'antd';

const SystemSettingsPage = () => {
  const t = useTranslations('Settings');
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleDeleteAllMessages = async () => {
    if (confirm(t('deleteAllMessagesConfirm'))) {
      setLoading(true);
      const result = await deleteAllMessages();
      if (result.success) {
        message.success(t('deleteSuccess'));
      } else {
        message.error(result.message || t('deleteFailed'));
      }
      setLoading(false);
    }
  };

  return (
    <div className='mt-6'>
      <div className='flex flex-col gap-4'>
        <div className='p-4 bg-white rounded-lg shadow-sm'>
          <h2 className='text-lg font-medium mb-2'>{t('deleteAllMessagesTitle')}</h2>
          <p className='text-gray-500 mb-4'>{t('deleteAllMessagesDesc')}</p>
          <Button 
            type='primary' 
            danger 
            onClick={handleDeleteAllMessages}
            loading={loading}
          >
            {t('deleteAction')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;

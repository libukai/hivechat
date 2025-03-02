import React from 'react';
import type { Metadata } from "next";
import type { Viewport } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Analytics } from "@vercel/analytics/react"
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';
import AppPrepare from "@/app/components/AppPrepare";
import "./globals.css";


export const metadata: Metadata = {
  title: "木兰花·深度求索",
  description: "木兰花家政深度求索平台",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <AntdRegistry>
            <AppPrepare />
              {children}
            </AntdRegistry>
            <Analytics />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

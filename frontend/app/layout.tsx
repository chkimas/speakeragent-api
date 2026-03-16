import React from 'react';

export const metadata = {
  title: 'SpeakerAgent.ai',
  description: 'AI-Powered Podcast Matching',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
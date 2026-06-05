'use client';

import { EmojiProvider as AppleEmojiProvider } from 'react-apple-emojis';
import emojiData from 'react-apple-emojis/src/data.json';

export function EmojiProvider({ children }: { children: React.ReactNode }) {
  return <AppleEmojiProvider data={emojiData}>{children}</AppleEmojiProvider>;
}

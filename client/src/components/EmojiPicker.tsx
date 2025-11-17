import { useState } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

const emojiCategories = {
  表情: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔'],
  手势: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  物品: ['💻', '📱', '⌚', '📷', '📹', '🎥', '📺', '📻', '🎙', '🎚', '🎛', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷'],
  符号: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'],
  常用: ['👍', '👎', '❤️', '🔥', '💯', '🎉', '😊', '😂', '😍', '🤔', '😮', '😢', '🙏', '👏', '💪', '🎯', '✨', '⭐', '🌟', '💫', '🌈', '☀️', '🌙', '⭐', '💥', '💢', '💤', '💨', '👀', '👂'],
};

export default function EmojiPicker({ onSelect, textareaRef }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof emojiCategories>('常用');
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    if (textareaRef?.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      textarea.value = newText;
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
      // 触发input事件，让React状态更新
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    } else {
      onSelect(emoji);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-xl"
        aria-label="选择表情"
      >
        😊
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-purple-500/30 p-4 z-50 w-80 max-h-96 overflow-hidden flex flex-col animate-scale-in dark:shadow-purple-500/20">
            <div className="flex gap-1 mb-3 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
              {Object.keys(emojiCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category as keyof typeof emojiCategories)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md dark:shadow-purple-500/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-8 gap-2">
                {emojiCategories[activeCategory].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleEmojiClick(emoji);
                      setIsOpen(false);
                    }}
                    className="text-2xl p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


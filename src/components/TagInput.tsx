'use client';

import { useState, KeyboardEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

export default function TagInput({ value, onChange, placeholder, label }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(value ? value.split(',').map(t => t.trim()) : []);
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      onChange(newTags.join(','));
    }
    setInput('');
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    onChange(newTags.join(','));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="p-2 border rounded-lg dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 inline-flex items-center p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => input && addTag(input)}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
            placeholder={placeholder}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Pressione Enter ou vírgula para adicionar
      </p>
    </div>
  );
}

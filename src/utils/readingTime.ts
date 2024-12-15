import readingDuration from 'reading-duration';

export function calculateReadingTime(content: string) {
  const time = readingDuration(content, {
    emoji: false,
    wordsPerMinute: 200, // Average reading speed
  });
  
  // Replace "min read" with "min para ler"
  return time.replace('min read', 'min para ler');
}

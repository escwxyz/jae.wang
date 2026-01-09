const WORDS_PER_MINUTE = 200;
const WORD_REGEX =
  /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF]|[A-Za-z0-9\u00C0-\u024F\u0400-\u052F\u2DE0-\u2DFF\uA640-\uA69F\u0980-\u09FF\uAC00-\uD7AF\u0590-\u05FF\u0600-\u06FF]+(?:[\u0300-\u036F\u0610-\u061A\u064B-\u065F]+)*(?:['’‑-][A-Za-z0-9\u00C0-\u024F\u0400-\u052F\u2DE0-\u2DFF\uA640-\uA69F\u0980-\u09FF\uAC00-\uD7AF\u0590-\u05FF\u0600-\u06FF]+)*|[0-9]+(?:[.,][0-9]+)*/g;

const normalizeText = (text: string) =>
  text
    .normalize("NFC")
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/gu, " ")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060]/gu, "")
    .replace(/[\u3001\u3002\uFF0C\uFF0E]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const stripHtml = (text: string) => text.replace(/<[^>]+>/g, " ");

export const estimateReadingTime = (text: string) => {
  const normalized = normalizeText(stripHtml(text));
  const words = normalized.match(WORD_REGEX)?.length ?? 0;

  if (words === 0) {
    return { minutes: 0, words };
  }

  return {
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    words,
  };
};

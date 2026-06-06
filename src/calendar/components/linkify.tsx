import { Fragment } from "react";

// Auto-link URLs, emails and phone numbers in plain text. No dependency — a single
// capturing split so matches land on odd indices.
const PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d[\d\s().-]{6,}\d)/g;

function hrefFor(token: string): string {
  if (/^https?:\/\//i.test(token)) return token;
  if (/^www\./i.test(token)) return `https://${token}`;
  if (token.includes("@")) return `mailto:${token}`;
  return `tel:${token.replace(/[^\d+]/g, "")}`;
}

interface IProps {
  children: string;
  className?: string;
}

export function Linkify({ children, className }: IProps) {
  const text = children ?? "";
  const parts = text.split(PATTERN);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        // Odd indices are the captured matches.
        if (i % 2 === 1) {
          return (
            <a
              key={i}
              href={hrefFor(part)}
              target="_blank"
              rel="noopener noreferrer"
              className={className ?? "underline underline-offset-2 hover:opacity-80"}
              onClick={e => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

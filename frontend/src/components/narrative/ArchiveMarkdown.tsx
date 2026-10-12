import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArchiveMarkdown({ answer }: { answer: string }) {
  return <div className="agent-prose" dir="rtl">
    <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
      h1: ({ children }) => <h3>{children}</h3>,
      h2: ({ children }) => <h3>{children}</h3>,
      a: ({ href, children }) => href
        ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
        : <span>{children}</span>,
      // Answers can reference an image without silently loading third-party media.
      img: ({ alt }) => <span>{alt}</span>,
      pre: ({ children }) => <pre dir="ltr">{children}</pre>,
      code: ({ children, className }) => <code dir="ltr" className={className}>{children}</code>,
      table: ({ children }) => <div className="agent-table-scroll" tabIndex={0} role="region" aria-label="جدول الإجابة"><table>{children}</table></div>,
    }}>{answer}</Markdown>
  </div>;
}

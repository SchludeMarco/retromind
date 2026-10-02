import React from 'react';

// Just enough Markdown for AI guides: ## headings, - / * bullets, **bold**,
// paragraphs. Rendered as React nodes, so no HTML from the model is injected.

function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

export const MiniMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={blocks.length}>
          {list.map((li, i) => (
            <li key={i}>{inline(li)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const heading = /^#{1,4}\s+(.*)$/.exec(line);
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push(
        <h2 key={blocks.length} className="glow">
          {heading[1].replace(/\*\*/g, '')}
        </h2>
      );
    } else if (bullet) {
      list.push(bullet[1]);
    } else {
      flush();
      blocks.push(<p key={blocks.length}>{inline(line)}</p>);
    }
  }
  flush();
  return <div className="md">{blocks}</div>;
};

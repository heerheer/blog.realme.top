import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
interface MarkdownRendererProps {
  content: string;
  onInternalLinkClick?: (href: string) => void;
}

const getTextContent = (node: React.ReactNode): string => {
  if (node === null || node === undefined) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (React.isValidElement(node)) return getTextContent((node.props as any).children);
  return "";
};

const buildHeadingId = (children: React.ReactNode): string | undefined => {
  const text = getTextContent(children).trim();
  if (!text) return undefined;
  return encodeURIComponent(text);
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onInternalLinkClick,
}) => {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ children }) => (
            <h1
              id={buildHeadingId(children)}
              className="text-3xl font-bold mt-10 mb-6 text-slate-900 tracking-tight"
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={buildHeadingId(children)}
              className="text-2xl font-bold mt-8 mb-4 text-slate-800 tracking-tight"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={buildHeadingId(children)}
              className="text-xl font-bold mt-6 mb-3 text-slate-800"
            >
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-outside my-6 ml-6 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside my-6 ml-6 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-slate-700 leading-relaxed pl-2">{children}</li>,
          // 关键：pre 仅作为结构容器，并通过 Context 标记“处于代码块”
          code(props) {
            const { children, className, node, ...rest } = props
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                children={String(children).replace(/\n$/, '')}
                language={match[1]}
                style={oneDark}
              />
            ) : (
              <code {...rest} className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-sm font-medium">
                {children}
              </code>
            )
          },

          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 pl-6 my-8 italic text-slate-600">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            if (!href) {
              return (
                <span className="text-indigo-600 underline underline-offset-4">
                  {children}
                </span>
              );
            }

            const isHashOnly = href.startsWith("#");
            const isInternalPath = href.startsWith("/");
            const isSameOrigin = (() => {
              if (typeof window === "undefined") return false;
              try {
                const url = new URL(href, window.location.origin);
                return url.origin === window.location.origin;
              } catch {
                return false;
              }
            })();

            const isInternal = isHashOnly || isInternalPath || isSameOrigin;

            if (isInternal) {
              const to = (() => {
                if (isHashOnly) return href;
                if (isInternalPath) return href;
                if (typeof window === "undefined") return href;
                const url = new URL(href, window.location.origin);
                return `${url.pathname}${url.search}${url.hash}`;
              })();

              if (onInternalLinkClick) {
                return (
                  <a
                    href={to}
                    onClick={(event) => {
                      event.preventDefault();
                      onInternalLinkClick(to);
                    }}
                    className="text-indigo-600 underline underline-offset-4 hover:text-indigo-800 transition-colors"
                  >
                    {children}
                  </a>
                );
              }

              return (
                <Link
                  to={to}
                  className="text-indigo-600 underline underline-offset-4 hover:text-indigo-800 transition-colors"
                >
                  {children}
                </Link>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline underline-offset-4 hover:text-indigo-800 transition-colors"
              >
                {children}
              </a>
            );
          },
          hr: () => <hr className="my-12 border-slate-100" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

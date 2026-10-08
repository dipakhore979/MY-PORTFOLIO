import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  a: ({ href = '', children, ...props }) => {
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ alt = '', ...props }) => <img alt={alt} loading="lazy" {...props} />,
};

/** Renders markdown safely (raw HTML is not rendered). */
export default function Markdown({ children }) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-img:rounded-xl prose-pre:bg-slate-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

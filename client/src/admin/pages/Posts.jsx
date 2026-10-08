import { formatLongDate } from '../../utils/format';
import ResourceManager from '../components/ResourceManager';

const fields = [
  { name: 'title', label: 'Title', type: 'text', required: true, min: 2, max: 150, wide: true },
  {
    name: 'slug',
    label: 'URL slug',
    type: 'slug',
    max: 100,
    omitIfEmpty: true,
    help: 'Leave empty to generate it from the title.',
  },
  { name: 'tags', label: 'Tags', type: 'tags', help: 'Comma-separated, e.g. react, tutorial' },
  { name: 'excerpt', label: 'Excerpt', type: 'textarea', max: 300, rows: 2 },
  { name: 'coverImage', label: 'Cover image', type: 'image' },
  { name: 'content', label: 'Content (Markdown)', type: 'markdown', required: true, max: 50000, rows: 16 },
  { name: 'published', label: 'Published (visible on the site)', type: 'checkbox', default: false },
];

const columns = [
  {
    label: 'Post',
    render: (p) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{p.title}</p>
        <p className="text-xs text-slate-500">/{p.slug}</p>
      </div>
    ),
  },
  {
    label: 'Status',
    render: (p) => (
      <span className={`tag ${p.published ? '' : '!bg-amber-100 !text-amber-800'}`}>
        {p.published ? 'Published' : 'Draft'}
      </span>
    ),
  },
  {
    label: 'Date',
    className: 'hidden sm:table-cell',
    render: (p) => formatLongDate(p.publishedAt || p.createdAt),
  },
];

export default function Posts() {
  return (
    <ResourceManager
      title="Blog posts"
      singular="Post"
      description="Write in Markdown. Drafts are only visible to you."
      resource="posts"
      columns={columns}
      fields={fields}
      itemLabel={(p) => p.title}
    />
  );
}

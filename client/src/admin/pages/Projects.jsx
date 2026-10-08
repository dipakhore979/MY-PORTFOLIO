import ResourceManager from '../components/ResourceManager';

const fields = [
  { name: 'title', label: 'Title', type: 'text', required: true, min: 2, max: 120, wide: true },
  {
    name: 'slug',
    label: 'URL slug',
    type: 'slug',
    max: 100,
    omitIfEmpty: true,
    help: 'Leave empty to generate it from the title.',
  },
  { name: 'order', label: 'Display order', type: 'number', default: 0, help: 'Lower numbers appear first.' },
  { name: 'description', label: 'Short description', type: 'textarea', required: true, min: 10, max: 500, rows: 3 },
  { name: 'image', label: 'Cover image', type: 'image' },
  { name: 'tech', label: 'Technologies', type: 'tags', help: 'Comma-separated, e.g. React, Node.js, MongoDB' },
  { name: 'liveUrl', label: 'Live URL', type: 'url', max: 500 },
  { name: 'githubUrl', label: 'GitHub URL', type: 'url', max: 500 },
  { name: 'content', label: 'Details (Markdown)', type: 'markdown', max: 20000, rows: 10 },
  { name: 'featured', label: 'Featured', type: 'checkbox', default: false },
  { name: 'published', label: 'Published (visible on the site)', type: 'checkbox', default: true },
];

const columns = [
  {
    label: 'Project',
    render: (p) => (
      <div className="flex items-center gap-3">
        {p.image?.url ? (
          <img src={p.image.url} alt="" className="h-10 w-16 rounded object-cover" />
        ) : (
          <div className="h-10 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        )}
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{p.title}</p>
          <p className="text-xs text-slate-500">/{p.slug}</p>
        </div>
      </div>
    ),
  },
  {
    label: 'Tech',
    className: 'hidden md:table-cell',
    render: (p) => <span className="text-slate-600 dark:text-slate-400">{(p.tech || []).join(', ') || '—'}</span>,
  },
  {
    label: 'Status',
    render: (p) => (
      <span className="space-x-1">
        <span className={`tag ${p.published ? '' : '!bg-amber-100 !text-amber-800'}`}>
          {p.published ? 'Published' : 'Draft'}
        </span>
        {p.featured && <span className="tag">Featured</span>}
      </span>
    ),
  },
  { label: 'Order', className: 'hidden sm:table-cell', render: (p) => p.order },
];

export default function Projects() {
  return (
    <ResourceManager
      title="Projects"
      singular="Project"
      description="Showcase your work. Drafts are only visible to you."
      resource="projects"
      columns={columns}
      fields={fields}
      itemLabel={(p) => p.title}
    />
  );
}

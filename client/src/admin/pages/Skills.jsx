import ResourceManager from '../components/ResourceManager';

const categories = ['Frontend', 'Backend', 'Database', 'Languages', 'Tools', 'Other'];

const fields = [
  { name: 'name', label: 'Name', type: 'text', required: true, max: 50 },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: categories.map((c) => ({ value: c, label: c })),
  },
  { name: 'order', label: 'Display order', type: 'number', default: 0, help: 'Lower numbers appear first within a category.' },
];

const columns = [
  { label: 'Skill', render: (s) => <span className="font-medium text-slate-900 dark:text-white">{s.name}</span> },
  { label: 'Category', render: (s) => <span className="tag">{s.category}</span> },
  { label: 'Order', className: 'hidden sm:table-cell', render: (s) => s.order },
];

export default function Skills() {
  return (
    <ResourceManager
      title="Skills"
      singular="Skill"
      description="Grouped by category in the About section."
      resource="skills"
      columns={columns}
      fields={fields}
      itemLabel={(s) => s.name}
    />
  );
}

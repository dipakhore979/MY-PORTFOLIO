const monthYear = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
const longDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });

export const formatMonthYear = (value) => (value ? monthYear.format(new Date(value)) : '');
export const formatLongDate = (value) => (value ? longDate.format(new Date(value)) : '');

export const formatRange = (start, end, current) =>
  `${formatMonthYear(start)} – ${current || !end ? 'Present' : formatMonthYear(end)}`;

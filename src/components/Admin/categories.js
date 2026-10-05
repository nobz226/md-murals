export const CATEGORIES = [
  { value: 'interior', label: 'Interior Murals' },
  { value: 'exterior', label: 'Exterior Murals' },
  { value: 'canvas', label: 'Canvas' }
];

export const categoryLabel = (value) => CATEGORIES.find((c) => c.value === value)?.label || value;

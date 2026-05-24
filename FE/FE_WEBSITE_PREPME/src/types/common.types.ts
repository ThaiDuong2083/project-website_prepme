export type Theme = 'light' | 'dark';

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type Variant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'ghost'
  | 'outline';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
  roles?: string[];
}

export type SortDirection = 'asc' | 'desc';

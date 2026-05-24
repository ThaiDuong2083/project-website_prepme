import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const generateId = (): string => Math.random().toString(36).slice(2, 11);

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isValidPhoneNumber = (phone: string): boolean =>
  /^(\+84|84|0)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])\d{7}$/.test(phone);

export const maskPhoneNumber = (phone: string): string =>
  phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');

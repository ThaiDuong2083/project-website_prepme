import { z } from 'zod';

export const loginWithPhoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^(\+84|84|0)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])\d{7}$/,
      'Invalid Vietnamese phone number',
    ),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
});

export type LoginWithPhoneFormData = z.infer<typeof loginWithPhoneSchema>;

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

import { z } from 'zod';

export const crmLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(1, 'Mobile number is required'),
  company: z.string().optional(),
  status: z.enum(['Open', 'Contacted', 'Disqualified']).default('Open'),
});

export const crmContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(1, 'Mobile number is required'),
  ownerId: z.string().optional(),
});

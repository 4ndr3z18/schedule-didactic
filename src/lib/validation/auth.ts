import { z } from 'zod';

/** Esquemas de autenticación. Se usan en el formulario y en la Server Action. */

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa tu correo.')
  .max(254, 'El correo es demasiado largo.')
  .email('Ingresa un correo válido.')
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72, 'La contraseña no puede superar los 72 caracteres.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Ingresa tu nombre completo.')
    .max(80, 'El nombre no puede superar los 80 caracteres.'),
  email: emailSchema,
  password: passwordSchema,
  career: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? undefined : value,
    z
      .string()
      .trim()
      .min(2, 'La carrera debe tener al menos 2 caracteres.')
      .max(120, 'La carrera no puede superar los 120 caracteres.')
      .optional(),
  ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

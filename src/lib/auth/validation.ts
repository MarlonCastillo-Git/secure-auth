import { z } from 'zod';
const email = z.email('Escribe un correo válido.').max(254).transform(value => value.toLowerCase());
const password = z.string().min(12,'Usa al menos 12 caracteres.').max(128,'Usa como máximo 128 caracteres.');
export const loginSchema = z.object({email, password:z.string().min(1,'Escribe tu contraseña.').max(128)});
export const signupSchema = z.object({email,password,name:z.string().trim().min(2,'Escribe tu nombre.').max(80)});
export const emailSchema = z.object({email});
export const passwordSchema = z.object({password,confirm:z.string()}).refine(data => data.password === data.confirm,{message:'Las contraseñas no coinciden.',path:['confirm']});
export type ActionState = {error?: string; success?: string};

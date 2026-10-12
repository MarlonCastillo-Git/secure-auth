'use client';
import { useActionState, useState } from 'react';
import { login, signup, recover, updatePassword } from '@/app/actions';
import { loginSchema, signupSchema, emailSchema, passwordSchema, type ActionState } from '@/lib/auth/validation';
type Mode = 'login' | 'register' | 'recover' | 'password';
const actions = {login,register:signup,recover,password:updatePassword};
const schemas = {login:loginSchema,register:signupSchema,recover:emailSchema,password:passwordSchema};
const labels = {login:'Iniciar sesión',register:'Crear cuenta',recover:'Enviar instrucciones',password:'Guardar contraseña'};
export default function AuthForm({mode,disabled=false}: {mode:Mode;disabled?:boolean}) {
  const [state,action,pending] = useActionState<ActionState,FormData>(actions[mode],{});
  const [validation,setValidation] = useState('');
  const isNew = mode === 'register' || mode === 'password';
  return <form action={action} onSubmit={event => {
    const result=schemas[mode].safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {event.preventDefault();setValidation(result.error.issues[0].message);} else setValidation('');
  }}>
    <fieldset disabled={pending || disabled}>
      {mode === 'register' && <label>Nombre<input name="name" autoComplete="name" minLength={2} maxLength={80} required/></label>}
      {mode !== 'password' && <label>Correo electrónico<input name="email" type="email" autoComplete="email" maxLength={254} required/></label>}
      {mode !== 'recover' && <label>{isNew ? 'Nueva contraseña' : 'Contraseña'}<input name="password" type="password" autoComplete={isNew ? 'new-password':'current-password'} minLength={isNew ? 12:1} maxLength={128} required/>{isNew && <small>Entre 12 y 128 caracteres. Usa una frase larga y única.</small>}</label>}
      {mode === 'password' && <label>Confirmar contraseña<input name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label>}
      {(validation || state.error) && <p className="error" role="alert">{validation || state.error}</p>}
      {state.success && <p className="success" role="status">{state.success}</p>}
      <button type="submit">{pending ? 'Procesando…' : labels[mode]}</button>
    </fieldset>
  </form>;
}

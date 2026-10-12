'use client';
import { useFormStatus } from 'react-dom';
import { logout } from '@/app/actions';
function Submit() { const {pending} = useFormStatus(); return <button className="secondary" disabled={pending}>{pending ? 'Cerrando…':'Cerrar sesión'}</button>; }
export default function SignOut() { return <form action={logout}><Submit/></form>; }

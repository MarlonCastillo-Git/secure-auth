'use client';
export default function ErrorPage({retry}: {error:Error & {digest?:string};retry:()=>void}) {return <section className="auth-card" role="alert"><h1>No pudimos completar la solicitud</h1><p>Inténtalo de nuevo en unos momentos.</p><button onClick={retry}>Reintentar</button></section>;}

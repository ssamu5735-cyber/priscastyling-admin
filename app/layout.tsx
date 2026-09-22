import type { Metadata } from 'next'; import './globals.css';
export const metadata:Metadata={title:'Priscastyling Admin | Atelier dashboard',description:'Private admin dashboard for Priscastyling, Festac, Lagos.',metadataBase:new URL('https://priscastyling-admin.netlify.app'),icons:{icon:'/icon.png',apple:'/icon.png'},robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

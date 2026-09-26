import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Christmas Corner · 3D Miniature', description: 'An interactive Christmas shop miniature. Rotate, zoom, and explore.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }

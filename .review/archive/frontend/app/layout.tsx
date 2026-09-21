import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
})

const siteTitle = 'Biblioteca - Gestión de Libros'
const siteDescription = 'CRUD de libros con vista tarjeta y tabla'
const siteUrl = 'https://biblioteca.tudominio.com'
const siteName = 'Biblioteca'
const logoImage = `${siteUrl}/og-image.png`
const author = {
  name: 'Tu Nombre',
  contact: '+580000000000',
}

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: ['biblioteca', 'libros', 'gestión', 'CRUD'],
  authors: [{ name: `${author.name}, contacto: ${author.contact}` }],
  creator: author.name,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
    url: siteUrl,
    siteName,
    images: [
      {
        url: logoImage,
        width: 1200,
        height: 630,
        alt: 'Biblioteca - Sistema de Gestión de Libros',
      },
    ],
    locale: 'es_VE',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [logoImage],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon-light-32x32.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${nunito.className} antialiased`}>
        {children}
        <Toaster
          position="bottom-center"
          richColors
          theme="light"
          expand={false}
          visibleToasts={4}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

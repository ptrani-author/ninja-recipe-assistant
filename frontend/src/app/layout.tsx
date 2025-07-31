import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dein persönlicher Ninja-Rezept-Assistent',
  description: 'Gib ein, was du im Kühlschrank hast – wir zaubern ein neues, alltagstaugliches Ninja-Rezept nur für dich.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-dark-bg text-gray-100">
        {children}
      </body>
    </html>
  )
} 
// ...existing imports...
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // ...existing layout code...
    <>
      {children}
      <Toaster />
    </>
    // ...existing layout code...
  )
}

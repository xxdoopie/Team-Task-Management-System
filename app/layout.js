
import "./globals.css";

export const metadata = {
  title: 'Your App Title',
  description: 'Your app description',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // This prevents user zooming
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={``}>
        
        {children}
      </body>
    </html>
  );
}

import './globals.css'

export const metadata = {
  title: 'StockLab - AI-Powered Stock Analysis',
  description: 'High school research lab for predicting stock movements around earnings week',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="stylesheet" href="/styles/global.css" />
        <link rel="stylesheet" href="/styles/theme.css" />
        <link rel="stylesheet" href="/styles/print.css" media="print" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
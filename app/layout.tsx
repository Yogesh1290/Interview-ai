import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InterviewPro - AI-Powered Interview Practice",
  description: "Practice interviews with AI and get professional feedback",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="error-suppression" strategy="beforeInteractive">
          {`
    // Override window.onerror to suppress specific Daily.co errors
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (message && (
        message.toString().includes("Meeting has ended") || 
        message.toString().includes("Exiting meeting because room was deleted") ||
        message.toString().includes("Duplicate DailyIframe instances") ||
        message.toString().includes("daily-js") ||
        message.toString().includes("daily-iframe") ||
        message.toString().includes("Failed to load") ||
        (source && (source.includes("daily-js") || source.includes("vapi-ai")))
      )) {
        console.log("Suppressed error:", message);
        return true; // Prevents the error from being shown in console
      }
      
      // Call the original handler for other errors
      if (originalOnError) {
        return originalOnError.apply(this, arguments);
      }
      return false;
    };

    // Add a MutationObserver to detect and clean up orphaned iframes
    try {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            // Check if we have multiple daily-iframe elements
            const dailyIframes = document.querySelectorAll('iframe[title="daily-iframe"]');
            if (dailyIframes.length > 1) {
              console.log("Detected multiple Daily iframes, cleaning up...");
              // Keep only the most recently added iframe
              for (let i = 0; i < dailyIframes.length - 1; i++) {
                dailyIframes[i].remove();
              }
            }
          }
        }
      });
      
      // Start observing the document body for added/removed nodes
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Also set up a periodic cleanup check
      setInterval(() => {
        try {
          // Check for any orphaned Daily iframes that might be causing issues
          const dailyIframes = document.querySelectorAll('iframe[title="daily-iframe"]');
          const activeCalls = window.__VAPI_ACTIVE_CALLS || [];
          
          if (dailyIframes.length > 0 && activeCalls.length === 0) {
            console.log("Found orphaned Daily iframes with no active calls, cleaning up...");
            dailyIframes.forEach(iframe => iframe.remove());
          }
        } catch (e) {
          // Silently ignore any errors in the cleanup
        }
      }, 10000); // Check every 10 seconds
    } catch (e) {
      console.log("Error setting up MutationObserver:", e);
    }
    
    // Create a global variable to track Vapi calls
    window.__VAPI_ACTIVE_CALLS = window.__VAPI_ACTIVE_CALLS || [];
  `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

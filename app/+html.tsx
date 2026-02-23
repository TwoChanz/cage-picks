/**
 * Custom HTML Document Shell — PWA Configuration
 *
 * Expo Router's +html.tsx replaces the default HTML wrapper for web exports.
 * Adds PWA manifest, Apple meta tags, theme color, and service worker registration.
 *
 * See: https://docs.expo.dev/router/reference/static-rendering/#root-html
 */
import { ScrollViewStyleReset } from "expo-router/html"
import type { PropsWithChildren } from "react"

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* ── PWA Manifest ── */}
        <link rel="manifest" href="/manifest.json" />

        {/* ── Theme Color ── */}
        <meta name="theme-color" content="#1a1a2e" />

        {/* ── iOS Home Screen PWA ── */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="FightNight OS" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* ── SEO ── */}
        <meta
          name="description"
          content="UFC prediction app — browse fight cards, make picks, compete with friends"
        />

        {/* ── React Native Web Reset (required) ── */}
        <ScrollViewStyleReset />

        {/* ── Service Worker Registration ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(reg) {
                      console.log('[SW] Registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.log('[SW] Registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

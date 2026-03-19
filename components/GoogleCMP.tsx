'use client'

import Script from 'next/script'

/**
 * Google Consent Mode v2 Component
 * Sets default consent states to 'denied' for EEA/UK compliance.
 * The Google-certified CMP (AdSense) will update these states based on user interaction.
 */
export default function GoogleCMP() {
  return (
    <>
      <Script
        id="google-consent-mode"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Set default consent to 'denied' for all categories
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'wait_for_update': 500
            });

            // Optional: Regional specific defaults (uncomment if needed)
            /*
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'region': ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'IS', 'LI', 'NO', 'CH', 'GB']
            });
            */

            console.log('✅ [Consent Mode v2] Initialized with default denied states.');
          `,
        }}
      />
    </>
  )
}

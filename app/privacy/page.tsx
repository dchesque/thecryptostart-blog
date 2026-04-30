import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: `Privacy policy | ${SITE_CONFIG.name}`,
  description: `Privacy policy for ${SITE_CONFIG.name}. Learn how we collect, use and protect your information.`,
  robots: { index: false },
}

export default function PrivacyPage() {
  const lastUpdated = 'February 28, 2026'

  return (
    <div className="bg-paper">
      <header className="border-b border-line">
        <div className="container-hub pt-8 sm:pt-10 md:pt-14 pb-10 sm:pb-12 md:pb-16">
          <Breadcrumb
            items={[
              { name: 'Home', url: '/' },
              { name: 'Privacy', url: '/privacy' },
            ]}
            className="mb-6 sm:mb-7"
          />
          <span className="eyebrow">Legal</span>
          <h1 className="mt-3 page-title">Privacy policy</h1>
          <p className="mt-4 num text-sm text-ink-mute">Last updated: {lastUpdated}</p>
        </div>
      </header>

      <section className="container-hub py-10 sm:py-12 md:py-16">
        <article className="prose prose-lg article-body max-w-post">
          <p>
            Welcome to <strong>{SITE_CONFIG.name}</strong> (&quot;we&quot;,
            &quot;our&quot;, or &quot;us&quot;). This privacy policy explains how
            we collect, use, disclose and safeguard your information when you visit{' '}
            <a href={SITE_CONFIG.url}>{SITE_CONFIG.url}</a>.
          </p>

          <h2>1. Information we collect</h2>
          <p>We may collect information about you in a variety of ways:</p>
          <ul>
            <li><strong>Log data:</strong> IP address, browser type, pages visited and time of visit.</li>
            <li><strong>Cookies:</strong> small data files stored on your device to improve user experience.</li>
            <li><strong>Newsletter:</strong> email address if you voluntarily subscribe.</li>
            <li><strong>Comments:</strong> name and email if you submit a comment.</li>
          </ul>

          <h2>2. How we use your information</h2>
          <ul>
            <li>Operate and improve the website.</li>
            <li>Analyse site traffic and usage patterns via Google Analytics.</li>
            <li>Send newsletter updates (only if you subscribe).</li>
            <li>Respond to comments and inquiries.</li>
            <li>Display relevant advertising via Google AdSense.</li>
          </ul>

          <h2>3. Cookies &amp; third-party services</h2>
          <p>
            We use cookies from third-party services including Google Analytics
            (analytics) and Google AdSense (advertising). These services may
            collect data in accordance with their own privacy policies. You can
            opt out of Google Analytics by installing the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics opt-out add-on
            </a>.
          </p>

          <h2>4. Data retention</h2>
          <p>
            We retain personal data only as long as necessary to fulfil the
            purposes described in this policy or as required by law.
          </p>

          <h2>5. Your rights</h2>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Opt out of marketing communications at any time.</li>
          </ul>

          <h2>6. Security</h2>
          <p>
            We implement reasonable security measures to protect your information.
            However, no method of transmission over the internet is 100% secure.
          </p>

          <h2>7. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of any
            changes by updating the &quot;Last updated&quot; date above.
          </p>

          <h2>8. Contact us</h2>
          <p>
            If you have questions about this policy, please contact us at:{' '}
            <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>.
          </p>
        </article>
      </section>
    </div>
  )
}

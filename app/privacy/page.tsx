import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
    title: `Privacy Policy | ${SITE_CONFIG.name}`,
    description: `Privacy Policy for ${SITE_CONFIG.name}. Learn how we collect, use and protect your information.`,
    robots: { index: false },
}

export default function PrivacyPage() {
    const lastUpdated = 'February 28, 2026'

    return (
        <div className="py-24 min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-black text-crypto-darker mb-2">Privacy Policy</h1>
                <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated}</p>

                <div className="prose prose-lg max-w-none prose-headings:text-crypto-navy prose-p:text-gray-600 prose-a:text-crypto-primary">
                    <p>
                        Welcome to <strong>{SITE_CONFIG.name}</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                        when you visit <a href={SITE_CONFIG.url}>{SITE_CONFIG.url}</a>.
                    </p>

                    <h2>1. Information We Collect</h2>
                    <p>We may collect information about you in a variety of ways including:</p>
                    <ul>
                        <li><strong>Log Data:</strong> IP address, browser type, pages visited, and time of visit.</li>
                        <li><strong>Cookies:</strong> Small data files stored on your device to improve user experience.</li>
                        <li><strong>Newsletter:</strong> Email address if you voluntarily subscribe to our newsletter.</li>
                        <li><strong>Comments:</strong> Name and email address if you submit a comment on our articles.</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Operate and improve our website</li>
                        <li>Analyse site traffic and usage patterns via Google Analytics</li>
                        <li>Send newsletter updates (only if you subscribe)</li>
                        <li>Respond to comments and inquiries</li>
                        <li>Display relevant advertising via Google AdSense</li>
                    </ul>

                    <h2>3. Cookies &amp; Third-Party Services</h2>
                    <p>
                        We use cookies from third-party services including Google Analytics (analytics) and Google AdSense
                        (advertising). These services may collect data in accordance with their own privacy policies.
                        You can opt out of Google Analytics by installing the{' '}
                        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                            Google Analytics Opt-out Browser Add-on
                        </a>.
                    </p>

                    <h2>4. Data Retention</h2>
                    <p>
                        We retain personal data only as long as necessary to fulfil the purposes described in this policy
                        or as required by law.
                    </p>

                    <h2>5. Your Rights</h2>
                    <p>Depending on your location, you may have the right to:</p>
                    <ul>
                        <li>Access the personal data we hold about you</li>
                        <li>Request correction or deletion of your data</li>
                        <li>Opt out of marketing communications at any time</li>
                    </ul>

                    <h2>6. Security</h2>
                    <p>
                        We implement reasonable security measures to protect your information. However, no method of
                        transmission over the internet is 100% secure.
                    </p>

                    <h2>7. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by
                        updating the &quot;Last updated&quot; date above.
                    </p>

                    <h2>8. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, please contact us at:{' '}
                        <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

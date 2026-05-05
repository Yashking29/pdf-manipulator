import { useEffect, type ReactNode } from 'react'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'

const LAST_UPDATED = 'April 20, 2025'

interface SectionProps {
  title: string
  children: ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
      <div className="text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed text-sm">
        {children}
      </div>
    </section>
  )
}

export function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — Briefwise'
    return () => { document.title = 'Briefwise — Turn any PDF into a Smart Dashboard' }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <MarketingNav />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Privacy Policy</h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-10">
            Briefwise ("we", "us", or "our") operates briefwise.online. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. By using Briefwise, you agree to this policy.
          </p>

          <Section title="1. Information We Collect">
            <p><strong className="text-slate-800 dark:text-slate-200">Document content:</strong> When you upload a PDF, its text content is extracted and sent to Anthropic's Claude API for analysis. The original file is held in server memory only for the duration of your session (up to 2 hours) and is never written to permanent storage.</p>
            <p><strong className="text-slate-800 dark:text-slate-200">Usage data:</strong> We track analysis usage per IP address to enforce the free tier limit (3 analyses/month). We do not link IP addresses to personal identities or store them beyond what is needed for this purpose.</p>
            <p><strong className="text-slate-800 dark:text-slate-200">License keys:</strong> If you purchase a Pro subscription, your license key is stored locally in your browser (localStorage). We do not associate license keys with personal information.</p>
            <p><strong className="text-slate-800 dark:text-slate-200">Contact form submissions:</strong> If you contact us via the contact form, your name, email address, and message are transmitted to Formspree and forwarded to us. We use this information solely to respond to your inquiry.</p>
            <p><strong className="text-slate-800 dark:text-slate-200">Share data:</strong> When you create a share link, the analysis results (charts, metrics, summary — not your original PDF) are stored on our server for 30 days so the link remains accessible. After 30 days, this data is automatically deleted.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2">
              <li>To analyze your PDF and generate dashboard results.</li>
              <li>To enforce the free tier usage limit (3 analyses/month per IP).</li>
              <li>To validate Pro license keys and grant unlimited access.</li>
              <li>To keep share links accessible for 30 days.</li>
              <li>To respond to support, billing, or general inquiries submitted via our contact form.</li>
            </ul>
            <p>We do not use your data for advertising, profiling, or any purpose beyond providing the Briefwise service.</p>
          </Section>

          <Section title="3. Third-Party Services">
            <p><strong className="text-slate-800 dark:text-slate-200">Anthropic (Claude API):</strong> Your PDF text is sent to Anthropic's API for analysis. Anthropic processes this data under their own privacy policy. Per Anthropic's API usage policy, data submitted via the API is not used to train their models.</p>
            <p><strong className="text-slate-800 dark:text-slate-200">Lemon Squeezy:</strong> Payments and subscription management are handled by Lemon Squeezy. When you purchase a Pro plan, your payment information is processed by Lemon Squeezy under their privacy policy. We receive only a license key — we do not receive or store your payment details.</p>
            <p><strong className="text-slate-800 dark:text-slate-200">Formspree:</strong> Contact form submissions are processed by Formspree. Their privacy policy governs that data.</p>
          </Section>

          <Section title="4. Data Retention">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Uploaded PDFs:</strong> Deleted from server memory automatically after 2 hours.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Analysis results (share store):</strong> Deleted automatically after 30 days.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">IP usage records:</strong> Reset automatically every 30 days.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Browser storage:</strong> License keys and local history are stored in your browser's localStorage. You can clear this at any time through your browser settings.</li>
            </ul>
          </Section>

          <Section title="5. Cookies and Local Storage">
            <p>We do not use tracking cookies. We use browser <strong className="text-slate-800 dark:text-slate-200">localStorage</strong> to store:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Your dark/light mode preference.</li>
              <li>Your analysis history (stored locally on your device only).</li>
              <li>Your Pro license key (if applicable).</li>
            </ul>
            <p className="mt-3">We use browser <strong className="text-slate-800 dark:text-slate-200">sessionStorage</strong> to persist chat messages during a browser tab session.</p>
          </Section>

          <Section title="6. Data Security">
            <p>All connections to briefwise.online use HTTPS/TLS encryption. Your PDF is transmitted securely and processed entirely in server memory — it is never written to disk on our servers. We do not share your document content with any third party other than Anthropic for the purpose of AI analysis.</p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>Briefwise is not directed at children under 13 years of age, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Request access to data we hold about you.</li>
              <li>Request deletion of data associated with your IP or license key.</li>
              <li>Withdraw consent to data processing.</li>
            </ul>
            <p className="mt-3">To exercise these rights, email us at <a href="mailto:yashhissaria99@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">yashhissaria99@gmail.com</a>.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. If we make material changes, we will update the "Last updated" date at the top of this page. Continued use of Briefwise after changes take effect constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="10. Contact">
            <p>If you have questions about this Privacy Policy or how we handle your data, please contact us:</p>
            <ul className="list-none mt-2 space-y-1">
              <li><strong className="text-slate-800 dark:text-slate-200">Email:</strong> <a href="mailto:yashhissaria99@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">yashhissaria99@gmail.com</a></li>
              <li><strong className="text-slate-800 dark:text-slate-200">Website:</strong> <a href="https://briefwise.online/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">briefwise.online/contact</a></li>
            </ul>
          </Section>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}

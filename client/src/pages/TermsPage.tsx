import { useEffect } from 'react'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'

const LAST_UPDATED = 'April 20, 2025'

interface SectionProps {
  title: string
  children: React.ReactNode
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

export function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Service — Briefwise'
    return () => { document.title = 'Briefwise — Turn any PDF into a Smart Dashboard' }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <MarketingNav />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Terms of Service</h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-10">
            Please read these Terms of Service ("Terms") carefully before using briefwise.online (the "Service") operated by Briefwise ("we", "us", or "our"). By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
          </p>

          <Section title="1. The Service">
            <p>Briefwise is an AI-powered PDF analysis tool that extracts data from uploaded PDF documents and presents it as an interactive dashboard. The Service uses Anthropic's Claude AI to analyze document content and generate summaries, charts, and metrics.</p>
          </Section>

          <Section title="2. Acceptable Use">
            <p>You agree to use the Service only for lawful purposes and in compliance with these Terms. You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Upload documents that you do not have the right to process or share.</li>
              <li>Use the Service to analyze documents containing illegal content.</li>
              <li>Attempt to reverse-engineer, circumvent, or abuse the free tier limits through automated requests, VPNs used specifically to evade limits, or other means.</li>
              <li>Use the Service in any way that could damage, disable, or impair the Service or interfere with other users.</li>
              <li>Resell, sublicense, or commercially distribute access to the Service without our written permission.</li>
              <li>Upload malicious files or attempt to exploit security vulnerabilities.</li>
            </ul>
          </Section>

          <Section title="3. User Content and Documents">
            <p>You retain all ownership rights to documents you upload. By uploading a PDF to Briefwise, you grant us a limited, temporary license to process that document solely for the purpose of providing the analysis service you requested.</p>
            <p>You represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>You own or have the necessary rights to upload and process the documents.</li>
              <li>Processing the documents will not violate any third party's intellectual property rights, privacy rights, or confidentiality obligations.</li>
              <li>The documents do not contain information whose processing is prohibited by applicable law.</li>
            </ul>
          </Section>

          <Section title="4. Free Tier and Pro Subscription">
            <p><strong className="text-slate-800 dark:text-slate-200">Free tier:</strong> You may analyze up to 3 PDF documents per calendar month at no charge. Usage is tracked by IP address. We reserve the right to adjust free tier limits with reasonable notice.</p>
            <p><strong className="text-slate-800 dark:text-slate-200">Pro subscription:</strong> For unlimited analyses, you may purchase a Pro subscription at $9/month through Lemon Squeezy. By subscribing, you agree to Lemon Squeezy's Terms of Service and our billing terms below.</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Subscriptions are billed monthly in advance.</li>
              <li>You may cancel at any time through the Lemon Squeezy customer portal.</li>
              <li>Upon cancellation, you retain Pro access until the end of the current billing period. No partial refunds are issued for unused portions of a billing period, except under our refund policy.</li>
              <li>We reserve the right to change subscription pricing with 30 days' notice to active subscribers.</li>
            </ul>
            <p><strong className="text-slate-800 dark:text-slate-200">Refund policy:</strong> If you are not satisfied with the Service, contact us within 7 days of your first payment for a full refund, no questions asked. Refunds are not available after 7 days.</p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>The Briefwise name, logo, website design, and Service code are our intellectual property and may not be copied, reproduced, or used without our written permission.</p>
            <p>The AI-generated analysis results (summaries, charts, metrics) produced from your documents are provided to you for your own use. We claim no ownership over the generated content derived from your documents.</p>
          </Section>

          <Section title="6. Disclaimers">
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
            <p>Briefwise is an AI analysis tool. The AI-generated results (summaries, metrics, anomaly flags) are provided for informational purposes only and should not be relied upon as legal, financial, tax, or accounting advice. Always verify important figures against the original source documents.</p>
            <p>We do not warrant that:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>The Service will be uninterrupted, error-free, or fully accurate.</li>
              <li>Any errors in the Service will be corrected.</li>
              <li>AI-generated analysis results will be complete or free of inaccuracies.</li>
            </ul>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BRIEFWISE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p>OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR $10 IF YOU HAVE NOT PAID ANYTHING.</p>
          </Section>

          <Section title="8. Third-Party Services">
            <p>The Service integrates with third-party services including Anthropic (Claude AI), Lemon Squeezy (payments), and Formspree (contact forms). Your use of these third-party services is governed by their respective terms and privacy policies. We are not responsible for the practices, availability, or content of third-party services.</p>
          </Section>

          <Section title="9. Service Availability and Changes">
            <p>We reserve the right to modify, suspend, or discontinue the Service (or any part of it) at any time, with or without notice. We are not liable to you or any third party for any such modification, suspension, or discontinuation.</p>
            <p>We may update these Terms from time to time. If we make material changes, we will update the "Last updated" date at the top of this page. Your continued use of the Service after changes take effect constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="10. Termination">
            <p>We reserve the right to terminate or suspend your access to the Service immediately, without prior notice, if you violate these Terms or engage in conduct that we determine, in our sole discretion, to be harmful to other users, us, or third parties.</p>
            <p>You may stop using the Service at any time. If you have a Pro subscription, you may cancel it through the Lemon Squeezy customer portal.</p>
          </Section>

          <Section title="11. Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved through good-faith negotiation. If resolution cannot be reached, disputes shall be submitted to binding arbitration in accordance with applicable Indian arbitration law.</p>
          </Section>

          <Section title="12. Contact">
            <p>If you have any questions about these Terms, please contact us:</p>
            <ul className="list-none mt-2 space-y-1">
              <li><strong className="text-slate-800 dark:text-slate-200">Email:</strong> <a href="mailto:hello@briefwise.online" className="text-indigo-600 dark:text-indigo-400 hover:underline">hello@briefwise.online</a></li>
              <li><strong className="text-slate-800 dark:text-slate-200">Website:</strong> <a href="https://briefwise.online/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">briefwise.online/contact</a></li>
            </ul>
          </Section>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}

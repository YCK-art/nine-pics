export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-inconsolata">Privacy Policy</h1>
          <p className="text-gray-400">Effective: July 10, 2025</p>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <div>
            <p className="mb-4">
              ninepics ("we," "our," or "us") values your privacy and collects only the minimum personal information necessary to provide and improve our service. This Privacy Policy explains what information we collect, how we use and protect it, and your rights.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">1. Scope</h2>
            <p>
              This Privacy Policy applies to all users of the ninepics website and related services ("Service").
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">2. Information We Collect</h2>
            <p className="mb-4">
              We collect the following information to provide and improve our Service:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Name, email address, and profile picture provided by Google when you log in</li>
              <li><strong>Usage Data:</strong> Access logs, IP address, browser information, and traffic data</li>
              <li><strong>Uploaded Content:</strong> Images you upload to the Service</li>
            </ul>
            <p className="mt-4">
              We do not collect passwords, financial information, or sensitive personal data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">3. How We Use Personal Information</h2>
            <p className="mb-4">
              We use the collected information solely for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Providing and operating the Service</li>
              <li>Improving service quality and user experience</li>
              <li>Strengthening security and detecting errors</li>
              <li>Complying with legal obligations</li>
            </ul>
            <p className="mt-4">
              We do not sell or share your personal information with third parties, except where required by law.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">4. Third-Party Disclosure</h2>
            <p>
              We do not disclose your personal information to third parties except when required to do so by applicable laws or legal processes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">5. Data Retention</h2>
            <p className="mb-4">
              We retain personal information only for as long as necessary to fulfill the purposes stated above or to comply with legal obligations.
            </p>
            <p>
              When you request to delete your account, we will also delete your related data without undue delay.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">6. Security</h2>
            <p className="mb-4">
              We implement reasonable technical and administrative measures to protect your personal information.
            </p>
            <p>
              However, due to the nature of the Internet, we cannot guarantee complete security, and we are not responsible for breaches beyond our reasonable control as permitted by law.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">7. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Request access to your personal information</li>
              <li>Request correction or deletion of your personal information</li>
              <li>Request suspension of processing of your personal information</li>
            </ul>
            <p className="mt-4">
              To exercise your rights, please contact us by email:
            </p>
            <p className="mt-2">
              📧 <a href="mailto:ninepics99@gmail.com" className="text-blue-400 hover:text-blue-300">ninepics99@gmail.com</a>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">8. Children's Privacy</h2>
            <p className="mb-4">
              Our Service is not intended for use by anyone under the age of 18.
            </p>
            <p className="mb-4">
              We do not knowingly collect personal information from children.
            </p>
            <p>
              If we become aware that we have collected personal information from a child, we will promptly delete it.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">9. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time to reflect changes in laws or our Service.
            </p>
            <p>
              Any significant changes will be announced on our website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">10. Contact</h2>
            <p className="mb-4">
              If you have any questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <p>
              📧 <a href="mailto:ninepics99@gmail.com" className="text-blue-400 hover:text-blue-300">ninepics99@gmail.com</a>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300 font-inconsolata flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
} 
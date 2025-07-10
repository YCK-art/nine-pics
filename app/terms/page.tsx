export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-inconsolata">Terms of Service</h1>
          <p className="text-gray-400">Effective: July 10, 2025</p>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <div>
            <p className="mb-4">
              These Terms of Service ("Terms") govern your use of ninepics ("we," "our," or "us") and our digital album service ("Service"). By using our Service, you agree to these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">1. Service Overview</h2>
            <p className="mb-4">
              ninepics is a digital album platform where you can sign up and log in using your Google account.
            </p>
            <p className="mb-4">
              Users can upload one photo at first, and additional slots (up to a total of nine) unlock as the album receives more views.
            </p>
            <p>
              You can share your album link on social media profiles, similar to Instagram bio links.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">2. Account</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You can sign up and log in through your Google account.</li>
              <li>You are responsible for keeping your account secure, and we are not responsible for unauthorized use of your account.</li>
              <li>You must provide accurate and truthful information. You are solely responsible for any issues caused by false or misleading information.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">3. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You must comply with applicable laws and these Terms when using the Service.</li>
              <li>You must not upload content that infringes the rights of others (such as copyright, portrait rights) or that is illegal or inappropriate.</li>
              <li>You are solely responsible for the content you upload, and we disclaim all liability for it.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">4. Service Availability and Changes</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We may modify, suspend, or discontinue the Service at any time without prior notice.</li>
              <li>We are not responsible for any damages incurred by you as a result of changes, suspension, or termination of the Service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">5. Intellectual Property</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All rights to the logo, design, system, and other elements of the Service belong to us. You may not use them without our prior consent.</li>
              <li>Copyright of uploaded content remains with you, but you grant us a license to use it for operating the Service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">6. Disclaimer</h2>
            <p className="mb-4">
              We strive to provide the Service in a stable manner.
            </p>
            <p>
              However, we are not responsible for any damages caused by force majeure events, system failures, external attacks, or your own negligence or violation of these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">7. Changes to the Terms</h2>
            <p className="mb-4">
              We may update these Terms to reflect changes in laws or improvements to the Service.
            </p>
            <p>
              The updated Terms will take effect once posted on this page.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">8. Governing Law and Jurisdiction</h2>
            <p className="mb-4">
              These Terms are governed by the laws of the Republic of Korea.
            </p>
            <p>
              Any disputes arising from or related to these Terms shall be subject to the exclusive jurisdiction of the Seoul Central District Court.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">9. Contact</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at:
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
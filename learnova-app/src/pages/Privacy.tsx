const Privacy = () => (
  <div className="py-16">
    <div className="container mx-auto max-w-3xl px-4">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 21, 2026</p>
        <div className="mt-8 space-y-6 text-foreground/85 leading-relaxed">
          <p>At Learnova ("we", "our", "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.</p>
          <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name, email address, and account credentials during registration</li>
            <li>Payment information processed securely through Razorpay</li>
            <li>Course progress and learning activity data</li>
            <li>Device information, browser type, and IP address</li>
          </ul>
          <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and maintain our learning platform</li>
            <li>To process payments and grant course access</li>
            <li>To communicate updates, offers, and support</li>
            <li>To improve our services and user experience</li>
          </ul>
          <h2 className="text-xl font-semibold text-foreground">Data Security</h2>
          <p>We implement industry-standard security measures to protect your data. Payment processing is handled by Razorpay, a PCI-DSS compliant payment gateway. We do not store your card details.</p>
          <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
          <p>We use Razorpay for payment processing and YouTube for video hosting. These services have their own privacy policies.</p>
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p>For privacy-related queries, email us at privacy@learnova.in.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Privacy;

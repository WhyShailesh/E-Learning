const Terms = () => (
  <div className="py-16">
    <div className="container mx-auto max-w-3xl px-4">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 21, 2026</p>
        <div className="mt-8 space-y-6 text-foreground/85 leading-relaxed">
          <p>By using Learnova, you agree to the following terms and conditions. Please read them carefully before using our platform.</p>
          <h2 className="text-xl font-semibold text-foreground">Account Registration</h2>
          <p>You must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials.</p>
          <h2 className="text-xl font-semibold text-foreground">Course Purchases</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All prices are listed in Indian Rupees (INR) and include applicable taxes</li>
            <li>Payments are processed securely through Razorpay</li>
            <li>Once purchased, courses provide lifetime access to the enrolled user</li>
            <li>Courses are non-transferable to other accounts</li>
          </ul>
          <h2 className="text-xl font-semibold text-foreground">Refund Policy</h2>
          <p>We offer a 7-day refund policy from the date of purchase. To request a refund, contact us at support@learnova.in with your order details.</p>
          <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
          <p>All course content, including videos, materials, and code, is the intellectual property of Learnova and its instructors. Unauthorized distribution or reproduction is prohibited.</p>
          <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
          <p>Learnova provides educational content "as is" and does not guarantee specific career outcomes or results from course completion.</p>
          <h2 className="text-xl font-semibold text-foreground">Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of the revised terms.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Terms;

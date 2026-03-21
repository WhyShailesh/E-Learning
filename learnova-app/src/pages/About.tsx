const About = () => (
  <div className="py-16">
    <div className="container mx-auto max-w-3xl px-4">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground">About Learnova</h1>
        <div className="mt-8 space-y-6 text-foreground/85 leading-relaxed">
          <p>
            Learnova is a premium online learning platform dedicated to making quality education accessible to everyone. Founded in 2024, we partner with industry experts and educators to deliver practical, career-focused courses.
          </p>
          <p>
            Our mission is to bridge the gap between traditional education and the rapidly evolving demands of the tech industry. We believe learning should be flexible, engaging, and directly applicable to real-world challenges.
          </p>
          <h2 className="text-xl font-semibold text-foreground pt-4">What Sets Us Apart</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Expert-led courses with real-world projects</li>
            <li>Self-paced learning with lifetime access</li>
            <li>Progress tracking and completion certificates</li>
            <li>Affordable pricing in Indian Rupees</li>
            <li>Active community support</li>
          </ul>
          <h2 className="text-xl font-semibold text-foreground pt-4">Our Team</h2>
          <p>
            We are a team of passionate educators, developers, and designers based in Mumbai, India. Our collective experience spans over 40 years in technology, education, and product development.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default About;

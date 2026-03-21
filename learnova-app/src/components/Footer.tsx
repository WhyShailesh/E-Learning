import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Learnova</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Premium online courses to accelerate your career. Learn from industry experts at your own pace.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Explore</h4>
          <div className="flex flex-col gap-2">
            <Link to="/learner/courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Courses</Link>
            <Link to="/learner/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            <Link to="/learner/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Legal</h4>
          <div className="flex flex-col gap-2">
            <Link to="/learner/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/learner/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Contact</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>support@learnova.in</span>
            <span>+91 98765 43210</span>
            <span>Mumbai, India</span>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Learnova. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

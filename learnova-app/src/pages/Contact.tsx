import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  return (
    <div className="py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
          <p className="mt-2 text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-8 animate-fade-up">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="How can we help?" rows={5} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send Message"}
            </Button>
          </form>
          <div className="space-y-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {[
              { icon: Mail, label: "Email", value: "support@learnova.in" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210" },
              { icon: MapPin, label: "Address", value: "Andheri West, Mumbai, Maharashtra 400058, India" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

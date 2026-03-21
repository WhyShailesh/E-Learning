import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CourseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = window.location.pathname.startsWith("/admin");
  const basePath = isAdmin ? "/admin" : "/instructor";

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(`${basePath}/dashboard`)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="rounded-lg border border-border bg-card p-8">
        <h2 className="text-lg font-semibold">Edit Course #{id}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Course configuration and content management.</p>
        <Button className="mt-4" onClick={() => navigate(`${basePath}/dashboard`)}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

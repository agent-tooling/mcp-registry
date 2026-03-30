import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to registry
      </Link>
    </div>
  );
}

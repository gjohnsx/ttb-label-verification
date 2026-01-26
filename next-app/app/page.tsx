import Link from "next/link";

export default function Page() {
  return (
    <main className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">TTB Label Verification</h1>
      <p className="text-muted-foreground mb-6">
        AI-powered tool for TTB compliance agents to verify alcohol label applications.
      </p>
      <Link
        href="/demo"
        className="text-primary underline hover:no-underline"
      >
        View Component Demo
      </Link>
    </main>
  );
}
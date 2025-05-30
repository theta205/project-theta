"use client";

import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function ClerkDashboardButton() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <Button disabled>Loading...</Button>
    );
  }

  if (isSignedIn) {
    return (
      <Button
        onClick={() => router.push("/dashboard")}
        className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 gap-2"
      >
        Go to dashboard
      </Button>
    );
  }

  return (
    // @ts-expect-error Clerk types may lag runtime features
    <SignInButton afterSignInUrl="/dashboard" asChild>
      <Button
        className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 gap-2"
      >
        Create your assistant
      </Button>
    </SignInButton>
  );
}

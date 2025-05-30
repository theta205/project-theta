import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ClerkSignInButtonTest() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    // User is signed in: show dashboard button
    return (
      <Link href="/dashboard">
        <button
          type="button"
          className="text-lg px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 shadow-lg hover:shadow-violet-500/25 transition-all duration-300 flex items-center"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Go to Dashboard
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </Link>
    );
  }

  // User is signed out: show sign-in button
  return (
    <SignInButton fallbackRedirectUrl="/dashboard" mode="modal">
      <button
        type="button"
        className="text-lg px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 shadow-lg hover:shadow-violet-500/25 transition-all duration-300 flex items-center"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Create Your Assistant
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>
    </SignInButton>
  );
}


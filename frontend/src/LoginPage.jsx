// src/LoginPage.tsx
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <SignIn path="/login" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
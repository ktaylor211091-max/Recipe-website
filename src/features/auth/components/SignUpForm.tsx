"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Input, Button, useToast } from "@/components";
import { validateEmail, validatePassword, validatePasswordMatch, validateUsername } from "@/lib/validation";

export function SignUpForm({ signUpAction }: { signUpAction: (formData: FormData) => Promise<void> }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const usernameValidation = validateUsername(username);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const passwordMatchValidation = validatePasswordMatch(password, confirmPassword);

    const hasErrors =
      !usernameValidation.isValid ||
      !emailValidation.isValid ||
      !passwordValidation.isValid ||
      !passwordMatchValidation.isValid;

    if (hasErrors) {
      setErrors({
        username: usernameValidation.error,
        email: emailValidation.error,
        password: passwordValidation.error,
        confirmPassword: passwordMatchValidation.error,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await signUpAction(formData);
    } catch (error) {
      showToast("Failed to create account. Please try again.", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="username"
        type="text"
        required
        label="Username"
        placeholder="johndoe"
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
        error={errors.username}
        helperText="3-30 characters, letters, numbers, underscores, and hyphens only"
        disabled={isSubmitting}
      />

      <Input
        name="email"
        type="email"
        required
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        error={errors.email}
        disabled={isSubmitting}
      />

      <Input
        name="password"
        type="password"
        required
        minLength={6}
        label="Password"
        placeholder="••••••••"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        error={errors.password}
        helperText="At least 6 characters"
        disabled={isSubmitting}
      />

      <Input
        name="confirmPassword"
        type="password"
        required
        minLength={6}
        label="Confirm Password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}

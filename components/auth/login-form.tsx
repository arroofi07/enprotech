"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getAuthErrorMessage } from "@/lib/domain/auth/errors";
import { loginSchema, type LoginInput } from "@/lib/validations/auth-schemas";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  const {
    register,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Masuk ke E-Training</CardTitle>
        <CardDescription>
          Gunakan email dan password yang telah terdaftar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FieldGroup>
            {state.error ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {state.message ?? getAuthErrorMessage(state.error)}
                </AlertDescription>
              </Alert>
            ) : null}

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@perusahaan.com"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              Masuk
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

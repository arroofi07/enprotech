"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  registerAction,
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
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth-schemas";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  const {
    register,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      router.push("/login");
    }
  }, [state.success, state.message, router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Daftar E-Training</CardTitle>
        <CardDescription>
          Buat akun baru. Akun akan aktif setelah disetujui Admin.
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

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Nama lengkap"
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

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
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Konfirmasi Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              Daftar
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

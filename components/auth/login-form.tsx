"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import {
  loginAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { getAuthErrorMessage } from "@/lib/domain/auth/errors";
import { loginSchema, type LoginInput } from "@/lib/validations/auth-schemas";

const initialState: AuthActionState = {};

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.replace(state.redirectTo);
      router.refresh();
    }
  }, [state.success, state.redirectTo, router]);

  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      formAction(data);
    });
  });

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Masuk ke akun Anda
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gunakan email dan password yang telah terdaftar.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  size="icon-xs"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
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
    </div>
  );
}

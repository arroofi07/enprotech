"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { toast } from "sonner";

import {
  registerAction,
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
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth-schemas";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
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

  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      formAction(data);
    });
  });

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      router.push("/login");
    }
  }, [state.success, state.message, router]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Buat akun baru
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Akun akan aktif setelah disetujui Admin.
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
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">
              Konfirmasi Password
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  size="icon-xs"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
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
    </div>
  );
}

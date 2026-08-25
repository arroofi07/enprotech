"use client";

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
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
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
    } else if (state.error) {
      toast.error(state.message ?? getAuthErrorMessage(state.error));
    }
  }, [state, router]);

  return (
    <div className="w-full">
      <CardHeader className="mb-6 gap-1.5 px-0">
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight">
          Buat akun baru
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Akun akan aktif setelah disetujui Admin.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} className="space-y-5">
        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Nama lengkap"
              className="h-11"
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
              className="h-11"
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup className="h-11">
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
            <InputGroup className="h-11">
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

          <Button
            type="submit"
            className="mt-1 h-11 w-full rounded-full text-sm font-semibold"
            disabled={isPending}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Daftar
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <ButtonLink
          href="/login"
          variant="link"
          className="h-auto p-0 text-sm font-medium"
        >
          Masuk di sini
        </ButtonLink>
      </p>
    </div>
  );
}

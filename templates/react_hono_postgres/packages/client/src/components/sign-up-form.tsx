import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import Loader from "./loader";

type FormData = {
  email: string;
  password: string;
};

export default function AuthForm() {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isPasswordValid = useMemo(() => {
    return password.length >= 6;
  }, [password]);

  const isFormValid = useMemo(() => {
    return isEmailValid && isPasswordValid;
  }, [isEmailValid, isPasswordValid]);

  const onSubmit = async (values: FormData) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          navigate({
            to: "/dashboard",
          });
        },
        onError: (ctx) => {
          setError("email", {
            type: "manual",
            message: ctx.error.message,
          });
        },
      },
    );
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div>
      <h1>サンプルシステム</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            placeholder="メールアドレスを入力"
            {...register("email")}
          />
          {errors.email && <div>{errors.email.message}</div>}
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            placeholder="パスワードを入力"
            {...register("password")}
          />
          {errors.password && <div>{errors.password.message}</div>}
        </div>
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}

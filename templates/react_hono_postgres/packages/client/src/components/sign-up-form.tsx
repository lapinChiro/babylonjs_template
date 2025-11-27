import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Copy, Check, Eye, EyeOff, ArrowDown, Loader2 } from "lucide-react";
import Loader from "./loader";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";

type FormData = {
  email: string;
  password: string;
};

export default function AuthForm() {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  // Demo account credentials
  const demoEmail = "test1@example.com";
  const demoPassword = "password123";

  // Demo account UI state
  const [showPassword, setShowPassword] = useState(false);
  const [copyStates, setCopyStates] = useState({
    email: { copied: false },
    password: { copied: false }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Watch form values for validation
  const email = form.watch("email");
  const password = form.watch("password");

  // Validation logic matching vue_hono_postgres
  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isPasswordValid = useMemo(() => {
    return password.length >= 6;
  }, [password]);

  const isFormValid = useMemo(() => {
    return isEmailValid && isPasswordValid;
  }, [isEmailValid, isPasswordValid]);

  // Demo account helper functions
  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates(prev => ({
        ...prev,
        [type]: { copied: true }
      }));
      toast.success(`${type === 'email' ? 'メールアドレス' : 'パスワード'}をコピーしました`);
      setTimeout(() => {
        setCopyStates(prev => ({
          ...prev,
          [type]: { copied: false }
        }));
      }, 2000);
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  const fillEmail = () => {
    form.setValue('email', demoEmail);
    toast.success('メールアドレスを入力しました');
  };

  const fillPassword = () => {
    form.setValue('password', demoPassword);
    toast.success('パスワードを入力しました');
  };

  const fillBothFields = () => {
    form.setValue('email', demoEmail);
    form.setValue('password', demoPassword);
    toast.success('デモアカウント情報を入力しました');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: FormData) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          toast.success("ログインしました");
          navigate({
            to: "/items",
          });
        },
        onError: (ctx) => {
          form.setError("email", {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">サンプルシステム</h1>
          <p className="text-muted-foreground">
            メールアドレスとパスワードを入力してログインしてください
          </p>

          {/* デモアカウント情報 */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 text-center">
              デモアカウント
            </div>

            <div className="space-y-2">
              {/* Email */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-blue-600 dark:text-blue-400 min-w-[80px]">Email:</Label>
                <div className="flex-1 bg-white dark:bg-blue-900/30 rounded px-2 py-1 text-sm font-mono border">
                  {demoEmail}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(demoEmail, 'email')}
                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                  title={copyStates.email.copied ? 'コピー済み!' : 'メールアドレスをコピー'}
                >
                  {copyStates.email.copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fillEmail}
                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                  title="入力フィールドに設定"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Password */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-blue-600 dark:text-blue-400 min-w-[80px]">Password:</Label>
                <div className="flex-1 bg-white dark:bg-blue-900/30 rounded px-2 py-1 text-sm font-mono border">
                  {showPassword ? demoPassword : '••••••••••••'}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={togglePasswordVisibility}
                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                  title={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(demoPassword, 'password')}
                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                  title={copyStates.password.copied ? 'コピー済み!' : 'パスワードをコピー'}
                >
                  {copyStates.password.copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fillPassword}
                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                  title="入力フィールドに設定"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* 一括設定ボタン */}
            <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillBothFields}
                className="w-full text-xs h-7 border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
              >
                両方とも入力フィールドに設定
              </Button>
            </div>
          </div>
        </div>

        {/* ログインフォーム */}
        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="メールアドレスを入力"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>パスワード</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="パスワードを入力"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isFormValid || form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ログイン中...
                    </>
                  ) : (
                    "ログイン"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

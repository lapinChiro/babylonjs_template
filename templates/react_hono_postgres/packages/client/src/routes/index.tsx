import SignUp from '@/components/sign-up-form'
import { authClient } from '@/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: HomeComponent,
  beforeLoad: () => {
    return { pageTitle: "ログイン" };
  },
})

function HomeComponent() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (session && !isPending) {
      navigate({
        to: "/items",
      });
    }
  }, [session, isPending]);

  if (isPending) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return <SignUp />
}

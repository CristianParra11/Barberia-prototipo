import LoginForm from "@/components/login-form"
import AnimatedBackground from "@/components/animated-background"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-6 sm:py-12">
      <AnimatedBackground />
      <div className="relative w-full max-w-md px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10 z-10">
        <LoginForm />
      </div>
    </div>
  )
}

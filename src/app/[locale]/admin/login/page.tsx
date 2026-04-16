"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { signIn } from "@/lib/firebase/auth";
import { Zap, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      router.push("/admin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      if (message.includes("invalid-credential") || message.includes("wrong-password")) {
        setError("Email ou senha incorretos.");
      } else if (message.includes("too-many-requests")) {
        setError("Muitas tentativas. Aguarde alguns minutos.");
      } else {
        setError("Erro ao fazer login. Verifique suas credenciais.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-brand-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-white text-lg leading-tight">
                Fábrica de
              </div>
              <div className="font-display font-bold text-brand-400 text-lg leading-tight">
                Liberdade
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-3">Painel Administrativo</p>
        </div>

        {/* Form card */}
        <div className="card p-8">
          <h1 className="font-display font-bold text-xl text-white mb-6 text-center">
            Entrar no painel
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  className="input pl-10"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                "btn-primary w-full justify-center",
                (loading || !email || !password) &&
                  "opacity-70 cursor-not-allowed hover:translate-y-0 hover:shadow-brand"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Acesso restrito aos administradores do site
        </p>
      </div>
    </div>
  );
}

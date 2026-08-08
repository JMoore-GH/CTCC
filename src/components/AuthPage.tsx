import { useState } from 'react';

import { useAuth } from '@/hooks/AuthContext';

const msLogo = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 21 21"
    className="mr-2"
  >
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

export function AuthPage() {
  const { signIn, fabricAuthEnabled } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLabel = isLoading
    ? fabricAuthEnabled
      ? 'Opening Fabric...'
      : 'Signing in...'
    : 'Sign in with Microsoft';

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#111a2f] text-[#eef4ff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_-8%,rgba(98,145,243,0.28)_0%,rgba(98,145,243,0)_38%),radial-gradient(circle_at_82%_18%,rgba(72,190,255,0.22)_0%,rgba(72,190,255,0)_34%),linear-gradient(180deg,#0f1730_0%,#111a2f_55%,#141f36_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(145,171,222,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(145,171,222,0.08)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div className="relative flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="rounded-xl border border-[rgba(186,203,236,0.24)] bg-[rgba(27,40,67,0.72)] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_38px_rgba(3,8,21,0.42)] backdrop-blur-[16px]">
            <div className="mb-8 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#8ea8ff]">
                Fabric App
              </p>
              <h1 className="text-2xl font-bold text-[#f6f9ff]">Copilot Token Command Center</h1>
              <p className="mt-2 text-sm leading-6 text-[#afc0e3]">
                Sign in to view enterprise Copilot adoption, token consumption, and cost-to-outcome signals.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.16] disabled:opacity-50"
            >
              {msLogo}
              {buttonLabel}
            </button>

            {error && (
              <p className="mt-3 text-center text-sm text-[#ff9ba1]">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

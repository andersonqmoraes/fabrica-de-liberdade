import { NextResponse } from "next/server";

// Rota temporária de diagnóstico — remover após confirmar configuração
export async function GET() {
  return NextResponse.json({
    node: process.version,
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `✓ configurada (${process.env.GEMINI_API_KEY.slice(0, 6)}...)` : "✗ AUSENTE",
      RESEND_API_KEY: process.env.RESEND_API_KEY ? "✓ configurada" : "✗ ausente",
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "(usando padrão)",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ configurada" : "✗ ausente",
      NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "✗ ausente",
    },
  });
}

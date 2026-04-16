import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const { subject, htmlContent, previewText, locale } = await request.json();

    if (!subject || !htmlContent) {
      return NextResponse.json({ error: "Assunto e conteúdo são obrigatórios" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY não configurada. Adicione em Vercel → Settings → Environment Variables." },
        { status: 400 }
      );
    }

    // Busca inscritos confirmados (ou todos se não houver confirmados)
    const constraints = [where("locale", "==", locale || "pt-BR")];
    const snap = await getDocs(query(collection(db, "subscribers"), ...constraints));
    const emails = snap.docs.map((d) => d.data().email as string).filter(Boolean);

    if (emails.length === 0) {
      return NextResponse.json({ error: "Nenhum inscrito encontrado para este idioma." }, { status: 400 });
    }

    const resend = new Resend(resendKey);
    const fromDomain = process.env.RESEND_FROM_EMAIL || "newsletter@fabricadeliberdade.com.br";

    // Envia em lotes de 50 (limite do Resend free tier)
    const batchSize = 50;
    let sent = 0;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await resend.emails.send({
        from: `Fábrica de Liberdade <${fromDomain}>`,
        to: batch,
        subject,
        html: htmlContent,
        headers: { "X-Preview-Text": previewText || subject },
      });
      sent += batch.length;
    }

    return NextResponse.json({ success: true, sent });
  } catch (error: unknown) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao enviar" }, { status: 500 });
  }
}

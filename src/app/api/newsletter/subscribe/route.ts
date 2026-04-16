import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, locale = "pt-BR", source = "unknown" } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Verifica se já existe
    const existing = await getDocs(
      query(collection(db, "subscribers"), where("email", "==", email))
    );

    if (!existing.empty) {
      return NextResponse.json({ message: "Já inscrito" }, { status: 200 });
    }

    // Salva no Firestore
    await addDoc(collection(db, "subscribers"), {
      email,
      locale,
      source,
      tags: [locale, source],
      confirmed: false,
      subscribedAt: serverTimestamp(),
    });

    // Opcional: chamar API do Mailchimp
    const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
    const mailchimpListId = process.env.MAILCHIMP_LIST_ID;
    const mailchimpServer = process.env.MAILCHIMP_SERVER_PREFIX || "us1";

    if (mailchimpApiKey && mailchimpListId) {
      await fetch(
        `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`,
        {
          method: "POST",
          headers: {
            Authorization: `apikey ${mailchimpApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: email,
            status: "subscribed",
            language: locale,
            tags: [source],
          }),
        }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

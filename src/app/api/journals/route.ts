import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const journals = await prisma.journal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      journals.map((journal) => ({
        ...journal,
        content: decrypt(journal.content),
      }))
    );
  } catch {
    return NextResponse.json({ message: "Kayıtlar alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const effort = body.effort === "" || body.effort == null
      ? null
      : Number(body.effort);

    if (!title || !content) {
      return NextResponse.json({ message: "Başlık ve içerik zorunludur." }, { status: 400 });
    }

    if (title.length > 120 || content.length > 10000) {
      return NextResponse.json({ message: "Başlık veya içerik çok uzun." }, { status: 400 });
    }

    if (effort !== null && (!Number.isInteger(effort) || effort < 0 || effort > 10)) {
      return NextResponse.json({ message: "Çalışma puanı 0-10 arasında olmalıdır." }, { status: 400 });
    }

    const journal = await prisma.journal.create({
      data: {
        title,
        content: encrypt(content),
        effort,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Günlük oluşturuldu.", id: journal.id }, { status: 201 });
  } catch (error) {
    console.error("Günlük oluşturma hatası:", error);
    return NextResponse.json({ message: "Günlük oluşturulamadı." }, { status: 500 });
  }
}

import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
    },
  });

  if (users.length === 0) {
    console.log("Veritabanında kullanıcı bulunamadı.");
    return;
  }

  console.log("Kayıtlı hesaplar:");
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
  });

  const email = process.argv[2]?.trim().toLowerCase();
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log('Kullanım: npx tsx scripts/reset-password.ts "email" "yeni-şifre"');
    return;
  }

  if (newPassword.length < 8) {
    console.log("Şifre en az 8 karakter olmalıdır.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("Bu e-posta adresiyle kullanıcı bulunamadı.");
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log("Şifre başarıyla yenilendi!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

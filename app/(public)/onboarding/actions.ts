"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export async function submitOnboarding(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่" };
  }

  const inGameName = formData.get("inGameName")?.toString();
  const nickname = formData.get("nickname")?.toString();

  if (!inGameName || !nickname) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  try {
    // Check if member already exists
    const existing = await prisma.member.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return { error: "คุณลงทะเบียนไปแล้ว กรุณารอแอดมินอนุมัติ" };
    }

    // Create member
    await prisma.member.create({
      data: {
        userId: session.user.id,
        inGameName,
        nickname,
        role: "MEMBER",
        status: "PENDING", // Wait for admin approval
      },
    });

    // We will redirect to a pending page or back to dashboard
  } catch (error) {
    console.error("Onboarding Error:", error);
    return { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }

  // Next.js requires redirect outside of try-catch block
  redirect("/pending"); 
}

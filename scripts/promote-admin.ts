/**
 * 将用户提升为 Admin 角色
 *
 * 用法:
 *   npx tsx scripts/promote-admin.ts              # 列出所有用户，选择提升
 *   npx tsx scripts/promote-admin.ts <用户ID>      # 直接提升指定用户
 *   npx tsx scripts/promote-admin.ts --nickname 昵称  # 按昵称查找并提升
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 列出所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (users.length === 0) {
      console.log("❌ 数据库中没有用户。请先通过微信登录创建账号。");
      return;
    }

    console.log("\n📋 所有用户:\n");
    console.log(
      "  序号  | 角色   | 昵称               | ID",
    );
    console.log("  ------+--------+--------------------+---------------------------");
    users.forEach((u, i) => {
      const role = u.role === "admin" ? "admin " : "user  ";
      const name = u.nickname.padEnd(18);
      console.log(`  ${String(i + 1).padStart(4)}  | ${role} | ${name} | ${u.id}`);
    });

    console.log(
      "\n💡 用法: npx tsx scripts/promote-admin.ts <用户ID>",
    );
    return;
  }

  // 查找用户
  let userId: string | undefined;

  if (args[0] === "--nickname" && args[1]) {
    const user = await prisma.user.findFirst({
      where: { nickname: args[1] },
    });
    if (!user) {
      console.log(`❌ 未找到昵称为「${args[1]}」的用户`);
      return;
    }
    userId = user.id;
  } else {
    userId = args[0];
  }

  // 提升为 admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.log(`❌ 未找到 ID 为「${userId}」的用户`);
    return;
  }

  if (user.role === "admin") {
    console.log(`ℹ️  用户「${user.nickname}」已经是 Admin`);
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "admin" },
  });

  console.log(`✅ 用户「${user.nickname}」已提升为 Admin`);
  console.log(`   现在可以访问 /admin 管理后台`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { prisma } from "./db.js";

async function main() {
  const count = await prisma.task.count();
  if (count > 0) {
    console.log("Seed skipped: tasks already exist.");
    return;
  }
  await prisma.task.createMany({
    data: [
      { title: "Prepare quarterly report", priority: "high", dueDate: new Date(Date.now() + 2 * 864e5) },
      { title: "Reply to client emails", priority: "medium" },
      { title: "Refactor auth module", priority: "high", dueDate: new Date(Date.now() + 5 * 864e5) },
      { title: "Read a technical article", priority: "low" },
    ],
  });
  console.log("Seeded 4 tasks.");
}

main().finally(() => prisma.$disconnect());

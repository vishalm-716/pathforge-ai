import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up duplicate questions and resources...\n");

  // Find duplicate questions by questionText
  const allQuestions = await prisma.question.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, questionText: true, createdAt: true },
  });

  const seenQuestionTexts = new Map<string, string>();
  const duplicateQuestionIds: string[] = [];

  for (const q of allQuestions) {
    const key = q.questionText.trim().toLowerCase();
    if (seenQuestionTexts.has(key)) {
      // Keep the oldest one, delete the newer duplicate
      duplicateQuestionIds.push(q.id);
    } else {
      seenQuestionTexts.set(key, q.id);
    }
  }

  if (duplicateQuestionIds.length > 0) {
    console.log(`Found ${duplicateQuestionIds.length} duplicate questions. Removing...`);
    await prisma.question.deleteMany({ where: { id: { in: duplicateQuestionIds } } });
    console.log("✅ Duplicate questions removed.");
  } else {
    console.log("✅ No duplicate questions found.");
  }

  // Find duplicate resources by youtubeUrl
  const allResources = await prisma.resource.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, youtubeUrl: true, createdAt: true },
  });

  const seenYoutubeUrls = new Map<string, string>();
  const duplicateResourceIds: string[] = [];

  for (const r of allResources) {
    const key = r.youtubeUrl.trim().toLowerCase();
    if (seenYoutubeUrls.has(key)) {
      duplicateResourceIds.push(r.id);
    } else {
      seenYoutubeUrls.set(key, r.id);
    }
  }

  if (duplicateResourceIds.length > 0) {
    console.log(`Found ${duplicateResourceIds.length} duplicate resources. Removing...`);
    // Need to nullify resourceId in learning_tasks first
    await prisma.learningTask.updateMany({
      where: { resourceId: { in: duplicateResourceIds } },
      data: { resourceId: null },
    });
    await prisma.resource.deleteMany({ where: { id: { in: duplicateResourceIds } } });
    console.log("✅ Duplicate resources removed.");
  } else {
    console.log("✅ No duplicate resources found.");
  }

  console.log("\n✅ Cleanup complete!");
}

main()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

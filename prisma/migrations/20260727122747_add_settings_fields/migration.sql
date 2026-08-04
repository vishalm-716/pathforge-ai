-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "learningGoal" TEXT,
ADD COLUMN     "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyInsights" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyStreaks" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferredDifficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN     "preferredSubjects" TEXT,
ADD COLUMN     "themePreference" TEXT NOT NULL DEFAULT 'dark';

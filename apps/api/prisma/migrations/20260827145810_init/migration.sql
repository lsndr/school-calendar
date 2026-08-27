-- CreateTable
CREATE TABLE "school" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "time_zone" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "school_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "recurrence_type" TEXT NOT NULL,
    "recurrence_days" INTEGER[],
    "recurrence_week1" INTEGER[],
    "recurrence_week2" INTEGER[],
    "time_starts_at" INTEGER NOT NULL,
    "time_duration" INTEGER NOT NULL,
    "group_id" TEXT NOT NULL,
    "required_teachers" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_log" (
    "subject_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recurrence_type" TEXT NOT NULL,
    "recurrence_days" INTEGER[],
    "recurrence_week1" INTEGER[],
    "recurrence_week2" INTEGER[],
    "time_starts_at" INTEGER NOT NULL,
    "time_duration" INTEGER NOT NULL,
    "required_teachers" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL,

    CONSTRAINT "subject_log_pkey" PRIMARY KEY ("subject_id","created_at")
);

-- CreateTable
CREATE TABLE "lesson" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT,
    "date" DATE NOT NULL,
    "school_id" TEXT NOT NULL,
    "time_starts_at" INTEGER NOT NULL,
    "time_duration" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_teacher" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT,
    "teacher_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP NOT NULL,

    CONSTRAINT "lesson_teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "processed_at" TIMESTAMP,

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_subject_id_date_key" ON "lesson"("subject_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_teacher_lesson_id_teacher_id_key" ON "lesson_teacher"("lesson_id", "teacher_id");

-- AddForeignKey
ALTER TABLE "lesson_teacher" ADD CONSTRAINT "lesson_teacher_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

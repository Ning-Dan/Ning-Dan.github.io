import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpenCourseLesson } from "@/components/courses/OpenCoursePages";
import { getOpenCourse, openCourses } from "@/lib/openCourses";

export function generateStaticParams() {
  return openCourses.flatMap((course) => course.chapters.map((chapter) => ({ course: course.slug, chapter: chapter.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string; chapter: string }> }): Promise<Metadata> {
  const { course: courseSlug, chapter: chapterSlug } = await params;
  const course = getOpenCourse(courseSlug);
  const chapter = course?.chapters.find((item) => item.slug === chapterSlug);
  return chapter ? { title: `${chapter.title} · ${course?.shortTitle}`, description: chapter.summary } : {};
}

export default async function OpenCourseChapterPage({ params }: { params: Promise<{ course: string; chapter: string }> }) {
  const { course: courseSlug, chapter: chapterSlug } = await params;
  const course = getOpenCourse(courseSlug);
  const chapter = course?.chapters.find((item) => item.slug === chapterSlug);
  if (!course || !chapter) notFound();
  return <OpenCourseLesson course={course} chapter={chapter} />;
}

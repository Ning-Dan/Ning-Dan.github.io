import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpenCourseLanding } from "@/components/courses/OpenCoursePages";
import { getOpenCourse, openCourses } from "@/lib/openCourses";

export function generateStaticParams() {
  return openCourses.map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const { course: courseSlug } = await params;
  const course = getOpenCourse(courseSlug);
  return course ? { title: course.title, description: course.description } : {};
}

export default async function OpenCoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: courseSlug } = await params;
  const course = getOpenCourse(courseSlug);
  if (!course) notFound();
  return <OpenCourseLanding course={course} />;
}

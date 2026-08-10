import { cs285Course } from "@/lib/openCourses/cs285";
import { cs336Course } from "@/lib/openCourses/cs336";
import { diffusionFlowCourse } from "@/lib/openCourses/diffusionFlow";
import type { OpenCourse } from "@/lib/openCourseTypes";

export const openCourses: OpenCourse[] = [diffusionFlowCourse, cs336Course, cs285Course];

export function getOpenCourse(slug: string) {
  return openCourses.find((course) => course.slug === slug);
}

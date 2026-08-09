import { actionWalkthroughs } from "@/lib/walkthroughs/actions";
import { foundationWalkthroughs } from "@/lib/walkthroughs/foundations";
import { systemWalkthroughs } from "@/lib/walkthroughs/systems";
import { supplementalWalkthroughs } from "@/lib/walkthroughs/supplemental";
import type { LessonWalkthrough } from "@/lib/lessonWalkthroughTypes";

export const lessonWalkthroughs: Record<string, LessonWalkthrough> = {
  ...foundationWalkthroughs,
  ...actionWalkthroughs,
  ...systemWalkthroughs,
  ...supplementalWalkthroughs,
};

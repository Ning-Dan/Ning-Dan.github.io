import { actionWalkthroughs } from "@/lib/walkthroughs/actions";
import { foundationWalkthroughs } from "@/lib/walkthroughs/foundations";
import { systemWalkthroughs } from "@/lib/walkthroughs/systems";
import type { LessonWalkthrough } from "@/lib/lessonWalkthroughTypes";

export const lessonWalkthroughs: Record<string, LessonWalkthrough> = {
  ...foundationWalkthroughs,
  ...actionWalkthroughs,
  ...systemWalkthroughs,
};

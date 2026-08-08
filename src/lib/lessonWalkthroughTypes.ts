export type WalkthroughStep = {
  title: string;
  goal: string;
  actions: string[];
  code?: string;
  expected: string[];
  checkpoint: string;
  troubleshooting: string[];
};

export type LessonWalkthrough = {
  intro: string;
  beforeYouStart: string[];
  steps: WalkthroughStep[];
  finalArtifact: string[];
  verifiedBoundary: string;
  knowledgeCheck: {
    question: string;
    answer: string;
  }[];
};

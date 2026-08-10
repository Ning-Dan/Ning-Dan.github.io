export type OpenCourseSource = {
  title: string;
  url: string;
  kind: "course" | "notes" | "slides" | "video" | "assignment" | "paper" | "code";
  note?: string;
};

export type OpenCourseConcept = {
  name: string;
  explanation: string;
  why: string;
  example: string;
  boundary: string;
};

export type OpenCourseSection = {
  title: string;
  intuition: string;
  paragraphs: string[];
  formula?: {
    latex: string;
    explanation: string;
    symbols: Array<{ symbol: string; meaning: string }>;
  };
  example?: {
    title: string;
    steps: string[];
    result: string;
  };
  figures?: Array<{
    title: string;
    src: string;
    href: string;
    caption: string;
    credit: string;
    kind: "image" | "pdf-page";
    page?: number;
  }>;
  checks?: string[];
};

export type OpenCourseLab = {
  title: string;
  goal: string;
  file?: string;
  steps: string[];
  expected: string[];
  sourceNote: string;
};

export type OpenCourseChapter = {
  slug: string;
  index: number;
  title: string;
  subtitle: string;
  duration: string;
  summary: string;
  objectives: string[];
  prerequisites: string[];
  concepts: OpenCourseConcept[];
  sections: OpenCourseSection[];
  recordings?: Array<{ title: string; youtubeId: string; note: string }>;
  lab?: OpenCourseLab;
  pitfalls: string[];
  exercises: Array<{ question: string; answer: string }>;
  sources: OpenCourseSource[];
};

export type OpenCourse = {
  slug: string;
  title: string;
  shortTitle: string;
  provider: string;
  sourceUrl: string;
  description: string;
  provenance: string;
  licenseNote: string;
  prerequisites: string[];
  outcomes: string[];
  coverage: Array<{ source: string; mappedTo: string; note?: string }>;
  chapters: OpenCourseChapter[];
};

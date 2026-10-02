import resumeJson from '../../resume.json';

export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: {
    city: string;
    countryCode: string;
    region: string;
  };
  profiles: {
    network: string;
    username: string;
    url: string;
  }[];
}

export interface ResumeWork {
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string | null;
  summary: string | null;
  highlights: string[];
}

export interface ResumeEducation {
  institution: string;
  area: string;
}

export interface ResumeCertificate {
  name: string;
  issuer: string;
  url: string;
}

export interface ResumeSkill {
  name: string;
  keywords: string[] | null;
}

export interface ResumeLanguage {
  language: string;
  fluency: string;
}

export interface Resume {
  basics: ResumeBasics;
  work: ResumeWork[];
  education: ResumeEducation[];
  certificates: ResumeCertificate[];
  skills: ResumeSkill[];
  languages: ResumeLanguage[];
}

export const resume: Resume = resumeJson as Resume;

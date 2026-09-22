import type { ResumeData } from "./types";

export const sampleResume: ResumeData = {
  fullName: "Maya Patel",
  jobTitle: "Senior Software Engineer",
  email: "maya.patel@example.com",
  phone: "+1 (415) 555-0142",
  location: "San Francisco, CA",
  linkedin: "https://www.linkedin.com/in/mayapatel",
  summary:
    "Full-stack engineer with 8 years of experience building and scaling web products used by millions. Led the migration of a monolithic checkout system to event-driven services, cutting p95 latency by 60%. Comfortable owning problems end to end, from product discussions to production on-call.",
  experience: [
    {
      id: "exp-1",
      company: "Northwind Commerce",
      role: "Senior Software Engineer",
      startDate: "2021-03",
      endDate: "",
      current: true,
      bullets: [
        "Led a team of 5 engineers rebuilding the checkout flow on Next.js and Go services, lifting conversion by 4.2% across 3M monthly orders.",
        "Designed an event-driven order pipeline on Kafka that reduced p95 latency from 1.8s to 700ms and removed a single point of failure.",
        "Introduced contract testing and a canary release process, cutting production incidents by 45% year over year.",
        "Mentored 3 junior engineers; two were promoted within 18 months.",
      ],
    },
    {
      id: "exp-2",
      company: "Brightline Health",
      role: "Software Engineer",
      startDate: "2018-06",
      endDate: "2021-02",
      current: false,
      bullets: [
        "Built the patient scheduling API (Node.js, PostgreSQL) serving 400+ clinics with 99.95% uptime.",
        "Shipped a React design system adopted by 4 product teams, reducing duplicated UI code by roughly 30%.",
        "Implemented HIPAA-compliant audit logging and access controls that passed two external audits without findings.",
      ],
    },
    {
      id: "exp-3",
      company: "Lumen Labs",
      role: "Junior Developer",
      startDate: "2016-08",
      endDate: "2018-05",
      current: false,
      bullets: [
        "Developed marketing and e-commerce sites for 12 clients using React and headless CMS platforms.",
        "Automated the deployment pipeline with GitHub Actions, reducing release time from hours to minutes.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "B.S. in Computer Science",
      year: "2016",
    },
    {
      id: "edu-2",
      institution: "Coursera / DeepLearning.AI",
      degree: "Machine Learning Specialization",
      year: "2022",
    },
  ],
  skills:
    "TypeScript, React, Next.js, Node.js, Go, PostgreSQL, Kafka, AWS, Docker, Kubernetes, GraphQL, CI/CD, System Design",
};

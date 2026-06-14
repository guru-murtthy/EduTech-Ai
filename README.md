# EduTech-Ai

EduTech AI is an AI-powered personalized learning platform designed to act as a digital mentor for students. Unlike traditional learning platforms that only provide courses and content, EduTech AI continuously analyzes a student's learning behavior, interests, strengths, weaknesses, study habits, and career goals to create a fully customized learning experience.

The platform begins by building a detailed learner profile through surveys and performance analysis. Based on this profile, it generates personalized learning roadmaps, recommends educational resources, provides AI tutoring, creates adaptive quizzes, identifies knowledge gaps, predicts academic performance, and suggests suitable career paths.

By combining artificial intelligence, machine learning, educational analytics, and recommendation systems, EduTech AI helps students learn more efficiently while providing educators and administrators with actionable insights into student progress.

The system aims to support SDG 4: Quality Education by making personalized and intelligent learning accessible to every student regardless of their background or learning style.
System Arhciture
┌───────────────────────────┐
│        Frontend           │
│                           │
│  Student Dashboard        │
│  Admin Dashboard          │
│  AI Tutor Interface       │
│  Analytics Dashboard      │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│       API Gateway         │
└─────────────┬─────────────┘
              │
 ┌────────────┼────────────┐
 │            │            │
 ▼            ▼            ▼

┌─────────┐ ┌─────────┐ ┌─────────┐
│ Profile │ │ Roadmap │ │ Resource│
│ Service │ │ Service │ │ Service │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     ▼           ▼           ▼

┌───────────────────────────┐
│      AI Orchestrator      │
└─────────────┬─────────────┘
              │
 ┌────────────┼────────────┐
 │            │            │
 ▼            ▼            ▼

┌─────────┐ ┌─────────┐ ┌─────────┐
│ Tutor   │ │ Quiz    │ │ Career  │
│ Agent   │ │ Agent   │ │ Agent   │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     ▼           ▼           ▼

┌─────────┐ ┌─────────┐ ┌─────────┐
│ Gap     │ │ Predict │ │ Recomm. │
│ Agent   │ │ Agent   │ │ Agent   │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     └───────────┼───────────┘
                 │
                 ▼

┌───────────────────────────┐
│      PostgreSQL DB        │
│                           │
│ Users                     │
│ Profiles                  │
│ Roadmaps                  │
│ Resources                 │
│ Quiz Results              │
│ Predictions               │
│ Career Suggestions        │
│ Chat History              │
└───────────────────────────┘

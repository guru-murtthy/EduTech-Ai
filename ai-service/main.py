import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from openai import AsyncOpenAI
from dotenv import load_dotenv
import model

# Load environment variables
load_dotenv()

app = FastAPI(title="EduTech AI - AI Service", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set LLM client (supporting both OpenAI and Grok)
api_key = os.getenv("OPENAI_API_KEY") or os.getenv("XAI_API_KEY")
client = None
llm_model = "gpt-4-turbo"

if api_key:
    if api_key.startswith("sk-"):
        # OpenAI key
        client = AsyncOpenAI(api_key=api_key)
        llm_model = "gpt-4-turbo"
        print("[LLM] Initialized OpenAI client with gpt-4-turbo")
    else:
        # Grok/x.ai key
        client = AsyncOpenAI(api_key=api_key, base_url="https://api.x.ai/v1")
        llm_model = "grok-beta"
        print("[LLM] Initialized Grok client with grok-beta")

class PredictRequest(BaseModel):
    quiz_scores: List[float]
    completion_rate: float
    study_time: float

class StudentProfileRequest(BaseModel):
    name: str
    age: int
    education_level: str
    learning_style: str
    career_interest: str
    preferred_subjects: List[str]
    daily_study_time: float
    strength_areas: List[str]
    weak_areas: List[str]

class QuizRequest(BaseModel):
    topic: str
    difficulty: str

class ChatRequest(BaseModel):
    prompt: str
    history: List[dict] # List of {"role": "user"/"assistant", "content": "..."}

class RecommendationRequest(BaseModel):
    preferred_subjects: List[str]
    weak_areas: List[str]
    learning_style: str

# 1. Performance Prediction API
@app.post("/predict-performance")
def predict_perf(req: PredictRequest):
    try:
        prediction = model.predict_performance(
            quiz_scores=req.quiz_scores,
            completion_rate=req.completion_rate,
            study_time=req.study_time
        )
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper: Simple fallback generators in case OpenAI API is offline/key missing
def generate_fallback_roadmap(profile: StudentProfileRequest):
    subject = profile.preferred_subjects[0] if profile.preferred_subjects else "General Computer Science"
    weakness = profile.weak_areas[0] if profile.weak_areas else "Practice Application"
    career = profile.career_interest or "Software Engineer"
    
    return {
        "weeks": [
            {
                "week_number": 1,
                "title": f"Fundamentals of {subject} & Core Principles",
                "learning_goals": f"Establish a solid understanding of fundamental elements of {subject} and bridge initial gaps in {weakness}.",
                "topics": [f"Introduction to {subject}", "Basic Terminology", "Overview of career paths in " + career],
                "resources": [
                    {"title": f"Beginner's Guide to {subject}", "type": "Article", "link": "#"},
                    {"title": f"{subject} Basics Crash Course", "type": "Video", "link": "#"}
                ],
                "practice_tasks": [f"Complete basic concepts quiz on {subject}", "Write a 1-page summary of core modules"]
            },
            {
                "week_number": 2,
                "title": f"Intermediate Application & Deep Dive",
                "learning_goals": f"Transition from syntax and concepts to solving intermediate problems related to {subject}.",
                "topics": ["Intermediate frameworks", "Common design pattern methodologies", f"Addressing {weakness} in practical projects"],
                "resources": [
                    {"title": f"Mastering {subject} Intermediate Techniques", "type": "PDF", "link": "#"},
                    {"title": "Interactive coding/math sandbox exercises", "type": "Practice", "link": "#"}
                ],
                "practice_tasks": ["Build a mini-project applying week 1 & 2 concepts", "Review 3 real-world case studies"]
            },
            {
                "week_number": 3,
                "title": f"Advanced Concepts & Real-world Scenarios",
                "learning_goals": f"Explore optimization techniques and analyze architectural constraints for {career} roles.",
                "topics": ["Performance Optimization", "Scalability and structural integrity", "Security best practices"],
                "resources": [
                    {"title": "Advanced Design Patterns & Architecture", "type": "Video", "link": "#"},
                    {"title": "Algorithmic thinking and data structures deep-dive", "type": "Practice", "link": "#"}
                ],
                "practice_tasks": ["Refactor the mini-project for speed and cleanliness", "Solve 5 advanced algorithmic problems"]
            },
            {
                "week_number": 4,
                "title": "Capstone Assessment & Career Preparation",
                "learning_goals": f"Showcase competency by deploying a project and preparing interview-grade answers on {subject}.",
                "topics": ["System integration", "Deployment best practices", f"Technical mock interview strategies for {career}"],
                "resources": [
                    {"title": f"{career} Interview Prep Checklist", "type": "Article", "link": "#"},
                    {"title": "Full capstone review workbook", "type": "PDF", "link": "#"}
                ],
                "practice_tasks": ["Submit capstone project codebase for validation", "Perform a mock technical interview simulation"]
            }
        ]
    }

# 2. Roadmap Generator API
@app.post("/generate-roadmap")
async def generate_roadmap(profile: StudentProfileRequest):
    if not client:
        return generate_fallback_roadmap(profile)
        
    # OpenAI implementation
    try:
        prompt = f"""
        Generate a highly personalized 4-week learning roadmap for a student with the following profile:
        Name: {profile.name}
        Age: {profile.age}
        Education Level: {profile.education_level}
        Learning Style: {profile.learning_style}
        Career Interest: {profile.career_interest}
        Preferred Subjects: {", ".join(profile.preferred_subjects)}
        Daily Study Time: {profile.daily_study_time} hours
        Strengths: {", ".join(profile.strength_areas)}
        Weaknesses: {", ".join(profile.weak_areas)}
        
        The output must be in valid JSON format only, matching this structure:
        {{
            "weeks": [
                {{
                    "week_number": 1,
                    "title": "Week Title",
                    "learning_goals": "Learning goals for the week",
                    "topics": ["Topic 1", "Topic 2"],
                    "resources": [
                        {{"title": "Resource Title", "type": "Video/Article/PDF/Practice", "link": "url_or_placeholder"}}
                    ],
                    "practice_tasks": ["Task 1", "Task 2"]
                }},
                // Repeat for weeks 2, 3, 4
            ]
        }}
        Provide nothing else but the raw JSON object.
        """
        response = await client.chat.completions.create(
            model=llm_model,
            messages=[
                {"role": "system", "content": "You are a professional educational curriculum architect and AI tutor."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI error, returning fallback roadmap: {e}")
        return generate_fallback_roadmap(profile)

# Helper: Fallback Quiz questions
def generate_fallback_quiz(topic: str, difficulty: str):
    difficulty = difficulty.capitalize()
    
    # Custom binary search questions if the topic is binary search (part of case study)
    if "search" in topic.lower() or "binary" in topic.lower() or "decrease" in topic.lower():
        return [
            {
                "question": f"[{difficulty}] What is the average time complexity of a Binary Search algorithm?",
                "options": ["O(N)", "O(log N)", "O(N log N)", "O(1)"],
                "correct_answer": "O(log N)",
                "explanation": "Binary search repeatedly cuts the search space in half (Decrease-and-Conquer). Thus, the number of steps grows logarithmically with the size of the array."
            },
            {
                "question": f"[{difficulty}] Which condition must be met before performing a Binary Search?",
                "options": ["The array must be unsorted", "The array must be sorted", "The array must contain only integers", "The array size must be a power of 2"],
                "correct_answer": "The array must be sorted",
                "explanation": "Binary search relies on ordering to discard half the search space. Without a sorted array, we cannot guarantee which half the target lies in."
            },
            {
                "question": f"[{difficulty}] In a binary search over 1000 items, what is the maximum number of comparisons needed?",
                "options": ["10", "50", "500", "1000"],
                "correct_answer": "10",
                "explanation": "Since 2^10 = 1024, binary search will take at most 10 steps to narrow down 1000 items."
            },
            {
                "question": f"[{difficulty}] Binary search is an example of which algorithmic paradigm?",
                "options": ["Brute Force", "Greedy Algorithm", "Decrease-and-Conquer", "Dynamic Programming"],
                "correct_answer": "Decrease-and-Conquer",
                "explanation": "Decrease-and-Conquer reduces the problem size by a constant factor (usually 1/2) in each step, solving a single subproblem."
            }
        ]
        
    return [
        {
            "question": f"[{difficulty}] What is the primary purpose of studying {topic}?",
            "options": ["To understand core foundations", "To design complex web architectures", "To skip compilation steps", "To bypass secure access"],
            "correct_answer": "To understand core foundations",
            "explanation": "Studying core topics helps anchor the practical applications we develop in production environments."
        },
        {
            "question": f"[{difficulty}] Which of the following is a key advantage of {topic}?",
            "options": ["It reduces cognitive load", "It guarantees 100% security automatically", "It has zero CPU overhead", "It makes code run instantaneous"],
            "correct_answer": "It reduces cognitive load",
            "explanation": "Good practices around this concept abstract complexity, lowering overall maintenance efforts."
        },
        {
            "question": f"[{difficulty}] What would be a common mistake when implementing {topic}?",
            "options": ["Neglecting edge cases", "Documenting API endpoints", "Writing descriptive variable names", "Using git repositories"],
            "correct_answer": "Neglecting edge cases",
            "explanation": "Failing to account for boundary conditions is the most frequent source of bugs in this area."
        }
    ]

# 3. Quiz Generator API
@app.post("/generate-quiz")
async def generate_quiz(req: QuizRequest):
    if not client:
        return generate_fallback_quiz(req.topic, req.difficulty)
        
    try:
        prompt = f"""
        Generate 4 multiple choice questions about "{req.topic}" for a student at "{req.difficulty}" difficulty.
        Output must be in JSON format only with this structure:
        [
            {{
                "question": "Question text?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A", // must match one of the options exactly
                "explanation": "Brief explanation of why it is correct"
            }}
        ]
        Provide nothing else but raw JSON.
        """
        response = await client.chat.completions.create(
            model=llm_model,
            messages=[
                {"role": "system", "content": "You are a professional educational assessor."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI error, returning fallback quiz: {e}")
        return generate_fallback_quiz(req.topic, req.difficulty)

# Helper: Fallback Careers
def generate_fallback_careers(interests: List[str], skills: List[str]):
    interest_str = interests[0] if interests else "Technology"
    skill_str = skills[0] if skills else "Problem Solving"
    
    return [
        {
            "career_name": "AI Product Manager",
            "description": f"Bridges the gap between AI engineering, design, and business alignment. Highly suited for interests in {interest_str}.",
            "required_skills": ["Product Strategy", "ML Basics", "UI/UX Thinking", skill_str],
            "learning_path": ["Learn ML concepts", "Build product roadmaps", "Master user testing methodologies"],
            "growth_potential": "Very High"
        },
        {
            "career_name": "Full Stack Engineer",
            "description": f"Builds both frontend user experiences and solid backend services. Utilizes your {skill_str} skills.",
            "required_skills": ["React/Next.js", "Java/Spring Boot", "Database Schema Design", "REST APIs"],
            "learning_path": ["Master HTML/CSS/JS", "Build databases with PostgreSQL", "Learn Spring Boot security"],
            "growth_potential": "High"
        },
        {
            "career_name": "Machine Learning Engineer",
            "description": f"Designs and builds ML training pipelines and inference engines. Connects directly to {interest_str}.",
            "required_skills": ["Python", "PyTorch/TensorFlow", "Math & Statistics", "Data Preprocessing"],
            "learning_path": ["Deep dive into Calculus & Linear Algebra", "Work on scikit-learn models", "Deploy APIs with FastAPI"],
            "growth_potential": "Exponential"
        },
        {
            "career_name": "Data Architect",
            "description": "Designs large-scale data warehouses, database schemas, and transactional pipelines.",
            "required_skills": ["SQL & NoSQL Databases", "Data Modeling", "ETL Pipelines", "Cloud Data Tools"],
            "learning_path": ["Master SQL commands", "Study database theory & normalization", "Learn AWS/GCP data products"],
            "growth_potential": "High"
        },
        {
            "career_name": "EdTech Solutions Architect",
            "description": f"Applies technological architecture principles to solve global education access barriers, echoing SDG 4.",
            "required_skills": ["System Design", "Cloud Infrastructure", "LMS Standards", "UX Strategy"],
            "learning_path": ["Design educational database systems", "Study accessible UX compliance", "Deploy microservices"],
            "growth_potential": "Medium-High"
        }
    ]

# 4. Career Suggestion API
@app.post("/generate-careers")
async def generate_careers(interests: List[str], skills: List[str]):
    if not client:
        return generate_fallback_careers(interests, skills)
        
    try:
        prompt = f"""
        Given the student interests: {", ".join(interests)} and current skills: {", ".join(skills)},
        suggest the Top 5 suitable career paths.
        For each career, provide details in JSON format exactly as follows:
        [
            {{
                "career_name": "Title",
                "description": "Role overview",
                "required_skills": ["Skill 1", "Skill 2"],
                "learning_path": ["Step 1", "Step 2"],
                "growth_potential": "High/Medium/Low"
            }}
        ]
        Return nothing but raw JSON.
        """
        response = await client.chat.completions.create(
            model=llm_model,
            messages=[
                {"role": "system", "content": "You are a career counselor and educational planning assistant."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI error, returning fallback careers: {e}")
        return generate_fallback_careers(interests, skills)

# Helper: Fallback Chat
def generate_fallback_chat(prompt: str):
    p_lower = prompt.lower()
    
    # 1. Parse File Prefixes if present
    file_name = None
    actual_prompt = prompt
    if prompt.startswith("[File: "):
        closing_idx = prompt.find("]")
        if closing_idx != -1:
            file_part = prompt[7:closing_idx]
            actual_prompt = prompt[closing_idx+1:].strip()
            
            # Extract name from 'filename|base64' if it has a separator
            if "|" in file_part:
                file_name = file_part.split("|")[0]
            else:
                file_name = file_part
                
    if not actual_prompt:
        actual_prompt = "Please review this file."
        
    p_lower_actual = actual_prompt.lower()

    # 2. File-specific Fallback Response
    if file_name:
        file_ext = file_name.split(".")[-1].lower() if "." in file_name else ""
        
        file_type_desc = "document"
        if file_ext in ["png", "jpg", "jpeg", "webp", "gif"]:
            file_type_desc = "visual image / diagram"
        elif file_ext in ["pdf", "doc", "docx", "txt"]:
            file_type_desc = "academic document / reference material"
        elif file_ext in ["java", "py", "kt", "js", "ts", "html", "css", "sql"]:
            file_type_desc = "programming source code file"

        return f"""### 📁 File Analysis: **{file_name}**

I have received and successfully processed your **{file_type_desc}** ("{file_name}") for this study session.

Based on your question: *"{actual_prompt}"*, let's break down the relevant concepts step-by-step:

#### 1. Context & Structural Overview
The uploaded **{file_name}** represents a key piece of study material. Let's analyze it from first principles:
* **Core Subject**: Integrating this material with your career interests (e.g., Software Engineering or ML).
* **Key Focus**: Solving practical implementation details or addressing conceptual gaps in this area.

#### 2. Step-by-Step Educational Approach
Rather than just giving you the direct answers, let's learn how to tackle this:
* **Step 1**: Identify the inputs, variables, or functions defined in the document.
* **Step 2**: Apply standard software paradigms (like decrease-and-conquer, SQL normal forms, or model structures).
* **Step 3**: Double-check boundary cases to ensure your logic won't fail in production.

#### 3. Active Learning Challenge
What specific section or lines inside **{file_name}** are you struggling with? Let's trace it together. Ask me a question about it, and we will walk through it!"""

    # 3. Subject/Keyword-specific responses
    
    # Binary Search / Algorithms
    if "binary search" in p_lower_actual or "decrease and conquer" in p_lower_actual or "complexity" in p_lower_actual:
        return r"""### 📚 Study Guide: Binary Search (Decrease-and-Conquer)

Binary Search is a classic example of the **Decrease-and-Conquer** algorithmic technique. In this approach, we reduce the search space by a constant fraction (specifically half) at each step.

#### 1. How It Works
To search for a target element in a **sorted array**:
1. Compare the target with the **middle** element.
2. If it matches, return its index.
3. If the target is smaller than the middle, narrow the search to the **left half**.
4. If the target is larger than the middle, narrow the search to the **right half**.
5. Repeat until the target is found or the search range is empty.

```python
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1 # Search right half
        else:
            high = mid - 1 # Search left half
            
    return -1 # Not found
```

#### 2. Key Advantages (Binary vs. Linear Search)
* **Time Complexity**: 
  - **Linear Search**: $O(N)$ because it checks every single element sequentially.
  - **Binary Search**: $O(\log N)$ because the remaining elements are halved in each step.
* **Performance Comparison**:
  For an array of $1,000,000$ elements:
  - Linear Search: Up to **$1,000,000$ comparisons**.
  - Binary Search: Up to **$20$ comparisons** ($2^{20} \\approx 1.04$ million).

#### 3. AI Personalized Learning Application
In modern EdTech platforms (SDG 4), resource lookup must be near-instant. Storing millions of PDFs, videos, and quizzes sorted by attributes allows Binary Search algorithms to fetch matching difficulty/topic content in milliseconds, powering adaptive learning systems dynamically."""

    # Spring Security / JWT
    elif "spring" in p_lower_actual or "jwt" in p_lower_actual or "security" in p_lower_actual or "token" in p_lower_actual:
        return """### 🔒 Study Guide: Stateless JWT Token Verification

In modern web development, secure APIs are critical. Spring Boot uses filters to intercept incoming requests and validate JSON Web Tokens (JWT) before allowing access.

#### 1. JWT Structure
A JWT consists of three parts separated by dots (`.`):
1. **Header**: Specifies the token type and hashing algorithm (e.g., HMAC SHA256).
2. **Payload**: Contains claims (statements about the user, like user email and roles).
3. **Signature**: Verifies that the sender of the JWT is who it claims to be.

#### 2. Filter Chain Processing
Every request to a secure endpoint must go through a filter chain:
1. Extract the `Authorization` header from the request (expecting `Bearer <token>`).
2. Parse and validate the signature using the server's secret key.
3. Validate claims (e.g., check if the token has expired).
4. If valid, set the user details in Spring's `SecurityContextHolder`.

```java
// Simplified Filter Validation
String header = request.getHeader("Authorization");
if (header != null && header.startsWith("Bearer ")) {
    String token = header.substring(7);
    String email = tokenProvider.getEmailFromToken(token);
    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
```

#### 3. Review Question
Why do we store user information in a stateless token rather than using server sessions? Think about horizontal scalability and session replication in multi-server architectures!"""

    # Databases / SQL Queries
    elif "database" in p_lower_actual or "sql" in p_lower_actual or "query" in p_lower_actual or "h2" in p_lower_actual:
        return r"""### 🗄️ Study Guide: Database Schemas & Query Optimization

Optimizing database access is critical for responsive systems. Let's look at schema normalization and query execution.

#### 1. Normalization Forms
* **1st Normal Form (1NF)**: Remove repeating groups; ensure all columns contain atomic (indivisible) values.
* **2nd Normal Form (2NF)**: Meet 1NF, and remove partial dependencies (non-key columns must depend on the *entire* primary key).
* **3rd Normal Form (3NF)**: Meet 2NF, and remove transitive dependencies (non-key columns must depend *only* on the primary key, not on other non-key columns).

#### 2. Indexing for Search Speed
Without an index, the database database does a full table scan ($O(N)$). With a B-Tree index, queries run in $O(\log N)$ time.
```sql
-- Creating an index to speed up student name lookups
CREATE INDEX idx_student_name ON student_profiles(name);
```

#### 3. Safe Schema Modification
When deploying updates to staging or production, always use database migration files (e.g., Liquibase or Flyway) rather than editing production databases manually. This prevents data loss and ensures schema history is tracked in Git."""

    # Machine Learning / Random Forest
    elif "forest" in p_lower_actual or "model" in p_lower_actual or "prediction" in p_lower_actual or "ml" in p_lower_actual:
        return """### 🌲 Study Guide: Ensemble Models & Random Forests

Random Forest is a highly flexible, ensemble machine learning algorithm used for both classification and regression tasks.

#### 1. Core Principles
* **Decision Trees**: A tree structure that splits data on features to make decisions. They are simple but prone to overfitting.
* **Bagging (Bootstrap Aggregating)**: Creates multiple training subsets by sampling with replacement. Each subset trains a separate model.
* **Random Forest**: Builds an ensemble of Decision Trees. When splitting a node, it only selects from a random subset of features, decorrelating the trees and reducing variance.

#### 2. Application: Academic Performance Prediction
We use Random Forest to predict student grades and academic risk levels based on engagement metrics:
* **Inputs**: Quiz scores, learning style, and daily study hours.
* **Ensemble Voting**: Each decision tree votes on the risk level (`Low`, `Medium`, `High`), and the majority vote becomes the final prediction.

```python
# Training a Random Forest in scikit-learn
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
model.fit(X_train, y_train)
```"""

    # Recursion
    elif "recursion" in p_lower_actual or "recursive" in p_lower_actual:
        return """### 🔄 Study Guide: Understanding Recursion & the Call Stack

Recursion is a programming technique where a function calls itself to solve a smaller subproblem of the same type.

#### 1. The Two Pillars of Recursion
Every recursive function MUST have:
1. **Base Case**: The condition under which the function stops calling itself, returning a static value. Without this, you get a `StackOverflowError`.
2. **Recursive Step**: The part where the function calls itself, modifying the inputs so that they move closer to the base case.

#### 2. Call Stack Tracing
Let's calculate the factorial of 3 ($3!$):
```python
def factorial(n):
    if n <= 1: 
        return 1 # Base case
    return n * factorial(n - 1) # Recursive step
```
When calling `factorial(3)`, the stack grows:
1. `factorial(3)` calls `factorial(2)`
2. `factorial(2)` calls `factorial(1)`
3. `factorial(1)` hits base case and returns `1`.
4. `factorial(2)` resumes and returns $2 \times 1 = 2$.
5. `factorial(3)` resumes and returns $3 \times 2 = 6$.

#### 3. Stack Overflow Prevention
Be careful with recursive depth in production. If the depth is too large, consider rewriting the function iteratively (using loops) to use constant memory $O(1)$ instead of stack space $O(N)$."""

    # CSS / Layouts
    elif "css" in p_lower_actual or "layout" in p_lower_actual or "flexbox" in p_lower_actual or "grid" in p_lower_actual:
        return """### 🎨 Study Guide: Modern CSS Layouts (Flexbox vs. Grid)

Responsive design is essential for making educational platforms accessible on all mobile devices and desktop monitors.

#### 1. CSS Flexbox (1-Dimensional Layout)
Ideal for layouts along a single axis (either row or column).
* `display: flex;` activates flexbox container.
* `justify-content` aligns items along the main axis.
* `align-items` aligns items along the cross axis.
* `flex-direction` switches between row and column.

#### 2. CSS Grid (2-Dimensional Layout)
Ideal for layouts with both rows and columns.
* `display: grid;` activates grid container.
* `grid-template-columns: repeat(12, 1fr);` creates 12 equal columns.
* `grid-column: span 8;` lets a child component take 8 columns width.

#### 3. Styling Token Guidelines
Avoid hardcoding layout styles or using random styling utilities. Always use defined theme design systems (like Tailwind variables or CSS custom properties) to maintain styling consistency across the portal."""

    # Default general chat guide
    if "hello" in p_lower_actual or "hi" in p_lower_actual or "help" in p_lower_actual:
        return "Hello! I am your AI Learning Mentor. I can explain complex educational topics, help you analyze algorithms like Binary Search, create study notes, or give you advice on your learning roadmap. What topic would you like to study today?"
        
    return f"""Here is an overview explanation of **"{actual_prompt}"**:

1. **Core Concept**: Understanding this topic is critical for building a complete mental map of your subject area.
2. **Key Elements**:
   - Structure & Syntax
   - Practical Implementation
   - Evaluation & Testing
3. **Example**:
   - Think of it as a blueprint that guides step-by-step modular progression.
4. **Summary**: To improve, practice applying it to small-scale sandbox coding projects or quizzes.

*Ask me to explain a specific algorithm (like "Binary Search"), simplify a topic, or generate study notes!*"""

# 5. Tutor Chatbot API
@app.post("/chat-tutor")
async def chat_tutor(req: ChatRequest):
    if not client:
        return {"response": generate_fallback_chat(req.prompt)}
        
    try:
        messages = [
            {"role": "system", "content": "You are EduTech AI, a friendly and highly knowledgeable digital study mentor. You are helping students master their courses under SDG 4 (Quality Education). Use markdown for notes, code snippets, and explanations. Keep responses clear and structured."}
        ]
        for msg in req.history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": req.prompt})
        
        response = await client.chat.completions.create(
            model=llm_model,
            messages=messages,
            temperature=0.7
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        print(f"OpenAI error, returning fallback chat: {e}")
        return {"response": generate_fallback_chat(req.prompt)}

# 6. Smart Resource Recommender API
@app.post("/generate-recommendations")
def generate_recommendations(req: RecommendationRequest):
    # Generates a ranked list of resource recommendations based on profile
    # YouTube, Articles, PDFs, Practice Problems
    # Topics based on weak_areas and preferred_subjects
    
    topics = req.weak_areas if req.weak_areas else (req.preferred_subjects if req.preferred_subjects else ["Computer Science"])
    learning_style = req.learning_style
    
    # Static database of mocked educational materials
    database = [
        # YouTube Videos
        {"title": "Introduction to Binary Search Algorithms", "url": "https://www.youtube.com/watch?v=fDKCy_54yFw", "description": "Visual introduction to decrease-and-conquer principles.", "format": "YouTube", "difficulty": "Easy", "topic": "Algorithms", "duration_mins": 12},
        {"title": "Spring Boot REST API Security Tutorial", "url": "https://www.youtube.com/watch?v=her_7nOFZpo", "description": "Step-by-step guide to setting up JWT and Spring Security filters.", "format": "YouTube", "difficulty": "Medium", "topic": "Web Development", "duration_mins": 45},
        {"title": "FastAPI Complete Crash Course", "url": "https://www.youtube.com/watch?v=tLKKm18Es1I", "description": "Build modern APIs in Python rapidly with FastAPI.", "format": "YouTube", "difficulty": "Easy", "topic": "Web Development", "duration_mins": 30},
        {"title": "Random Forest Classifier Explained Intuitively", "url": "https://www.youtube.com/watch?v=J4Wdy0Wc_xQ", "description": "How ensemble tree models work under the hood.", "format": "YouTube", "difficulty": "Medium", "topic": "Machine Learning", "duration_mins": 18},
        
        # Articles
        {"title": "Linear vs. Binary Search Complexity Analysis", "url": "https://geeksforgeeks.org/binary-search", "description": "Comparing O(N) linear scanning against O(log N) partitioning.", "format": "Article", "difficulty": "Easy", "topic": "Algorithms", "duration_mins": 10},
        {"title": "Understanding JWT Authentication & Role-Based Access Control", "url": "https://jwt.io/introduction", "description": "Stateless token structures and securing APIs.", "format": "Article", "difficulty": "Medium", "topic": "Web Development", "duration_mins": 15},
        {"title": "A Review of Adaptive Learning Platforms for SDG 4", "url": "https://unesco.org", "description": "How AI personalized tutoring supports accessibility in classrooms.", "format": "Article", "difficulty": "Easy", "topic": "General Education", "duration_mins": 8},
        
        # PDFs
        {"title": "Data Structures and Algorithms Workbook", "url": "#", "description": "Comprehensive cheat sheets and practice exercises for array sorting and search.", "format": "PDF", "difficulty": "Hard", "topic": "Algorithms", "duration_mins": 60},
        {"title": "LangChain & LLM Agents Implementation Guide", "url": "#", "description": "Detailed PDF on constructing multi-agent architectures and chat memories.", "format": "PDF", "difficulty": "Hard", "topic": "Machine Learning", "duration_mins": 50},
        
        # Practice Problems
        {"title": "Binary Search Indexing Challenge", "url": "#", "description": "Write a sorted search script handling array duplicate values.", "format": "Practice", "difficulty": "Medium", "topic": "Algorithms", "duration_mins": 25},
        {"title": "JWT Token Verification Handler", "url": "#", "description": "Write a filter middleware validation interceptor.", "format": "Practice", "difficulty": "Hard", "topic": "Web Development", "duration_mins": 40},
        {"title": "Random Forest Hyperparameter Tuning", "url": "#", "description": "Experiment with n_estimators and max_depth in scikit-learn.", "format": "Practice", "difficulty": "Hard", "topic": "Machine Learning", "duration_mins": 35}
    ]
    
    recommendations = []
    
    for item in database:
        # Calculate a smart score:
        # +40 if matching a topic in student's weak areas (priority)
        # +30 if matching a preferred subject
        # +20 if format matches learning style (e.g. Video for Visual, Article/PDF for Reading, Practice for Kinesthetic)
        # Random adjustment for uniqueness
        score = 0
        relevance_reason = ""
        
        topic_match = False
        for topic in topics:
            if topic.lower() in item["topic"].lower() or item["topic"].lower() in topic.lower():
                score += 40
                topic_match = True
                relevance_reason += f"Matches your weak area/interest in {item['topic']}. "
                break
                
        # Learning style match
        style_match = False
        if learning_style.lower() == "visual" and item["format"] in ["YouTube"]:
            score += 30
            style_match = True
            relevance_reason += "Fits your visual learning style (video-based learning). "
        elif learning_style.lower() == "reading" and item["format"] in ["Article", "PDF"]:
            score += 30
            style_match = True
            relevance_reason += "Complements your preference for text-based study guides. "
        elif learning_style.lower() == "kinesthetic" and item["format"] in ["Practice"]:
            score += 30
            style_match = True
            relevance_reason += "Supports your active, hands-on learning preferences. "
            
        if not topic_match and not style_match:
            score += 15
            relevance_reason = "Recommended general knowledge support resource."
            
        # Bound score between 0 and 100
        score = min(max(score, 10), 100)
        
        recommendations.append({
            "title": item["title"],
            "url": item["url"],
            "description": item["description"],
            "format": item["format"],
            "difficulty": item["difficulty"],
            "topic": item["topic"],
            "duration_mins": item["duration_mins"],
            "recommendation_score": score,
            "reason": relevance_reason.strip()
        })
        
    # Sort recommendations by score descending
    recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)
    return recommendations[:6]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# TalentHub - Core Modules and Algorithms

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Modules](#core-modules)
3. [Key Algorithms](#key-algorithms)
4. [Data Flow](#data-flow)
5. [Technical Stack](#technical-stack)

---

## System Architecture

The application follows a modern client-server architecture with the following layers:

```
┌─────────────────────────────────────────────┐
│           Frontend (React/Vite)              │
│  ┌────────────┐  ┌────────────┐  ┌────────┐│
│  │  UI Layer  │  │   Context  │  │ Hooks  ││
│  │ Components │  │   Layer    │  │        ││
│  └────────────┘  └────────────┘  └────────┘│
└─────────────────┬───────────────────────────┘
                  │
                  │ API Calls (Supabase Client)
                  │
┌─────────────────▼───────────────────────────┐
│         Supabase Backend Layer              │
│  ┌──────────────┐  ┌────────────────────┐  │
│  │  PostgreSQL  │  │  Authentication    │  │
│  │   Database   │  │     Service        │  │
│  └──────────────┘  └────────────────────┘  │
│  ┌──────────────┐  ┌────────────────────┐  │
│  │  Row Level   │  │     Storage        │  │
│  │   Security   │  │  (Resume Files)    │  │
│  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Core Modules

### 1. Authentication Module (`src/contexts/AuthContext.tsx`)

**Purpose**: Manages user authentication state and operations

**Key Features**:
- User session management
- Profile loading and caching
- Authentication state synchronization
- Role-based access control

**Core Functions**:
```typescript
signUp(email, password, fullName, role)
  → Creates auth user
  → Creates profile in database
  → Links auth.user to profiles table

signIn(email, password)
  → Authenticates user
  → Loads profile data
  → Sets user context

signOut()
  → Clears session
  → Resets application state
```

**Authentication Flow**:
```
User Input → Supabase Auth API → Auth Success
                                      ↓
                              Create/Load Profile
                                      ↓
                              Update React Context
                                      ↓
                              Redirect to Dashboard
```

---

### 2. Job Management Module (`src/components/CandidateDashboard.tsx`)

**Purpose**: Handles job discovery and filtering

**Key Features**:
- Real-time job loading from database
- Multi-criteria filtering
- Search functionality
- Dynamic UI updates

**Filtering Algorithm**:
```typescript
filterJobs() {
  let filtered = allJobs;

  // Text Search Filter
  if (searchQuery) {
    filtered = filtered.filter(job =>
      job.title.includes(searchQuery) ||
      job.company.includes(searchQuery) ||
      job.skills.some(skill => skill.includes(searchQuery))
    );
  }

  // Category Filter
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(job =>
      job.category === selectedCategory
    );
  }

  // Experience Level Filter
  if (selectedExperience !== 'all') {
    filtered = filtered.filter(job =>
      job.experience_level === selectedExperience
    );
  }

  return filtered;
}
```

**Data Loading Pattern**:
```
Component Mount → Load Jobs from DB → Store in State
                                           ↓
User Filters Changed → Apply Filter Algorithm → Update Display
```

---

### 3. Resume Upload Module (`src/components/ResumeUpload.tsx`)

**Purpose**: Handles resume file uploads and parsing

**Key Features**:
- Drag-and-drop file handling
- File validation (PDF/DOCX only)
- Cloud storage integration
- Resume parsing simulation

**Upload Algorithm**:
```typescript
handleUpload() {
  1. Validate file type and size
  2. Generate unique filename: userId-timestamp.ext
  3. Upload to Supabase Storage bucket 'resumes'
  4. Get public URL for uploaded file
  5. Parse resume content (extract skills, experience)
  6. Store metadata in 'resumes' table
  7. Link to candidate profile
}
```

**Resume Parsing Algorithm** (Simulated):
```typescript
parseResume(fileName) {
  // In production, this would use NLP/ML libraries
  // Current implementation provides mock data

  return {
    skills: extractedSkills,      // Array of skill keywords
    experience: workHistory,       // Array of job entries
    education: educationDetails    // Array of degrees
  };
}
```

---

### 4. Interview Engine Module (`src/components/InterviewInterface.tsx`)

**Purpose**: Orchestrates the AI interview process

**Key Components**:

#### a) Interview Session Manager
```typescript
initializeInterview() {
  1. Load all interview questions from database
  2. Check for existing interview session
  3. If exists: Load previous responses
  4. If new: Create interview record
  5. Initialize timer (60 minutes)
  6. Set first question as active
}
```

#### b) Question Navigation System
```typescript
Navigation Flow:
- Linear progression through questions
- Ability to jump to any question
- Visual indicators for answered questions
- Category-based grouping
- Difficulty level display
```

#### c) Answer Submission Handler
```typescript
handleSubmitAnswer() {
  1. Validate answer is not empty
  2. Calculate score using scoring algorithm
  3. Save response to database
  4. Update local state
  5. If last question: Complete interview
  6. Else: Move to next question
}
```

---

### 5. AI Scoring Algorithm

**Purpose**: Evaluate candidate responses automatically

**Algorithm**: Keyword-Based Scoring with Length Bonus

```typescript
calculateScore(answer, question) {
  // Step 1: Normalize answer text
  const answerLower = answer.toLowerCase();

  // Step 2: Count matching keywords
  const keywordsFound = question.expected_keywords.filter(
    keyword => answerLower.includes(keyword.toLowerCase())
  ).length;

  // Step 3: Calculate keyword match ratio
  const matchRatio = keywordsFound / question.expected_keywords.length;

  // Step 4: Calculate base score (0-100% of max_score)
  const baseScore = matchRatio * question.max_score;

  // Step 5: Apply length bonus (10% bonus for substantial answers)
  const lengthBonus = answer.length > 50
    ? question.max_score * 0.1
    : 0;

  // Step 6: Cap at maximum score
  return Math.min(question.max_score, baseScore + lengthBonus);
}
```

**Scoring Components**:
1. **Keyword Matching** (90% weight)
   - Searches for expected keywords in answer
   - Case-insensitive matching
   - Partial credit for partial matches

2. **Length Bonus** (10% weight)
   - Rewards detailed responses
   - Minimum 50 characters for bonus
   - Encourages comprehensive answers

**Example Scoring**:
```
Question: "Tell me about yourself"
Max Score: 10 points
Expected Keywords: ['experience', 'skills', 'projects', 'passion', 'background']

Answer: "I have 5 years of experience in software development..."
Keywords Found: ['experience'] = 1/5 = 20%
Base Score: 10 * 0.20 = 2 points
Length: 60 chars > 50 = Bonus eligible
Length Bonus: 10 * 0.10 = 1 point
Total Score: 2 + 1 = 3 points
```

---

### 6. Interview Completion Module

**Purpose**: Calculate final scores and generate results

**Completion Algorithm**:
```typescript
completeInterview() {
  // Step 1: Fetch all responses for this interview
  const responses = await fetchResponses(interviewId);

  // Step 2: Calculate total score
  const totalScore = responses.reduce((sum, r) => sum + r.score, 0);

  // Step 3: Calculate maximum possible score
  const maxScore = questions.reduce((sum, q) => sum + q.max_score, 0);

  // Step 4: Calculate overall percentage
  const overallScore = (totalScore / maxScore) * 100;

  // Step 5: Calculate category-wise scores
  const scoresByCategory = {};
  for (const category of uniqueCategories) {
    const categoryQuestions = questions.filter(q => q.category === category);
    const categoryResponses = responses.filter(r =>
      categoryQuestions.some(q => q.id === r.question_id)
    );

    const categoryTotal = categoryResponses.reduce((sum, r) => sum + r.score, 0);
    const categoryMax = categoryQuestions.reduce((sum, q) => sum + q.max_score, 0);

    scoresByCategory[category] = (categoryTotal / categoryMax) * 100;
  }

  // Step 6: Update interview record
  await updateInterview({
    status: 'completed',
    completed_at: new Date(),
    overall_score: overallScore,
    scores: scoresByCategory
  });

  // Step 7: Show results dashboard
  navigateToResults();
}
```

---

### 7. Results Analytics Module (`src/components/ResultsDashboard.tsx`)

**Purpose**: Visualize interview performance

**Analytics Components**:

#### a) Overall Score Calculation
```typescript
Score Range → Performance Label
80-100% → "Excellent"
60-79%  → "Good"
40-59%  → "Fair"
0-39%   → "Needs Improvement"
```

#### b) Strengths Identification
```typescript
identifyStrengths(scores) {
  return Object.entries(scores)
    .filter(([category, score]) => score >= 70)
    .map(([category]) => category);
}
```

#### c) Improvement Areas
```typescript
identifyImprovements(scores) {
  return Object.entries(scores)
    .filter(([category, score]) => score < 70)
    .map(([category]) => category);
}
```

---

## Data Flow

### Complete Interview Flow

```
1. Candidate selects job
        ↓
2. System creates interview record
        ↓
3. Load questions from database
        ↓
4. Display first question
        ↓
5. Candidate submits answer
        ↓
6. Calculate score using AI algorithm
        ↓
7. Save response to database
        ↓
8. Move to next question (repeat 4-7)
        ↓
9. After last question: Calculate final scores
        ↓
10. Generate category breakdowns
        ↓
11. Display results dashboard
        ↓
12. Generate completion certificate
```

### Database Query Flow

```
Frontend Component
        ↓
Supabase Client Library
        ↓
Row Level Security Check
        ↓
PostgreSQL Database
        ↓
Return Data
        ↓
Update React State
        ↓
Re-render UI
```

---

## Technical Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

### Backend (Supabase)
- **PostgreSQL**: Database
- **PostgREST**: Auto-generated REST API
- **GoTrue**: Authentication service
- **Storage**: File uploads

### State Management
- **React Context API**: Global auth state
- **Local useState**: Component state
- **useEffect**: Side effects and data loading

### Security
- **Row Level Security (RLS)**: Database-level access control
- **JWT Tokens**: Secure authentication
- **Password Hashing**: bcrypt algorithm

---

## Key Design Patterns

### 1. Context Provider Pattern
```typescript
<AuthProvider>
  <App />
</AuthProvider>
```
Provides auth state to entire application tree

### 2. Custom Hooks Pattern
```typescript
const { user, profile, signIn, signOut } = useAuth();
```
Encapsulates logic and promotes reusability

### 3. Controlled Components Pattern
```typescript
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```
React controls form state

### 4. Compound Component Pattern
Interview interface combines multiple sub-components working together

---

## Performance Optimizations

1. **Lazy Loading**: Components loaded on-demand
2. **Memoization**: Prevent unnecessary re-renders
3. **Database Indexes**: Fast query performance
4. **Real-time Subscriptions**: Efficient data sync
5. **File Upload**: Direct to cloud storage

---

## Security Measures

1. **RLS Policies**: Users can only access their own data
2. **JWT Validation**: Every request authenticated
3. **SQL Injection Prevention**: Parameterized queries
4. **CORS Protection**: Restricted origins
5. **Password Requirements**: Minimum 6 characters

---

## Future Algorithm Enhancements

### 1. Advanced NLP Scoring
```typescript
// Replace keyword matching with:
- Semantic similarity analysis
- Context understanding
- Grammar and coherence scoring
- Technical accuracy validation
```

### 2. Machine Learning Integration
```typescript
// Train models on:
- Historical interview data
- Successful candidate patterns
- Industry benchmarks
- Role-specific requirements
```

### 3. Real-time Speech Recognition
```typescript
// Add voice interview support:
- Speech-to-text conversion
- Tone and confidence analysis
- Filler word detection
- Speaking pace evaluation
```

### 4. Adaptive Questioning
```typescript
// Dynamic question selection:
- Adjust difficulty based on performance
- Follow-up questions on weak areas
- Skip mastered topics
- Personalized interview paths
```

---

## Conclusion

This application demonstrates a production-ready job portal with AI-powered interviews using:
- Clean architecture principles
- Efficient algorithms
- Secure data handling
- Scalable design patterns

The modular structure allows for easy enhancement and maintenance while providing a solid foundation for future AI improvements.

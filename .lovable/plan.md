

## Plan: Enhance Intern Training Modules + BlackBox Voice-Only

### Current Issues
1. **Intern Dashboard training modules** exist but are shallow — clicking "Start" just marks a module complete instantly. There's no actual training content (descriptions, learning objectives, quiz questions). The PRD specifies a 7-day timeline with assessments.
2. **BlackBox** already uses voice-only (`webcamEnabled: false`) in both desktop and mobile. However, the `VideoCallModal` component still supports `mode="video"` and the `MeetingControls` component still shows a webcam toggle button. Per the PRD, BlackBox should be strictly audio-only.

### Changes

#### 1. Intern Training — Add Real Module Content (2 files)
**Files**: `src/components/intern/InternDashboardContent.tsx`, `src/components/mobile/MobileInternDashboard.tsx`

- Expand each of the 7 training modules with:
  - **Learning objectives** (2-3 bullet points per module)
  - **Content sections** with descriptive text explaining the topic
  - **Assessment quizzes** for Day 1, Day 3, and Day 6 modules (multiple-choice questions the intern must answer correctly to proceed)
  - **Day 7**: Show "Interview Pending" state with info that an expert will conduct the live evaluation
- Add a module detail view — clicking "Start" opens an expanded view within the training tab showing the module content, and a "Complete Module" button at the bottom
- For assessment modules (Day 1, 3, 6): show quiz questions that must be answered before marking complete
- Lock progression: can only start the next module after completing the previous one (already implemented)
- Match PRD training status enum: `NOT_STARTED` → `IN_PROGRESS` → `ASSESSMENT_PENDING` → `INTERVIEW_PENDING` → `ACTIVE`

#### 2. BlackBox — Enforce Voice-Only (3 files)
**Files**: `src/components/videosdk/MeetingControls.tsx`, `src/components/videosdk/VideoCallModal.tsx`, `src/components/videosdk/ParticipantView.tsx`

- **MeetingControls.tsx**: Add an `audioOnly` prop. When true, hide the webcam toggle button entirely. Pass this from BlackBox usage.
- **MeetingView.tsx**: Accept and forward the `audioOnly` prop to `MeetingControls`.
- **VideoCallModal.tsx**: When `mode="audio"`, pass `audioOnly={true}` to MeetingView so webcam toggle is hidden.
- **ParticipantView.tsx**: When in audio-only mode, never render the VideoPlayer — always show the avatar circle. Hide the video on/off indicator.

#### 3. Wire audioOnly through the component tree (1 file)
**File**: `src/components/videosdk/MeetingView.tsx`

- Accept `audioOnly?: boolean` prop, forward to `MeetingControls` and `ParticipantView`.

### Technical Details

**Training Module Content Structure**:
```typescript
const TRAINING_MODULES = [
  {
    day: 1,
    title: "Intro Module + Assessment",
    description: "...",
    duration: "45 min",
    objectives: ["Understand Eternia's mission", "Learn platform navigation", "Complete intro assessment"],
    content: "Detailed module content...",
    hasQuiz: true,
    quizQuestions: [
      { question: "...", options: ["A", "B", "C", "D"], correctIndex: 2 }
    ]
  },
  // ... remaining modules
];
```

**Audio-only prop flow**:
```
VideoCallModal (mode="audio") 
  → MeetingProvider (webcamEnabled: false)
    → MeetingView (audioOnly={true})
      → ParticipantView (audioOnly={true}) — no video player
      → MeetingControls (audioOnly={true}) — no webcam button
```

### Files to Change (6 files)
1. `src/components/intern/InternDashboardContent.tsx` — Add module content, quizzes, expanded view
2. `src/components/mobile/MobileInternDashboard.tsx` — Same module content for mobile
3. `src/components/videosdk/MeetingControls.tsx` — Add `audioOnly` prop, hide webcam button
4. `src/components/videosdk/MeetingView.tsx` — Forward `audioOnly` prop
5. `src/components/videosdk/ParticipantView.tsx` — Add `audioOnly` prop, skip video rendering
6. `src/components/videosdk/VideoCallModal.tsx` — Pass `audioOnly` when mode is audio


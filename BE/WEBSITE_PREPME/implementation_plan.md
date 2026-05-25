# Database Design and Entity Setup Plan (Updated)

This plan details the design of the database entities and relevant enums to support the core learning tracking, vocabulary progress, and payment system of the website (Prepme).

---

## User Review Required

> [!IMPORTANT]
> - **Exclusion of Community and Visa Q&A**: As requested, the Community components (`CommunityPostEntity`, `CommunityCommentEntity`) and Visa Q&A components (`VisaQuestionEntity`, `VisaPracticeEntity`) are excluded from this setup.
> - **Lombok and JPA annotations**: Entities inherit from `BaseEntity` to reuse ID generation and audit timestamps.
> - **JSON fields for answers**: Practice answers and AI detailed breakdowns will be stored as `TEXT` to keep database portability.

---

## Proposed Changes

### Enums & Model Entities

We will add the necessary enums and entities to capture the target structure of the application.

#### [NEW] [MembershipType.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/enums/MembershipType.java)
Defines subscription access levels.
- `FREE`
- `PREMIUM`

#### [NEW] [SkillType.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/enums/SkillType.java)
Defines core IELTS skills.
- `LISTENING`
- `READING`
- `WRITING`
- `SPEAKING`

#### [NEW] [VocabularyTopic.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/enums/VocabularyTopic.java)
Defines vocabulary classification categories.
- `EDUCATION`
- `TECHNOLOGY`
- `BUSINESS`
- `ENVIRONMENT`
- `STUDY_ABROAD`
- `VISA_INTERVIEW`

#### [NEW] [VocabularyStatus.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/enums/VocabularyStatus.java)
Defines flashcard learning states.
- `NOT_LEARNED`
- `LEARNING`
- `LEARNED`

#### [NEW] [PracticeStatus.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/enums/PracticeStatus.java)
Defines the draft state of an IELTS test submission.
- `DRAFT`
- `COMPLETED`

#### [NEW] [PaymentStatus.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/enums/PaymentStatus.java)
Defines transaction outcomes.
- `PENDING`
- `COMPLETED`
- `FAILED`
- `REFUNDED`

#### [MODIFY] [UserEntity.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/model/entity/UserEntity.java)
Modify `UserEntity` to include profile target goals, level assessments, readiness, and subscription metadata:
- `ieltsTarget` (Double)
- `countryTarget` (String)
- `schoolTarget` (String)
- `major` (String)
- `currentLevel` (Double)
- `weakestSkill` (SkillType, Enum)
- `readiness` (Double) - percentage value (e.g. 65.0 representing 65%)
- `studyHoursPerDay` (Double)
- `membershipType` (MembershipType, Enum) - FREE or PREMIUM
- `subscriptionExpiresAt` (LocalDateTime)

#### [NEW] [PracticeHistoryEntity.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/model/entity/PracticeHistoryEntity.java)
Stores history of test-taking, scores, and AI evaluations:
- `user` (ManyToOne -> UserEntity)
- `skillType` (SkillType, Enum)
- `testTitle` (String) - e.g. "Cambridge 18 Academic Test 1"
- `score` (Double) - computed score or estimated band
- `completionTime` (Integer) - completion duration in seconds
- `answers` (TEXT) - JSON content capturing user answers
- `submissionContent` (TEXT) - text for writing submission or speaking transcriptions
- `recordingUrl` (String) - URL to speaking audio files
- `aiAnalysis` (TEXT) - JSON content storing AI feedback, corrections, and recommendations
- `status` (PracticeStatus, Enum)

#### [NEW] [VocabularyWordEntity.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/model/entity/VocabularyWordEntity.java)
Stores individual flashcards/dictionary data:
- `word` (String, unique)
- `meaning` (TEXT)
- `pronunciation` (String)
- `exampleSentence` (TEXT)
- `topic` (VocabularyTopic, Enum)

#### [NEW] [VocabularyProgressEntity.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/model/entity/VocabularyProgressEntity.java)
Tracks each user's specific progress with vocabulary terms:
- `user` (ManyToOne -> UserEntity)
- `word` (ManyToOne -> VocabularyWordEntity)
- `status` (VocabularyStatus, Enum)
- `attemptsCount` (Integer)
- `correctAttempts` (Integer)

#### [NEW] [PaymentTransactionEntity.java](file:///d:/prepme/project-website_prepme/BE/WEBSITE_PREPME/src/main/java/com/fpt/website_prepme/model/entity/PaymentTransactionEntity.java)
Tracks subscriptions and billing for premium features:
- `user` (ManyToOne -> UserEntity)
- `amount` (BigDecimal)
- `currency` (String) - default "VND" / "USD"
- `paymentProvider` (String) - e.g. "STRIPE", "VNPAY", "MOMO"
- `transactionReference` (String, unique) - External gateway reference ID
- `status` (PaymentStatus, Enum)
- `description` (String)

---

## Verification Plan

### Automated Tests
- Run compilation check:
  ```bash
  ./gradlew compileJava
  ```

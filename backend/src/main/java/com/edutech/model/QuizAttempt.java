package com.edutech.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    private String topic;

    private String difficulty;

    private double score;

    @Column(name = "total_questions")
    private int totalQuestions;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        completedAt = LocalDateTime.now();
    }

    public QuizAttempt() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public static class Builder {
        private StudentProfile studentProfile;
        private String topic;
        private String difficulty;
        private double score;
        private int totalQuestions;

        public Builder studentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; return this; }
        public Builder topic(String topic) { this.topic = topic; return this; }
        public Builder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public Builder score(double score) { this.score = score; return this; }
        public Builder totalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; return this; }

        public QuizAttempt build() {
            QuizAttempt qa = new QuizAttempt();
            qa.setStudentProfile(studentProfile);
            qa.setTopic(topic);
            qa.setDifficulty(difficulty);
            qa.setScore(score);
            qa.setTotalQuestions(totalQuestions);
            return qa;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

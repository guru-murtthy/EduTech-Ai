package com.edutech.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "knowledge_gaps")
public class KnowledgeGap {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Column(name = "weak_topic")
    private String weakTopic;

    @Column(name = "weak_skill")
    private String weakSkill;

    @Column(name = "improvement_plan", columnDefinition = "TEXT")
    private String improvementPlan;

    @Column(name = "suggested_resources", columnDefinition = "TEXT")
    private String suggestedResources;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public KnowledgeGap() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public String getWeakTopic() { return weakTopic; }
    public void setWeakTopic(String weakTopic) { this.weakTopic = weakTopic; }

    public String getWeakSkill() { return weakSkill; }
    public void setWeakSkill(String weakSkill) { this.weakSkill = weakSkill; }

    public String getImprovementPlan() { return improvementPlan; }
    public void setImprovementPlan(String improvementPlan) { this.improvementPlan = improvementPlan; }

    public String getSuggestedResources() { return suggestedResources; }
    public void setSuggestedResources(String suggestedResources) { this.suggestedResources = suggestedResources; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class Builder {
        private StudentProfile studentProfile;
        private String weakTopic;
        private String weakSkill;
        private String improvementPlan;
        private String suggestedResources;

        public Builder studentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; return this; }
        public Builder weakTopic(String weakTopic) { this.weakTopic = weakTopic; return this; }
        public Builder weakSkill(String weakSkill) { this.weakSkill = weakSkill; return this; }
        public Builder improvementPlan(String improvementPlan) { this.improvementPlan = improvementPlan; return this; }
        public Builder suggestedResources(String suggestedResources) { this.suggestedResources = suggestedResources; return this; }

        public KnowledgeGap build() {
            KnowledgeGap kg = new KnowledgeGap();
            kg.setStudentProfile(studentProfile);
            kg.setWeakTopic(weakTopic);
            kg.setWeakSkill(weakSkill);
            kg.setImprovementPlan(improvementPlan);
            kg.setSuggestedResources(suggestedResources);
            return kg;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

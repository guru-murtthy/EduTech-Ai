package com.edutech.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "career_recommendations")
public class CareerRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Column(name = "careers_json", columnDefinition = "TEXT")
    private String careersJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public CareerRecommendation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public String getCareersJson() { return careersJson; }
    public void setCareersJson(String careersJson) { this.careersJson = careersJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class Builder {
        private StudentProfile studentProfile;
        private String careersJson;

        public Builder studentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; return this; }
        public Builder careersJson(String careersJson) { this.careersJson = careersJson; return this; }

        public CareerRecommendation build() {
            CareerRecommendation cr = new CareerRecommendation();
            cr.setStudentProfile(studentProfile);
            cr.setCareersJson(careersJson);
            return cr;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

package com.edutech.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "performance_predictions")
public class PerformancePrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Column(name = "predicted_grade")
    private String predictedGrade;

    @Column(name = "success_probability")
    private double successProbability;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public PerformancePrediction() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public String getPredictedGrade() { return predictedGrade; }
    public void setPredictedGrade(String predictedGrade) { this.predictedGrade = predictedGrade; }

    public double getSuccessProbability() { return successProbability; }
    public void setSuccessProbability(double successProbability) { this.successProbability = successProbability; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class Builder {
        private StudentProfile studentProfile;
        private String predictedGrade;
        private double successProbability;
        private String riskLevel;

        public Builder studentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; return this; }
        public Builder predictedGrade(String predictedGrade) { this.predictedGrade = predictedGrade; return this; }
        public Builder successProbability(double successProbability) { this.successProbability = successProbability; return this; }
        public Builder riskLevel(String riskLevel) { this.riskLevel = riskLevel; return this; }

        public PerformancePrediction build() {
            PerformancePrediction pp = new PerformancePrediction();
            pp.setStudentProfile(studentProfile);
            pp.setPredictedGrade(predictedGrade);
            pp.setSuccessProbability(successProbability);
            pp.setRiskLevel(riskLevel);
            return pp;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

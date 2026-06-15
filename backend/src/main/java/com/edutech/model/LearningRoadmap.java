package com.edutech.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "learning_roadmaps")
public class LearningRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Column(name = "roadmap_data", columnDefinition = "TEXT")
    private String roadmapData;

    public LearningRoadmap() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public String getRoadmapData() { return roadmapData; }
    public void setRoadmapData(String roadmapData) { this.roadmapData = roadmapData; }

    public static class Builder {
        private StudentProfile studentProfile;
        private String roadmapData;

        public Builder studentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; return this; }
        public Builder roadmapData(String roadmapData) { this.roadmapData = roadmapData; return this; }

        public LearningRoadmap build() {
            LearningRoadmap lr = new LearningRoadmap();
            lr.setStudentProfile(studentProfile);
            lr.setRoadmapData(roadmapData);
            return lr;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

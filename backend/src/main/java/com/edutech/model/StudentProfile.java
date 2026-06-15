package com.edutech.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private int age;

    @Column(name = "education_level")
    private String educationLevel;

    @Column(name = "learning_style")
    private String learningStyle;

    @Column(name = "career_interest")
    private String careerInterest;

    @Column(name = "preferred_subjects", columnDefinition = "TEXT")
    private String preferredSubjects;

    @Column(name = "daily_study_time")
    private double dailyStudyTime;

    @Column(name = "strength_areas", columnDefinition = "TEXT")
    private String strengthAreas;

    @Column(name = "weak_areas", columnDefinition = "TEXT")
    private String weakAreas;

    public StudentProfile() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getEducationLevel() { return educationLevel; }
    public void setEducationLevel(String educationLevel) { this.educationLevel = educationLevel; }

    public String getLearningStyle() { return learningStyle; }
    public void setLearningStyle(String learningStyle) { this.learningStyle = learningStyle; }

    public String getCareerInterest() { return careerInterest; }
    public void setCareerInterest(String careerInterest) { this.careerInterest = careerInterest; }

    public String getPreferredSubjects() { return preferredSubjects; }
    public void setPreferredSubjects(String preferredSubjects) { this.preferredSubjects = preferredSubjects; }

    public double getDailyStudyTime() { return dailyStudyTime; }
    public void setDailyStudyTime(double dailyStudyTime) { this.dailyStudyTime = dailyStudyTime; }

    public String getStrengthAreas() { return strengthAreas; }
    public void setStrengthAreas(String strengthAreas) { this.strengthAreas = strengthAreas; }

    public String getWeakAreas() { return weakAreas; }
    public void setWeakAreas(String weakAreas) { this.weakAreas = weakAreas; }

    public static class Builder {
        private User user;
        private String name;
        private int age;
        private String educationLevel;
        private String learningStyle;
        private String careerInterest;
        private String preferredSubjects;
        private double dailyStudyTime;
        private String strengthAreas;
        private String weakAreas;

        public Builder user(User user) { this.user = user; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder age(int age) { this.age = age; return this; }
        public Builder educationLevel(String educationLevel) { this.educationLevel = educationLevel; return this; }
        public Builder learningStyle(String learningStyle) { this.learningStyle = learningStyle; return this; }
        public Builder careerInterest(String careerInterest) { this.careerInterest = careerInterest; return this; }
        public Builder preferredSubjects(String preferredSubjects) { this.preferredSubjects = preferredSubjects; return this; }
        public Builder dailyStudyTime(double dailyStudyTime) { this.dailyStudyTime = dailyStudyTime; return this; }
        public Builder strengthAreas(String strengthAreas) { this.strengthAreas = strengthAreas; return this; }
        public Builder weakAreas(String weakAreas) { this.weakAreas = weakAreas; return this; }

        public StudentProfile build() {
            StudentProfile sp = new StudentProfile();
            sp.setUser(user);
            sp.setName(name);
            sp.setAge(age);
            sp.setEducationLevel(educationLevel);
            sp.setLearningStyle(learningStyle);
            sp.setCareerInterest(careerInterest);
            sp.setPreferredSubjects(preferredSubjects);
            sp.setDailyStudyTime(dailyStudyTime);
            sp.setStrengthAreas(strengthAreas);
            sp.setWeakAreas(weakAreas);
            return sp;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

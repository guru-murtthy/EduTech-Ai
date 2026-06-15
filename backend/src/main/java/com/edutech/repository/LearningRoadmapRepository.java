package com.edutech.repository;

import com.edutech.model.LearningRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, UUID> {
    Optional<LearningRoadmap> findByStudentProfileId(UUID studentProfileId);
}

package com.edutech.repository;

import com.edutech.model.PerformancePrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PerformancePredictionRepository extends JpaRepository<PerformancePrediction, UUID> {
    List<PerformancePrediction> findByStudentProfileIdOrderByCreatedAtDesc(UUID studentProfileId);
}

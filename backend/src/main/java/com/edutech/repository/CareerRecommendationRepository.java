package com.edutech.repository;

import com.edutech.model.CareerRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerRecommendationRepository extends JpaRepository<CareerRecommendation, UUID> {
    Optional<CareerRecommendation> findByStudentProfileId(UUID studentProfileId);
}

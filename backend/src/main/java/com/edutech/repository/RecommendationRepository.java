package com.edutech.repository;

import com.edutech.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, UUID> {
    List<Recommendation> findByStudentProfileId(UUID studentProfileId);
    void deleteByStudentProfileId(UUID studentProfileId);
}

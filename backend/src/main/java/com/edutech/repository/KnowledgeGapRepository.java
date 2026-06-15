package com.edutech.repository;

import com.edutech.model.KnowledgeGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface KnowledgeGapRepository extends JpaRepository<KnowledgeGap, UUID> {
    List<KnowledgeGap> findByStudentProfileId(UUID studentProfileId);
}

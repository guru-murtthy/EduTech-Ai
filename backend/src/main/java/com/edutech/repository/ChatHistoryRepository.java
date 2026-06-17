package com.edutech.repository;

import com.edutech.model.ChatHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, UUID> {
    List<ChatHistory> findByStudentProfileIdOrderByCreatedAtAsc(UUID studentProfileId);

    @Query("SELECT c FROM ChatHistory c WHERE c.studentProfile.id = :studentProfileId ORDER BY c.createdAt DESC")
    List<ChatHistory> findRecentMessages(UUID studentProfileId, Pageable pageable);

    void deleteByStudentProfileId(UUID studentProfileId);
}

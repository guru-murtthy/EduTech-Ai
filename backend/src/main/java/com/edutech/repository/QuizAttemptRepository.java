package com.edutech.repository;

import com.edutech.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findByStudentProfileIdOrderByCompletedAtDesc(UUID studentProfileId);
    
    @Query("SELECT AVG(q.score) FROM QuizAttempt q")
    Double getAverageScore();
    
    @Query("SELECT COUNT(q) FROM QuizAttempt q")
    long countTotalAttempts();
}

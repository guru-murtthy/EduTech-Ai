package com.edutech.repository;

import com.edutech.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {
    List<QuizQuestion> findByTopicAndDifficulty(String topic, String difficulty);
    List<QuizQuestion> findByTopic(String topic);
}

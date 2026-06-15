package com.edutech.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String topic;

    private String difficulty;

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson;

    @Column(name = "correct_answer")
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    public QuizQuestion() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getOptionsJson() { return optionsJson; }
    public void setOptionsJson(String optionsJson) { this.optionsJson = optionsJson; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public static class Builder {
        private String topic;
        private String difficulty;
        private String questionText;
        private String optionsJson;
        private String correctAnswer;
        private String explanation;

        public Builder topic(String topic) { this.topic = topic; return this; }
        public Builder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public Builder questionText(String questionText) { this.questionText = questionText; return this; }
        public Builder optionsJson(String optionsJson) { this.optionsJson = optionsJson; return this; }
        public Builder correctAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; return this; }
        public Builder explanation(String explanation) { this.explanation = explanation; return this; }

        public QuizQuestion build() {
            QuizQuestion qq = new QuizQuestion();
            qq.setTopic(topic);
            qq.setDifficulty(difficulty);
            qq.setQuestionText(questionText);
            qq.setOptionsJson(optionsJson);
            qq.setCorrectAnswer(correctAnswer);
            qq.setExplanation(explanation);
            return qq;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

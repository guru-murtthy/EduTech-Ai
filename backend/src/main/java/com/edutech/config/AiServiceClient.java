package com.edutech.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${app.ai.service-url}")
    private String aiServiceUrl;

    public String predictPerformance(Map<String, Object> requestBody) {
        String url = aiServiceUrl + "/predict-performance";
        return postRequest(url, requestBody);
    }

    public String generateRoadmap(Map<String, Object> requestBody) {
        String url = aiServiceUrl + "/generate-roadmap";
        return postRequest(url, requestBody);
    }

    public String generateQuiz(Map<String, Object> requestBody) {
        String url = aiServiceUrl + "/generate-quiz";
        return postRequest(url, requestBody);
    }

    public String generateCareers(Map<String, Object> requestBody) {
        String url = aiServiceUrl + "/generate-careers";
        return postRequest(url, requestBody);
    }

    public String chatTutor(Map<String, Object> requestBody) {
        String url = aiServiceUrl + "/chat-tutor";
        return postRequest(url, requestBody);
    }

    public String generateRecommendations(Map<String, Object> requestBody) {
        String url = aiServiceUrl + "/generate-recommendations";
        return postRequest(url, requestBody);
    }

    private String postRequest(String url, Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            return restTemplate.postForObject(url, entity, String.class);
        } catch (Exception e) {
            System.err.println("Error calling AI service at " + url + ": " + e.getMessage());
            // Safe fallback response mock
            return getFallbackResponseForUrl(url, requestBody);
        }
    }

    private String getFallbackResponseForUrl(String url, Map<String, Object> requestBody) {
        // Safe mocks in case Python FastAPI is down
        if (url.contains("/predict-performance")) {
            return "{\"predicted_grade\":\"B\",\"success_probability\":78.5,\"risk_level\":\"Low\"}";
        } else if (url.contains("/generate-roadmap")) {
            return "{\"weeks\":[{\"week_number\":1,\"title\":\"Fundamentals & Core Principles\",\"learning_goals\":\"Understand basics\",\"topics\":[\"Intro\"],\"resources\":[{\"title\":\"Guide\",\"type\":\"Article\",\"link\":\"#\"}],\"practice_tasks\":[\"Task 1\"]}]}";
        } else if (url.contains("/generate-quiz")) {
            return "[{\"question\":\"What is the time complexity of Binary Search?\",\"options\":[\"O(N)\",\"O(log N)\",\"O(N^2)\",\"O(1)\"],\"correct_answer\":\"O(log N)\",\"explanation\":\"Binary Search uses decrease-and-conquer.\"}]";
        } else if (url.contains("/generate-careers")) {
            return "[{\"career_name\":\"Full Stack Engineer\",\"description\":\"Builds applications\",\"required_skills\":[\"React\"],\"learning_path\":[\"Code\"],\"growth_potential\":\"High\"}]";
        } else if (url.contains("/chat-tutor")) {
            return "{\"response\":\"I am here to help you learn! Let me know what you want to study.\"}";
        }
        return "{}";
    }
}

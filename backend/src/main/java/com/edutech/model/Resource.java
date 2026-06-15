package com.edutech.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String url;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String format;

    private String difficulty;

    private String topic;

    @Column(name = "duration_mins")
    private int durationMins;

    public Resource() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public int getDurationMins() { return durationMins; }
    public void setDurationMins(int durationMins) { this.durationMins = durationMins; }

    public static class Builder {
        private String title;
        private String url;
        private String description;
        private String format;
        private String difficulty;
        private String topic;
        private int durationMins;

        public Builder title(String title) { this.title = title; return this; }
        public Builder url(String url) { this.url = url; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder format(String format) { this.format = format; return this; }
        public Builder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public Builder topic(String topic) { this.topic = topic; return this; }
        public Builder durationMins(int durationMins) { this.durationMins = durationMins; return this; }

        public Resource build() {
            Resource r = new Resource();
            r.setTitle(title);
            r.setUrl(url);
            r.setDescription(description);
            r.setFormat(format);
            r.setDifficulty(difficulty);
            r.setTopic(topic);
            r.setDurationMins(durationMins);
            return r;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

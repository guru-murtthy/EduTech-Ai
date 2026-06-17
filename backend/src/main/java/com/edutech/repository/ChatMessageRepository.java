package com.edutech.repository;

import com.edutech.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.senderEmail = :email1 AND m.receiverEmail = :email2) OR " +
           "(m.senderEmail = :email2 AND m.receiverEmail = :email1) " +
           "ORDER BY m.createdAt ASC")
    List<ChatMessage> findChatHistory(@Param("email1") String email1, @Param("email2") String email2);

    @Query("SELECT DISTINCT m.senderEmail FROM ChatMessage m WHERE m.receiverEmail = :adminEmail")
    List<String> findContactsForAdmin(@Param("adminEmail") String adminEmail);
}

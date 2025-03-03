package com.example.MessengerApp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.MessengerApp.model.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Recherche les messages entre deux utilisateurs par leur ID
    List<Message> findBySenderIdAndReceiverId(String senderId, String receiverId);

}

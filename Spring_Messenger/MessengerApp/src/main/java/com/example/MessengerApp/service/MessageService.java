package com.example.MessengerApp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.MessengerApp.model.Message;
import com.example.MessengerApp.model.User;
import com.example.MessengerApp.repository.MessageRepository;
@Service
public class MessageService {
@Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserService userService;



// Sauvegarde un message dans la base de données
public Message saveMessage(Message message) {
    // Récupère l'utilisateur par l'ID de l'expéditeur
    User sender = userService.getUserById(message.getSenderId());
    
    if (sender != null) {
        // Ajoute le nom de l'expéditeur si disponible, sinon l'email
        message.setSenderName(sender.getName() != null ? sender.getName() : sender.getEmail());
        // Ajoute l'email de l'expéditeur au message
        message.setSenderEmail(sender.getEmail());
    }
    
    // Sauvegarde du message avec les informations complètes
    return messageRepository.save(message);
}

// Récupère l'historique des messages entre deux utilisateurs
public List<Message> getMessages(String senderId, String receiverId) {
    return messageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
}

 
    
}

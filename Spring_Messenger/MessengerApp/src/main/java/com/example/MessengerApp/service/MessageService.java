package com.example.MessengerApp.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.MessengerApp.model.Message;
import com.example.MessengerApp.model.User;
import com.example.MessengerApp.repository.MessageRepository;
@Service
public class MessageService {
@Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserService userService;


/*// Sauvegarde un message dans la base de données
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
 */


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

    // Sauvegarde du message avec les informations complètes (y compris l'audio si disponible)
    return messageRepository.save(message);
}


// Récupère l'historique des messages entre deux utilisateurs
public List<Message> getMessages(String senderId, String receiverId) {
    return messageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
}
public String saveAudio(MultipartFile file) throws IOException {
    if (file.isEmpty() || !file.getContentType().startsWith("audio")) {
        throw new IllegalArgumentException("Le fichier n'est pas un fichier audio valide.");
    }

    // Générer un nom de fichier unique
    String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

    // Définir le chemin où le fichier sera sauvegardé
    Path uploadPath = Paths.get("uploads/audio/");
    if (!Files.exists(uploadPath)) {
        Files.createDirectories(uploadPath);
    }

    try (InputStream inputStream = file.getInputStream()) {
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        return "http://localhost:8080/uploads/audio/" + fileName;
    } catch (IOException e) {
        throw new IOException("Erreur lors de l'enregistrement du fichier audio : " + e.getMessage(), e);
    }
}



}
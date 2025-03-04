package com.example.MessengerApp.controller;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.MessengerApp.service.UserService;
import com.example.MessengerApp.config.WebSocketConfig;
import com.example.MessengerApp.model.AudioUrl;
import com.example.MessengerApp.model.Message;
import com.example.MessengerApp.repository.MessageRepository;
import com.example.MessengerApp.service.MessageService;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:4200") // Autoriser les requêtes depuis localhost:4200

public class ChatController {
    @Autowired private MessageService messageService;
    @Autowired private UserService userService;
        private final MessageRepository messageRepository;

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);
    public ChatController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }
 @Autowired
    private SimpMessagingTemplate messagingTemplate;
  @MessageMapping("/sendMessage")
    public void sendMessage(Message message) {
        // Enregistrer le message dans la base de données
        Message savedMessage = messageService.saveMessage(message);

        // Diffuser le message à tous les abonnés du sujet /topic/messages
        messagingTemplate.convertAndSend("/topic/messages", savedMessage);
    }



        
    
@GetMapping("/ws/chat/info")
public ResponseEntity<String> getChatInfo(@RequestParam String email) {
    try {
        // Traitement de la demande et retour de la réponse
        return ResponseEntity.ok("Info chat");
    } catch (Exception e) {
        // Log l'exception et renvoie un message d'erreur
        logger.error("Erreur lors du traitement de la requête", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Une erreur s'est produite. Veuillez réessayer plus tard.");
    }
}
     
    
      @GetMapping("/history/{senderId}/{receiverId}")
    public List<Message> getChatHistory(@PathVariable String senderId, @PathVariable String receiverId) {
        return messageService.getMessages(senderId, receiverId);
    }
    
// Endpoint pour envoyer un message avec audio
@PostMapping("/sendMessageWithAudio")
public ResponseEntity<Message> sendMessageWithAudio(@RequestParam("senderId") String senderId,
                                                     @RequestParam("receiverId") String receiverId,
                                                     @RequestParam("content") String content,
                                                     @RequestParam("audio") MultipartFile audioFile) throws IOException {
    String audioUrl = uploadAudio(audioFile);  // Handle the audio file upload

    AudioUrl audioUrlObj = new AudioUrl();
    audioUrlObj.setChangingThisBreaksApplicationSecurity(audioUrl);  // Set URL in the AudioUrl object

    Message message = new Message();
    message.setSenderId(senderId);
    message.setReceiverId(receiverId);
    message.setContent(content);
    message.setAudioUrl(audioUrlObj);  // Set the AudioUrl object

    messageRepository.save(message);

    return ResponseEntity.ok(message);
}

    // Méthode pour gérer l'upload de l'audio
    private String uploadAudio(MultipartFile audioFile) throws IOException {
        // Logic to save the file and return the file URL
        Path filePath = Paths.get("audio_files", audioFile.getOriginalFilename());
        Files.copy(audioFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return filePath.toString();  // Vous pouvez adapter cette méthode pour retourner l'URL accessible publiquement
    }
}

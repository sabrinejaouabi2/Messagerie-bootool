package com.example.MessengerApp.service;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.MessengerApp.config.JwtUtil;
import com.example.MessengerApp.model.User;
import com.example.MessengerApp.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service

public class UserService {
        private final UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    private Set<String> connectedUsers = new HashSet<>();
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

        
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
 // Ajouter un utilisateur à la liste des connectés
    public void addConnectedUser(String email) {
        logger.info("User added to connected users: " + email);

        connectedUsers.add(email);
    }

    // Retirer un utilisateur de la liste des connectés
    public void removeConnectedUser(String email) {
        connectedUsers.remove(email);
        logger.info("User removed from connected users: " + email);

    }

    // Retourne la liste des utilisateurs connectés
    public List<String> getConnectedUsers() {
        return new ArrayList<>(connectedUsers);
    }
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    public boolean isUserConnected(Long id) {
        // Si le Set contient l'email et non l'ID, vous devez d'abord récupérer l'email de l'utilisateur.
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return connectedUsers.contains(user.get().getEmail());  // Vérifier si l'email est dans le Set
        }
        return false;
    }
    
    
 // Récupérer un utilisateur par son email
 public User getCurrentUser(String email) {
    Optional<User> user = userRepository.findByEmail(email);
    return user.orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
}

// Méthode pour récupérer l'utilisateur par son ID
public User getUserById(String userId) {
    // Convert String userId to Long before calling findById
    try {
        Long id = Long.parseLong(userId);
        return userRepository.findById(id).orElse(null);
    } catch (NumberFormatException e) {
        // Handle the case where the string can't be parsed to a Long
        return null;  // or throw an exception if required
    }
}



    
}

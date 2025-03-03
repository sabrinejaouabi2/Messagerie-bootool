package com.example.MessengerApp.controller;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.MessengerApp.model.User;
import com.example.MessengerApp.service.UserService;
@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:4200") // Autoriser les requêtes depuis localhost:4200

public class UserController {
 @Autowired
    private UserService userService;

@GetMapping
public List<User> getAllUsers() {
    return userService.getAllUsers();
}
 // Récupérer l'utilisateur actuel par son email
@GetMapping("/currentUser/{email}")
public ResponseEntity<?> getCurrentUser(@PathVariable String email) {
    try {
        User user = userService.getCurrentUser(email);
        return ResponseEntity.ok(user);
    } catch (RuntimeException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
    }
}

@GetMapping("/user/{userId}")
public User getUser(@PathVariable String userId) {
    return userService.getUserById(userId);  // Passer un String, converti en Long dans le service
}

}
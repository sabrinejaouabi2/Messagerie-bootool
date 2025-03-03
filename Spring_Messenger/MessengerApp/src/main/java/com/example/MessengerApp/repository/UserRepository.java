package com.example.MessengerApp.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.MessengerApp.model.User;


public interface UserRepository extends JpaRepository<User, Long>{
    // Recherche un utilisateur par son email
    //User findByEmail(String email);
    Optional<User> findByEmail(String email);

    Optional<User>findByName(String name); // Recherche par nom (name)
// Récupérer l'utilisateur par son ID


}

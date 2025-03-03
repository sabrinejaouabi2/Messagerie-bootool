package com.example.MessengerApp.config;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component

public class JwtUtil {
   // Generate a secure secret key of at least 256 bits for HS256
   private SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

   public String generateToken(String email) {
       return Jwts.builder()
               .setSubject(email)
               .setIssuedAt(new Date())
               .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
               .signWith(secretKey)  // Use the generated secret key
               .compact();
   }

   /*ublic String extractUsername(String token) {
       return Jwts.parserBuilder()  // Use parserBuilder (new in jjwt 0.11.0)
               .setSigningKey(secretKey)  // Set the secure secret key
               .build()
               .parseClaimsJws(token)
               .getBody()
               .getSubject();
   }
*/
// Extraire 'name' au lieu de 'email'
public String extractName(String token) {
    return Jwts.parserBuilder()  // Utilisez parserBuilder (nouveau dans jjwt 0.11.0)
            .setSigningKey(secretKey)  // Définir la clé secrète
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();  
}

// Cela retourne le 'name' que nous avons défini comme 'subject'
/* public boolean validateToken(String token, UserDetails userDetails) {
       return extractUsername(token).equals(userDetails.getUsername());
   } */
  // Valider le token
  public boolean validateToken(String token, UserDetails userDetails) {
    return extractName(token).equals(userDetails.getUsername());  // Utilisez 'name' au lieu de 'username'
}


}
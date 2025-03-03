package com.example.MessengerApp.config;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.MessengerApp.service.UserService;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

     @Autowired
    private UserService userService;
   
   

    public class HttpSessionIdHandshakeInterceptor implements HandshakeInterceptor {

        
        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
            String uri = request.getURI().toString();
            String email = UriComponentsBuilder.fromUriString(uri).build().getQueryParams().getFirst("email");
            
            if (email == null || email.isEmpty()) {
                logger.error("No email parameter in WebSocket request.");
                return false;  // Reject the handshake if the email is missing
            }
            logger.info("User connected: " + email);
            userService.addConnectedUser(email);
            return true;
        }
    
        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception ex) {
            String uri = request.getURI().toString();
            String email = UriComponentsBuilder.fromUriString(uri).build().getQueryParams().getFirst("email");
            
            if (email != null) {
                logger.info("User disconnected: " + email);  // Log l'utilisateur déconnecté
                userService.removeConnectedUser(email);
            }
        }
    }
     // CORS configuration for WebSocket connections
     @Override
     public void registerStompEndpoints(StompEndpointRegistry registry) {
         registry.addEndpoint("/ws/chat")
                 .setAllowedOrigins("http://localhost:4200")  // Permet uniquement les connexions de ce domaine
                 .withSockJS();
     }
 
     @Override
     public void configureMessageBroker(MessageBrokerRegistry config) {
         config.enableSimpleBroker("/topic");
         config.setApplicationDestinationPrefixes("/app");
     }
     
 }
 
 


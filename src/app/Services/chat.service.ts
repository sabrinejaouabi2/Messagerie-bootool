import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { IMessage } from '../models/IMessage';
import { Client, IMessage as StompMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private stompClient!: Client;
  private messageSubject: Subject<IMessage> = new Subject<IMessage>();
  private apiUrl = 'http://localhost:8080/chat'; // Base URL de l'API Spring Boot
  private socketUrl = 'http://localhost:8080/ws/chat'; // WebSocket server URL
  private connectionAttempts: number = 0;

  constructor(private http: HttpClient) {
    this.initializeWebSocketConnection();
  }

  // Initialiser la connexion WebSocket
  private initializeWebSocketConnection() {
    const socket = new SockJS(this.socketUrl);

    this.stompClient = new Client({
      webSocketFactory: () => socket, // Utilisation de SockJS comme webSocketFactory
      connectHeaders: {},
      debug: (str) => console.log(str), // Log STOMP messages (optionnel)
      onConnect: (frame) => {
        console.log('Connected to WebSocket:', frame);
        this.connectionAttempts = 0; // Réinitialiser les tentatives de connexion
        this.stompClient.subscribe('/topic/messages', (message: StompMessage) => {
          this.onMessageReceived(message.body); // Traiter les messages reçus
        });
      },
      onWebSocketError: (error) => {
        console.error('WebSocket connection failed:', error);
        if (this.connectionAttempts < 3) {
          setTimeout(() => {
            this.connectionAttempts++;
            this.initializeWebSocketConnection(); // Tentative de reconnexion
          }, 2000); // Réessayer après 2 secondes
        }
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      }
    });

    this.stompClient.activate();
  }

  // Traiter les messages reçus
  private onMessageReceived(message: any) {
    try {
      const parsedMessage: IMessage = JSON.parse(message); // Analyse du message reçu
      this.messageSubject.next(parsedMessage); // Émettre le message analysé
    } catch (error) {
      console.error('Failed to parse message:', error); // Gérer les erreurs de parsing
    }
  }

  // Envoi de message
  sendMessage(message: IMessage) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/sendMessage',
        body: JSON.stringify(message),
      });
    } else {
      console.warn('WebSocket client is not connect-ed'); // Avertir si la connexion WebSocket échoue
    }
  }

  // Récupérer les messages sous forme d'observable
  getMessages(): Observable<IMessage> {
    return this.messageSubject.asObservable();
  }


  // Méthode pour récupérer l'historique des messages entre deux utilisateurs
  getChatHistory(senderId: string, receiverId: string): Observable<IMessage[]> {
    return this.http.get<IMessage[]>(`${this.apiUrl}/history/${senderId}/${receiverId}`);
  }

  // Méthode pour récupérer les informations de chat pour un utilisateur spécifique
  getChatInfo(email: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/ws/chat/info?email=${email}`);
  }

  // Méthode pour se déconnecter proprement de WebSocket
  disconnectWebSocket() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate(); // Fermer la connexion WebSocket proprement
      console.log('WebSocket connection closed');
    }
  }
  getMessagesByUsers(senderEmail: string, receiverEmail: string): Observable<IMessage[]> {
    return this.http.get<IMessage[]>(`/api/messages?sender=${senderEmail}&receiver=${receiverEmail}`);
  }

}

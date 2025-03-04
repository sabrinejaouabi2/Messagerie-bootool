import { Component, OnInit, OnDestroy } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ChatService } from 'src/app/Services/chat.service';
import { UserService } from 'src/app/Services/user.service';
import { IMessage } from 'src/app/models/IMessage';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  newMessage: string = ''; // Liaison pour le champ de saisie
  messages: IMessage[] = []; // Tableau des messages reçus
  isConnected: boolean = false; // Statut de la connexion WebSocket
  selectedReceiverId: string | null = null;  // Dynamique selon la sélection du destinataire
  users: User[] = []; // Liste des utilisateurs disponibles
audioBlob: Blob | null = null;
audioUrl: SafeResourceUrl | null = null;  // Change to SafeResourceUrl
  constructor(private chatService: ChatService, private userService: UserService) {}

  ngOnInit() {
    // Récupérer les utilisateurs (par exemple, depuis un service ou une API)
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.users = users;
    });

    // Récupérer les messages via le service Chat
    this.chatService.getMessages().subscribe((message: IMessage) => {
      this.onMessageReceived(message);
    });
  }

  ngOnDestroy() {
    this.chatService.disconnectWebSocket(); // Déconnexion lorsque le composant est détruit
  }
  sendMessage() {
    if (this.newMessage.trim() && this.selectedReceiverId) {
      // Get the current user's email (replace with actual logic to retrieve the email)
      const currentUserEmail = this.userService.getCurrentUserEmail();

      if (!currentUserEmail) {
        console.error("L'email de l'utilisateur actuel est manquant.");
        return;
      }

      this.userService.getCurrentUser(currentUserEmail).subscribe((currentUser: User) => {
        if (!currentUser) {
          console.error("Utilisateur introuvable.");
          return;
        }

        const senderId = currentUser.id.toString();  // Convert senderId to string
        const senderName = currentUser.name;         // User's name
        const senderEmail = currentUser.email;       // User's email

        if (!senderId || !senderName || !senderEmail) {
          console.error("L'ID, le nom ou l'email de l'utilisateur est manquant.");
          return;
        }

        if (!this.selectedReceiverId) {
          console.error("Le destinataire n'est pas sélectionné.");
          return;  // Ensure a valid receiver is selected
        }

        const message: IMessage = {
          id: Date.now(),  // Temporary ID based on timestamp or leave it null if handled by server
          senderId: senderId,
          senderName: senderName,
          senderEmail: senderEmail,
          receiverId: this.selectedReceiverId,  // Now guaranteed to be a valid string
          content: this.newMessage,
          timestamp: new Date().toISOString(),
          type: this.audioBlob ? 'audio' : 'text', // Déterminer le type du message
          audioUrl: this.audioBlob ? this.audioUrl : null // Peut être null si aucun message vocal


        };

        this.chatService.sendMessage(message);  // Send the message
        this.newMessage = '';  // Reset the message input field
      });
    } else {
      console.error('Impossible d\'envoyer le message, veuillez sélectionner un destinataire et renseigner le message.');
    }
  }








  // Gestion de la réception des messages
  onMessageReceived(message: IMessage) {
    this.messages.push(message); // Ajouter le message à la liste des messages
  }

  // Sélection d'un destinataire
  selectReceiver(receiverId: string) {
    this.selectedReceiverId = receiverId;
  }
}

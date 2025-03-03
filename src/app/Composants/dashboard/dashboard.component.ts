import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {  Subject } from "rxjs";
import { IMessage } from "src/app/models/IMessage";
import { AuthService } from "src/app/Services/auth.service";
import { ChatService } from "src/app/Services/chat.service";
import { UserService } from "src/app/Services/user.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  users: any[] = [];
  message: string = '';
  messages: IMessage[] = [];
  errorMessage: string = '';
  private unsubscribe$ = new Subject<void>();
  receiverEmail: string = '';
  showReceived: boolean = false;
  receivedMessages: IMessage[] = []; // Stocke les messages reçus
  replyingTo: string | null = null;  // Utilisé pour afficher le nom du destinataire
  replyMessage: string = '';  // Le message de réponse
  hasNewMessages: boolean = false; // Indique s'il y a un nouveau message

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private chatService: ChatService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userEmail = this.authService.getUserEmail();
    console.log('Email récupéré:', userEmail);

    if (userEmail) {
      // Fetch current user and all users
      this.userService.getCurrentUser(userEmail).subscribe(
        (response) => {
          this.currentUser = response;
          console.log('Utilisateur récupéré:', this.currentUser);
        },
        (error) => {
          this.errorMessage = 'Erreur lors de la récupération de l\'utilisateur';
          console.error('Erreur:', error);
        }
      );


      this.userService.getAllUsers().subscribe(
        (users) => {
          this.users = users;
          console.log('Utilisateurs récupérés:', this.users);
        },
        (error) => {
          this.errorMessage = 'Erreur lors de la récupération des utilisateurs';
          console.error('Erreur:', error);
        }

      );


      // Subscribe to messages
      this.chatService.getMessages().subscribe(
        (message: IMessage) => {
          if (message.receiverId === this.currentUser.email) {
            this.receivedMessages.push(message);  // Add to received messages list
            this.hasNewMessages = true;  // Mark as having new messages
            this.showReceived = true; // Automatically show received messages
            console.log('Message reçu:', message);
          }
        },
        (error) => {
          console.error('Erreur lors de la réception des messages:', error);
        }
      );
    }
  }


  showReceivedMessages(): void {
    // Filtrer uniquement les messages reçus
    this.receivedMessages = this.messages.filter(msg => msg.receiverId === this.currentUser.email);
    this.showReceived = !this.showReceived; // Basculer l'affichage

    // Réinitialiser l'état après affichage
    if (this.showReceived) {
      this.hasNewMessages = false;
    }
  }

  // Fonction pour ouvrir la section de réponse
  replyToMessage(senderEmail: string): void {
    this.replyingTo = senderEmail;  // Définit automatiquement le destinataire (expéditeur du message)
    this.replyMessage = '';  // Réinitialise le champ de texte
  }

  // Fonction pour envoyer une réponse
  sendReply(): void {
    if (this.replyMessage.trim() && this.replyingTo) {
      const reply: IMessage = {
        id: Date.now(),  // Generate a unique ID (replace with backend-generated ID if applicable)
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        senderEmail: this.currentUser.email,
        receiverId: this.replyingTo,
        content: this.replyMessage,
        timestamp: new Date().toISOString()
      };

      console.log('Réponse envoyée:', reply);
      this.chatService.sendMessage(reply); // Send the reply through the chat service
      this.messages.push(reply); // Add the reply to the message list
      this.replyingTo = null; // Close the reply section
      this.replyMessage = ''; // Reset the reply message field
    }
  }
  startChat(receiverEmail: string): void {
    if (this.currentUser) {
      console.log(`Démarrage du chat avec ${receiverEmail}`);

      const receiver = this.users.find(user => user.email === receiverEmail);

      if (receiver) {
        this.receiverEmail = receiverEmail;
        this.messages = []; // Reset the current messages

        // Subscribe to the message stream and filter messages as they come in
        this.chatService.getMessages().subscribe(
          (message: IMessage) => {
            // Filter messages based on the current user and receiver
            if (
              (message.receiverId === this.currentUser.email && message.senderEmail === receiverEmail) ||
              (message.senderEmail === this.currentUser.email && message.receiverId === receiverEmail)
            ) {
              this.messages.push(message); // Add filtered message to the message list
            }
          },
          (error) => {
            console.error('Erreur lors de la réception des messages:', error);
          }
        );

        // Optional: Add an initial message
        this.message = `Hello, ${receiver.firstName || receiver.name || 'utilisateur'}!`;
      } else {
        console.error('Utilisateur non trouvé');
      }
    }
  }




  // Fonction pour envoyer un message
  onSendMessage(): void {
    if (this.message.trim() && this.receiverEmail) {
      const message: IMessage = {
        id: Date.now(),  // Generate a unique ID (replace with backend-generated ID if applicable)
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        senderEmail: this.currentUser.email,
        receiverId: this.receiverEmail, // Utiliser l'email ou un autre identifiant du destinataire
        content: this.message,  // Le message tapé par l'utilisateur
        timestamp: new Date().toISOString()
      };

      console.log('Message à envoyer:', message);  // Affiche le message à envoyer
      this.chatService.sendMessage(message);  // Envoyer le message via le service
      this.message = '';  // Réinitialiser le champ de saisie après l'envoi
    } else {
      console.log('Erreur: message vide ou destinataire non sélectionné');
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  logout(): void {
    // Supprimer le token d'authentification
    this.authService.logout();

    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
    console.log('Utilisateur déconnecté');
  }
}

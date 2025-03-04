import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
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
//Recording
messageType: string = 'text';
isRecording: boolean = false;
audioRecorder: any;
stream: MediaStream | null = null;
audioBlob: Blob | null = null;
audioUrl: SafeResourceUrl | null = null;  // Change to SafeResourceUrl
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private chatService: ChatService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer

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
        timestamp: new Date().toISOString(),
        type: this.audioBlob ? 'audio' : 'text', // Déterminer le type du message
        audioUrl: this.audioBlob ? this.audioUrl : null // Peut être null si aucun message vocal
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



  onSendMessage(): void {
    if (this.message.trim() && this.receiverEmail) {
      const message: IMessage = {
        id: Date.now(),
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        senderEmail: this.currentUser.email,
        receiverId: this.receiverEmail,
        content: this.message,
        timestamp: new Date().toISOString(),
        type: this.audioBlob ? 'audio' : 'text', // Déterminer le type du message
        audioUrl: this.audioBlob ? this.audioUrl : null // Peut être null si aucun message vocal
      };

      console.log('Message à envoyer:', message); // Afficher le message envoyé
      this.chatService.sendMessage(message); // Envoyer le message via le service
      this.message = ''; // Réinitialiser la saisie du message
      this.audioUrl = null; // Réinitialiser l'URL de l'audio après envoi
    } else {
      console.log('Erreur: message vide ou destinataire non sélectionné');
    }
  }


  ngOnDestroy(): void {
    if (this.audioRecorder) {
      this.audioRecorder.stop();
    }
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
  //Recorder
  startRecording(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('Tentative d\'accéder à l\'audio...');
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        console.log('Accès à l\'audio accordé');
        this.audioRecorder = new (window as any).MediaRecorder(stream);
        this.audioBlob = null;  // Reset any previous recordings

        this.audioRecorder.ondataavailable = (event: any) => {
          this.audioBlob = event.data;  // Save the recorded audio blob
          if (this.audioBlob !== null) {
            this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.audioBlob));  // Créer une URL de l'audio
          } else {
            console.error('Audio blob is null');
          }
                  };

        this.audioRecorder.onstop = () => {
          console.log('Enregistrement arrêté');
        };

        if (this.audioRecorder.state === 'inactive') {
          console.log('Enregistrement démarré');
          this.audioRecorder.start();
          this.isRecording = true;  // Set the recording flag to true
          this.stream = stream;
        } else {
          console.error('Erreur: le MediaRecorder est déjà en cours d\'enregistrement.');
        }
      }).catch((error) => {
        console.error('Erreur lors de l\'accès à l\'audio:', error);
      });
    } else {
      alert('L\'enregistrement audio n\'est pas supporté par votre navigateur.');
    }
  }

  stopRecording(): void {
    if (this.audioRecorder && this.isRecording) {
      this.audioRecorder.stop();
      this.isRecording = false;  // Set the recording flag to false
      this.stream?.getTracks().forEach(track => track.stop()); // Stop the media stream
      console.log('Recording stopped');
    }
  }

  sendVoiceMessage(): void {
    if (this.audioBlob && this.receiverEmail) {  // Ensure audioBlob is not null
      const formData = new FormData();
      formData.append('audio', this.audioBlob, 'voice_message.wav');

      // Sanitize the blob URL using DomSanitizer
      const sanitizedAudioUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.audioBlob));

      const message: IMessage = {
        id: Date.now(),
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        senderEmail: this.currentUser.email,
        receiverId: this.receiverEmail,
        content: 'Message vocal',
        audioUrl: sanitizedAudioUrl,  // Use the sanitized URL
        timestamp: new Date().toISOString(),
        type: 'audio'  // Ajouter le type de message ici, 'text' pour les messages textuels

      };

      this.chatService.sendMessage(message);
      this.audioBlob = null;
      this.isRecording = false;
      console.log('Message vocal envoyé');
    } else {
      console.log('Erreur: Aucun message vocal à envoyer ou audioBlob est null.');
    }
  }

createSafeAudioUrl(blob: Blob): SafeResourceUrl {
  return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
}


}

import { SafeResourceUrl } from "@angular/platform-browser";

// models/IMessage.ts
export interface IMessage {
  id: number;
  senderId: string;
  receiverId: string;
  senderName: string;   // Ajouter le nom de l'expéditeur
  senderEmail: string;  // Ajouter l'email de l'expéditeur
  content: string;
  timestamp: string;
  audioUrl: SafeResourceUrl | null | undefined; // Modifier ici pour accepter null
  type: 'text' | 'audio'; // Indicateur du type de message : 'text' pour texte, 'audio' pour fichier audio

}

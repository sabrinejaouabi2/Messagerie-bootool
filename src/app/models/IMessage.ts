// models/IMessage.ts
export interface IMessage {
  id: number;
  senderId: string;
  receiverId: string;
  senderName: string;   // Ajouter le nom de l'expéditeur
  senderEmail: string;  // Ajouter l'email de l'expéditeur
  content: string;
  timestamp: string;
}

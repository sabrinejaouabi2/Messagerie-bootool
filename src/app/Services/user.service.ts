import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';  // Corrigé : importation depuis rxjs/operators

// Interface de l'utilisateur
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/users';
  private currentUser: User | null = null;


  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
/*
  getCurrentUser(email: string) {
    return this.http.get<any>(`${this.apiUrl}/currentUser/${email}`);
  }
    */
  getCurrentUser(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/currentUser/${email}`).pipe(
      catchError(error => {
        console.error('Error fetching user:', error);
        return throwError(error);
      })
    );
  }

 // Méthode pour récupérer dynamiquement l'ID de l'utilisateur actuel
 setCurrentUser(user: User) {
  this.currentUser = user;
}

// Récupérer l'ID de l'utilisateur actuel
getCurrentUserId(): number | null {
  return this.currentUser ? this.currentUser.id : null;
}
// New methods to get the current user's name and email
getCurrentUserName(): string | null {
  return this.currentUser ? this.currentUser.name : null;
}

getCurrentUserEmail(): string | null {
  return this.currentUser ? this.currentUser.email : null;
}
}

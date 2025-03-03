import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) { }
  getUserEmail(): string | null {
    return localStorage.getItem('userEmail'); }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

login(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
    tap((response) => {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authToken', response.token);
    }),
    catchError(error => {
      return throwError(() => new Error('Erreur lors de la connexion'));
    })
  );
}



  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }



  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail'); // Supprimer l'email aussi

  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;

  }
}

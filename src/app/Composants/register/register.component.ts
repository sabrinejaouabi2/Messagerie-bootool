import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';  // Ajout de confirmPassword
  errorMessage: string | null = null;  // Ajout de errorMessage

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;  // Ne pas envoyer la requête si les mots de passe ne correspondent pas
    }

    this.authService.register(this.name, this.email, this.password).subscribe({
      next: (response) => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration failed', err);
        this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
      }
    });
  }
}

import { AuthService } from '@/app/core/services/auth.service';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';
import { delay } from 'rxjs';

@Component({
    selector: 'app-login',
    imports: [
        FormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        AppFloatingConfigurator
    ],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class Login {
    constructor(
        private auth: AuthService,
        private router: Router
    ) {
        const message =
            this.router.currentNavigation()?.extras.state?.['message'];

        if (message) {
            this.successMessage.set(message);

            history.replaceState({ ...history.state, message: undefined }, '');
        }
    }

    email = '';
    password = '';
    successMessage = signal('');
    errorMessage = signal('');
    isSubmitting = signal(false);

    onSignIn() {
        if (this.isSubmitting()) return;

        this.successMessage.set('');
        this.errorMessage.set('');
        this.isSubmitting.set(true);

        this.auth
            .login({
                email: this.email,
                password: this.password
            })
            .subscribe({
                next: (response) => {
                    this.isSubmitting.set(false);
                    this.router.navigate([
                        response.user.role === 'admin'
                            ? '/admin/dashboard'
                            : '/user/dashboard'
                    ]);
                },
                error: () => {
                    this.errorMessage.set('Login failed. Please try again.');
                    this.isSubmitting.set(false);
                }
            });
    }

    onGoogleSignIn() {
        this.auth.googleLogin();
    }

    onGithubSignIn() {
        this.auth.githubLogin();
    }
    onMicrosoftSignIn() {
        this.auth.microsoftLogin();
    }
}

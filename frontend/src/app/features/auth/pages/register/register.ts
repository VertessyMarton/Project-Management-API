import { AuthService } from '../../../../core/services/auth.service';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { EmailVerificationDialog } from '../../components/email-verification-dialog/email-verification-dialog';

@Component({
    selector: 'app-register',
    imports: [
        RouterLink,
        FormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        AppFloatingConfigurator,
        EmailVerificationDialog
    ],
    templateUrl: './register.html',
    styleUrl: './register.scss'
})
export class Register {
    constructor(
        private auth: AuthService,
        private router: Router
    ) {}
    name = '';
    email = '';
    password = '';
    errorMessage = signal('');
    isSubmitting = signal(false);
    showVerification = signal(false);
    verificationSendError = signal('');

    onSubmit() {
        this.errorMessage.set('');
        this.isSubmitting.set(true);
        this.showVerification.set(false);
        this.verificationSendError.set('');

        this.auth
            .register({
                name: this.name,
                email: this.email,
                password: this.password
            })
            .subscribe({
                next: () => {
                    this.showVerification.set(true);
                    this.isSubmitting.set(false);
                },
                error: () => {
                    this.errorMessage.set(
                        'Registration failed. Please try again.'
                    );
                    this.isSubmitting.set(false);
                }
            });
    }

    onEmailVerified() {
        this.router.navigate(['/login'], {
            state: {
                message: 'Account created successfully, you can now sign in.'
            }
        });
    }
}

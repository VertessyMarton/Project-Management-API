import { AuthService } from '../../../../core/services/auth.service';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';
import { delay } from 'rxjs';
import { EmailVerificationDialog } from '../../components/email-verification-dialog/email-verification-dialog';
import { EmailVerificiationService } from '../../services/email-verification.service';
import { ForgotPasswordDialog } from '../../components/forgot-password-dialog/forgot-password-dialog';

@Component({
    selector: 'app-login',
    imports: [
        FormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        AppFloatingConfigurator,
        EmailVerificationDialog,
        ForgotPasswordDialog
    ],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class Login {
    constructor(
        private auth: AuthService,
        private emailVerificationService: EmailVerificiationService,
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
    showVerification = signal(false);
    showForgotPassword = signal(false);
    resetEmail = '';
    verificationSendError = signal('');

    onSignIn() {
        if (this.isSubmitting()) return;

        this.successMessage.set('');
        this.errorMessage.set('');
        this.isSubmitting.set(true);
        this.showVerification.set(false);
        this.verificationSendError.set('');

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
                error: (error) => {
                    if (
                        error.status === 403 &&
                        error.error?.code === 'EMAIL_NOT_VERIFIED'
                    ) {
                        this.emailVerificationService
                            .resendEmailVerification({ email: this.email })
                            .subscribe({
                                error: () => {
                                    this.verificationSendError.set(
                                        'Sending the verification code failed, try again'
                                    );
                                }
                            });
                        this.showVerification.set(true);
                        this.isSubmitting.set(false);
                        return;
                    }
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

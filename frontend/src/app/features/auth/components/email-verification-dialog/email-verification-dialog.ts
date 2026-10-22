import { Component, effect, input, output, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { EmailVerificiationService } from '../../services/email-verification.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-email-verification-dialog',
    imports: [
        DialogModule,
        FormsModule,
        ButtonModule,
        InputOtpModule,
        FormsModule
    ],
    templateUrl: './email-verification-dialog.html',
    styleUrl: './email-verification-dialog.scss'
})
export class EmailVerificationDialog {
    constructor(private emailVerificationService: EmailVerificiationService) {
        effect(() => {
            const isOpen = this.visible();
            const sendError = this.sendError();

            this.message.set(
                isOpen && sendError ? { type: 'error', text: sendError } : null
            );
        });
    }

    email = input('');
    otp = '';
    sendError = input('');
    message = signal<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    fromRegister = input(false);
    isSubmitting = signal(false);
    visible = input(false);
    visibleChange = output<boolean>();
    verified = output<void>();
    isResending = signal(false);

    onVerifyEmail() {
        this.isSubmitting.set(true);
        this.message.set(null);

        this.emailVerificationService
            .verifyEmail({
                email: this.email(),
                otp: this.otp
            })
            .subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.visibleChange.emit(false);
                    this.verified.emit();
                    this.otp = '';
                },
                error: () => {
                    this.isSubmitting.set(false);
                    this.message.set({
                        type: 'error',
                        text: 'The verification code is invalid or expired.'
                    });
                }
            });
    }

    onResendVerification() {
        this.message.set(null);
        this.isResending.set(true);

        this.emailVerificationService
            .resendEmailVerification({
                email: this.email()
            })
            .subscribe({
                next: () => {
                    this.isResending.set(false);
                    this.message.set({
                        type: 'success',
                        text: 'A new verification code has been sent.'
                    });
                },
                error: () => {
                    this.isResending.set(false);
                    this.message.set({
                        type: 'error',
                        text: 'Sending the verification code failed, try again'
                    });
                }
            });
    }
}

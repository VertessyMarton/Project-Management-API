import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { PasswordResetService } from '../../services/password-reset.service';
import { ForgotPasswordDialog } from '../../components/forgot-password-dialog/forgot-password-dialog';

@Component({
    selector: 'app-reset-password',
    imports: [FormsModule, RouterLink, ForgotPasswordDialog],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.scss'
})
export class ResetPassword {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private resetService = inject(PasswordResetService);
    private destroyRef = inject(DestroyRef);
    private token = this.route.snapshot.queryParamMap.get('token') ?? '';

    state = signal<'form' | 'success' | 'invalid'>(
        this.token ? 'form' : 'invalid'
    );
    newPassword = '';
    confirmPassword = '';
    showNewPassword = signal(false);
    showConfirmPassword = signal(false);
    isSubmitting = signal(false);
    errorMessage = signal('');
    showForgotPassword = signal(false);

    onSubmit() {
        if (this.isSubmitting()) return;
        this.errorMessage.set('');
        if (!this.newPassword || this.newPassword !== this.confirmPassword) {
            this.errorMessage.set('The passwords must match.');
            return;
        }
        this.isSubmitting.set(true);
        this.resetService
            .resetPassword(this.token, this.newPassword)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.newPassword = '';
                    this.confirmPassword = '';
                    this.token = '';
                    this.state.set('success');
                    timer(5000)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe(() => this.router.navigate(['/login']));
                },
                error: (error) => {
                    this.isSubmitting.set(false);
                    if (error.status === 401) {
                        this.state.set('invalid');
                    } else {
                        this.errorMessage.set(
                            error.status === 400
                                ? 'The password must contain at least 6 characters.'
                                : 'Could not reset your password. Please try again.'
                        );
                    }
                }
            });
    }
}

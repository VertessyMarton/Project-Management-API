import {
    Component,
    DestroyRef,
    effect,
    inject,
    input,
    model,
    output,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { PasswordResetService } from '../../services/password-reset.service';

@Component({
    selector: 'app-forgot-password-dialog',
    imports: [FormsModule, DialogModule],
    templateUrl: './forgot-password-dialog.html',
    styleUrl: './forgot-password-dialog.scss'
})
export class ForgotPasswordDialog {
    private resetService = inject(PasswordResetService);
    private destroyRef = inject(DestroyRef);

    visible = input(false);
    visibleChange = output<boolean>();
    email = model('');
    isSubmitting = signal(false);
    message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

    constructor() {
        effect(() => {
            if (!this.visible()) this.message.set(null);
        });
    }

    close() {
        if (this.isSubmitting()) return;
        this.message.set(null);
        this.visibleChange.emit(false);
    }

    onSubmit() {
        if (this.isSubmitting() || !this.email().trim()) return;
        this.isSubmitting.set(true);
        this.message.set(null);

        this.resetService
            .requestReset(this.email().trim())
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.isSubmitting.set(false))
            )
            .subscribe({
                next: () => this.showConfirmation(),
                error: (error) => {
                    this.message.set({
                        type: 'error',
                        text:
                            error.status === 429
                                ? 'Too many requests. Please wait before trying again.'
                                : 'Could not send a reset link. Please try again shortly.'
                    });
                }
            });
    }

    private showConfirmation() {
        this.message.set({
            type: 'success',
            text: 'A password reset link has been sent to your email'
        });
    }
}

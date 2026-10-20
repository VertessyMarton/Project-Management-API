import { AuthService } from '@/app/core/services/auth.service';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
    selector: 'app-register',
    imports: [
        FormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        AppFloatingConfigurator
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

    onSubmit() {
        this.errorMessage.set('');
        this.isSubmitting.set(true);

        this.auth
            .register({
                name: this.name,
                email: this.email,
                password: this.password
            })
            .subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.router.navigate(['/login'], {
                        state: {
                            message:
                                'Account created successfully. You can now sign in.'
                        }
                    });
                },
                error: () => {
                    this.errorMessage.set(
                        'Registration failed. Please try again.'
                    );
                    this.isSubmitting.set(false);
                }
            });
    }
}

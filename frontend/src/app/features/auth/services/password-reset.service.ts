import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '@/app/core/api.url';

@Injectable({ providedIn: 'root' })
export class PasswordResetService {
    private http = inject(HttpClient);

    resetPassword(token: string, newPassword: string) {
        return this.http.post(`${API_URL}/auth/reset-password`, { token, newPassword });
    }

    requestReset(email: string) {
        return this.http.post(`${API_URL}/auth/forgot-password`, { email });
    }
}

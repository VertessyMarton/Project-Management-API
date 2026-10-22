import { Injectable, InputSignal } from '@angular/core';
import { API_URL } from '@/app/core/api.url';
import { HttpClient } from '@angular/common/http';

type VerifyEmail = {
    email: string;
    otp: string;
};

type ResendEmailVerification = {
    email: string;
};

@Injectable({
    providedIn: 'root'
})
export class EmailVerificiationService {
    private readonly apiUrl = `${API_URL}/auth`;

    constructor(private http: HttpClient) {}

    verifyEmail(payload: VerifyEmail) {
        return this.http.post(`${this.apiUrl}/verify-email`, payload);
    }

    resendEmailVerification(payload: ResendEmailVerification) {
        return this.http.post(`${this.apiUrl}/resend-verification`, payload);
    }
}

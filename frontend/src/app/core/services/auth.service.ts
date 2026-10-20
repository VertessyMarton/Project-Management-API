import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import {
    Observable,
    catchError,
    defer,
    finalize,
    map,
    of,
    shareReplay,
    switchMap,
    tap,
    throwError
} from 'rxjs';
import { API_URL } from '../api.url';

type RegisterPaylaod = {
    name: string;
    email: string;
    password: string;
};

type LoginPaylaod = {
    email: string;
    password: string;
};

type AuthUser = {
    id: number;
    email: string;
    role: string;
};

type LoginResponse = {
    accessToken: string;
    user: AuthUser;
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = API_URL;
    private readonly currentUser = signal<AuthUser | null>(null);
    readonly user = this.currentUser.asReadonly();

    private refreshRequest?: Observable<string>;
    private signingOut = false;

    constructor(private http: HttpClient) {}

    register(payload: RegisterPaylaod) {
        return this.http.post(`${this.apiUrl}/auth/register`, payload);
    }

    login(payload: LoginPaylaod) {
        return this.http
            .post<LoginResponse>(`${this.apiUrl}/auth/login`, payload, {
                withCredentials: true
            })
            .pipe(
                tap((response) => {
                    this.saveToken(response.accessToken);
                    this.currentUser.set(response.user);
                })
            );
    }

    googleLogin() {
        window.location.href = `${this.apiUrl}/auth/google`;
    }

    githubLogin() {
        window.location.href = `${this.apiUrl}/auth/github`;
    }

    microsoftLogin() {
        window.location.href = `${this.apiUrl}/auth/microsoft`;
    }

    loadCurrentUser(): Observable<AuthUser> {
        return this.http
            .get<AuthUser>(`${this.apiUrl}/users/me`)
            .pipe(tap((user) => this.currentUser.set(user)));
    }

    saveToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    getToken() {
        return localStorage.getItem('accessToken');
    }

    isLoggedIn() {
        return !!this.getToken();
    }

    clearToken() {
        localStorage.removeItem('accessToken');
    }

    refreshAccessToken(): Observable<string> {
        if (this.signingOut)
            return throwError(() => new Error('Sign-out in progress'));
        if (!this.refreshRequest) {
            this.refreshRequest = this.http
                .post<LoginResponse>(
                    `${this.apiUrl}/auth/refresh`,
                    {},
                    {
                        withCredentials: true
                    }
                )
                .pipe(
                    map((response) => response.accessToken),
                    tap((token) => this.saveToken(token)),
                    finalize(() => {
                        this.refreshRequest = undefined;
                    }),
                    shareReplay({ bufferSize: 1, refCount: false })
                );
        }
        return this.refreshRequest;
    }

    logout(allDevices = false) {
        return defer(() => {
            this.signingOut = true;
            // Let an already-running refresh finish before sending its replacement cookie to logout.
            const ready: Observable<string | null> =
                this.refreshRequest ?? of(null);
            return ready.pipe(
                catchError(() => of(null)),
                switchMap(() =>
                    this.http.post<{ message: string }>(
                        `${this.apiUrl}/auth/logout${allDevices ? '/all' : ''}`,
                        {},
                        { withCredentials: true }
                    )
                ),
                tap(() => this.clearToken()),
                finalize(() => {
                    this.signingOut = false;
                })
            );
        });
    }
}

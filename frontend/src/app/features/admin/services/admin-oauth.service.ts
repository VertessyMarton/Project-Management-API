import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '@/app/core/api.url';

export type Providers = 'google' | 'github' | 'microsoft';

export type OauthUsers = {
    id: number;
    provider: string;
    providerUserId: string;
    email: string;
    userId: number;
    linkedAt: Date;
};

export type AdminOauthResponse = {
    data: OauthUsers[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

@Injectable({
    providedIn: 'root'
})
export class AdminOauthService {
    private readonly apiUrl = `${API_URL}/admin/oauth`;

    constructor(private http: HttpClient) {}

    getOauthUsers(
        page?: number,
        limit?: number,
        q?: string,
        provider?: string,
        userId?: number,
        providerId?: string,
        linkedFrom?: string,
        linkedTo?: string,
        sortBy?: string,
        sortOrder?: string
    ) {
        return this.http.get<AdminOauthResponse>(this.apiUrl, {
            params: {
                ...(page !== undefined && { page }),
                ...(limit !== undefined && { limit }),
                ...(q !== undefined && { q }),
                ...(provider !== undefined && { provider }),
                ...(userId !== undefined && { userId }),
                ...(providerId !== undefined && { providerId }),
                ...(linkedFrom !== undefined && { linkedFrom }),
                ...(linkedTo !== undefined && { linkedTo }),
                ...(sortBy !== undefined && { sortBy }),
                ...(sortOrder !== undefined && { sortOrder })
            }
        });
    }
}

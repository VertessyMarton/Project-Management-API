import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '@/app/core/api.url';

export type Users = {
    id: number;
    name: string;
    email: string;
    role: UserRoles;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
};

export type UserRoles = 'admin' | 'user';

export type UserStatus = 'verified' | 'unverified';

export type AdminUserResponse = {
    data: Users[];
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
export class AdminUsersService {
    private readonly apiUrl = `${API_URL}/admin/users`;

    constructor(private http: HttpClient) {}

    getUsers(
        page?: number,
        limit?: number,
        q?: string,
        role?: UserRoles,
        status?: UserStatus,
        sortBy?: string,
        sortOrder?: string
    ) {
        return this.http.get<AdminUserResponse>(this.apiUrl, {
            params: {
                ...(page !== undefined && { page }),
                ...(limit !== undefined && { limit }),
                ...(q !== undefined && { q }),
                ...(role !== undefined && { role }),
                ...(status !== undefined && { status }),
                ...(sortBy !== undefined && { sortBy }),
                ...(sortOrder !== undefined && { sortOrder })
            }
        });
    }

    deleteUser(id: number) {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }
}

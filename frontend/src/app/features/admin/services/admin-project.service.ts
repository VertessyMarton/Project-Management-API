import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '@/app/core/api.url';

export type Projects = {
    id: number;
    name: string;
    discription: string;
    createdAt: Date;
    updatedAt: Date;
};

export type AdminProjectResponse = {
    data: Projects[];
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
export class AdminProjectService {
    private readonly apiUrl = `${API_URL}/admin/projects`;

    constructor(private http: HttpClient) {}

    getProjects(
        page?: number,
        limit?: number,
        q?: string,
        memberId?: number,
        createdFrom?: string,
        createdTo?: string,
        sortBy?: string,
        sortOrder?: string
    ) {
        return this.http.get<AdminProjectResponse>(this.apiUrl, {
            params: {
                ...(page !== undefined && { page }),
                ...(limit !== undefined && { limit }),
                ...(q !== undefined && { q }),
                ...(memberId !== undefined && { memberId }),
                ...(createdFrom !== undefined && { createdFrom }),
                ...(createdTo !== undefined && { createdTo }),
                ...(sortBy !== undefined && { sortBy }),
                ...(sortOrder !== undefined && { sortOrder })
            }
        });
    }

    deleteProject(id: number) {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }
}

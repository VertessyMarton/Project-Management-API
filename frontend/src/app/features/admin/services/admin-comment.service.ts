import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '@/app/core/api.url';

export type Comments = {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;

    author: {
        id: number;
        name: string;
        email: string;
    };

    task: {
        id: number;
        title: string;
    };

    project: {
        id: number;
        name: string;
    };
};

export type AdminCommentResponse = {
    data: Comments[];
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
export class AdminCommentService {
    private readonly apiUrl = `${API_URL}/admin/comments`;

    constructor(private http: HttpClient) {}

    getComments(
        page?: number,
        limit?: number,
        q?: string,
        projectId?: number,
        taskId?: number,
        authorId?: number,
        createdFrom?: string,
        createdTo?: string,
        sortBy?: string,
        sortOrder?: string
    ) {
        return this.http.get<AdminCommentResponse>(this.apiUrl, {
            params: {
                ...(page !== undefined && { page }),
                ...(limit !== undefined && { limit }),
                ...(q !== undefined && { q }),
                ...(projectId !== undefined && { projectId }),
                ...(taskId !== undefined && { taskId }),
                ...(authorId !== undefined && { authorId }),
                ...(createdFrom !== undefined && { createdFrom }),
                ...(createdTo !== undefined && { createdTo }),
                ...(sortBy !== undefined && { sortBy }),
                ...(sortOrder !== undefined && { sortOrder })
            }
        });
    }

    deleteComment(id: number) {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }
}

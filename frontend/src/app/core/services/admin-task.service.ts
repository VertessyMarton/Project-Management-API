import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../api.url';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type Tasks = {
    id: number;
    title: string;
    status: TaskStatus;
    dueDate: string;
    createdAt: Date;
    updatedAt: Date;

    project: {
        id: number;
        name: string;
    };

    assignee: {
        id: number;
        name: string;
        email: string;
    } | null;

    createdBy: {
        id: number;
        name: string;
    } | null;
};

export type AdminTaskResponse = {
    data: Tasks[];
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
export class AdminTaskService {
    private readonly apiUrl = `${API_URL}/admin/tasks`;

    constructor(private http: HttpClient) {}

    getTasks(
        page?: number,
        limit?: number,
        q?: string,
        projectId?: number,
        status?: TaskStatus,
        assigneeId?: number,
        createdById?: number,
        hasAssignee?: boolean,
        overdue?: boolean,
        dueFrom?: string,
        dueTo?: string,
        createdFrom?: string,
        createdTo?: string,
        sortBy?: string,
        sortOrder?: string
    ) {
        return this.http.get<AdminTaskResponse>(this.apiUrl, {
            params: {
                ...(page !== undefined && { page }),
                ...(limit !== undefined && { limit }),
                ...(q !== undefined && { q }),
                ...(projectId !== undefined && { projectId }),
                ...(status !== undefined && { status }),
                ...(assigneeId !== undefined && { assigneeId }),
                ...(createdById !== undefined && { createdById }),
                ...(hasAssignee !== undefined && { hasAssignee }),
                ...(overdue !== undefined && { overdue }),
                ...(dueFrom !== undefined && { dueFrom }),
                ...(dueTo !== undefined && { dueTo }),
                ...(createdFrom !== undefined && { createdFrom }),
                ...(createdTo !== undefined && { createdTo }),
                ...(sortBy !== undefined && { sortBy }),
                ...(sortOrder !== undefined && { sortOrder })
            }
        });
    }

    deleteTask(id: number) {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }
}

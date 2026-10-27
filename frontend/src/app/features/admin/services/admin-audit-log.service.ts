import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '@/app/core/api.url';

export type AuditCategory = 'admin' | 'security' | 'project_access';

export type AuditTargetType = 'user' | 'project' | 'task' | 'comment';

export type AuditOutcome = 'success' | 'failure' | 'denied';

export type AuditLogs = {
    id: number;
    occuredAt: Date;
    category: AuditCategory;
    action: string;
    actorId: number;
    targetType: AuditTargetType;
    targetId: number;
    outcome: AuditOutcome;
    metadata: Record<string, unknown> | null;
    requestId: string;
};

export type AuditLogsResponse = {
    data: AuditLogs[];
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
export class AuditLogService {
    private readonly apiUrl = `${API_URL}/admin/audit-logs`;

    constructor(private http: HttpClient) {}

    getAuditLogs(
        page?: number,
        limit?: number,
        q?: string,
        category?: AuditCategory,
        targetType?: AuditTargetType,
        outcome?: AuditOutcome,
        actorId?: number,
        targetId?: number,
        requestId?: string,
        occuredFrom?: string,
        occuredTo?: string,
        sortBy?: string,
        sortOrder?: string
    ) {
        return this.http.get<AuditLogsResponse>(this.apiUrl, {
            params: {
                ...(page !== undefined && { page }),
                ...(limit !== undefined && { limit }),
                ...(q !== undefined && { q }),
                ...(category !== undefined && { category }),
                ...(targetType !== undefined && { targetType }),
                ...(outcome !== undefined && { outcome }),
                ...(actorId !== undefined && { actorId }),
                ...(targetId !== undefined && { targetId }),
                ...(requestId !== undefined && { requestId }),
                ...(occuredFrom !== undefined && { occuredFrom }),
                ...(occuredTo !== undefined && { occuredTo }),
                ...(sortBy !== undefined && { sortBy }),
                ...(sortOrder !== undefined && { sortOrder })
            }
        });
    }
}

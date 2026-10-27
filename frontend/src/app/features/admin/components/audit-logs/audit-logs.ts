import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePipe, JsonPipe } from '@angular/common';
import { PopoverModule } from 'primeng/popover';
import {
    AuditCategory,
    AuditLogs,
    AuditLogService,
    AuditOutcome,
    AuditTargetType
} from '../../services/admin-audit-log.service';

@Component({
    selector: 'app-users',
    imports: [
        FormsModule,
        TableModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        TagModule,
        SelectModule,
        ButtonModule,
        DatePipe,
        PopoverModule,
        JsonPipe
    ],
    templateUrl: './audit-logs.html',
    styleUrl: './audit-logs.scss'
})
export class AdminAuditLogs {
    private reloadRequests = new Subject<Table>();

    categoryOptions = [
        { label: 'admin', value: 'admin' },
        { label: 'security', value: 'security' },
        { label: 'project_access', value: 'project_access' }
    ];

    targetTypeOptions = [
        { label: 'user', value: 'user' },
        { label: 'project', value: 'project' },
        { label: 'task', value: 'task' },
        { label: 'comment', value: 'comment' }
    ];

    outcomeOptions = [
        { label: 'success', value: 'success' },
        { label: 'failure', value: 'failure' },
        { label: 'denied', value: 'denied' }
    ];

    constructor(private auditLogService: AuditLogService) {
        this.reloadRequests
            .pipe(debounceTime(300), takeUntilDestroyed())
            .subscribe((table) => {
                table.first = 0;

                this.loadAuditLogs({
                    first: 0,
                    rows: table.rows ?? 25
                });
            });
    }

    isLoading = signal(false);
    auditLogs = signal<AuditLogs[]>([]);
    totalRecords = signal(0);
    searchQuery = signal('');
    onSelectedCategory = signal<AuditCategory | undefined>(undefined);
    onSelectedTargetType = signal<AuditTargetType | undefined>(undefined);
    onSelectedOutcome = signal<AuditOutcome | undefined>(undefined);
    actorIdQuery = signal<number | undefined>(undefined);
    targetIdQuery = signal<number | undefined>(undefined);
    requestIdQuery = signal<string | undefined>(undefined);
    sortOrder = signal<'asc' | 'desc' | undefined>(undefined);
    sortBy = signal<string | undefined>(undefined);
    occuredFrom = signal('');
    occuredTo = signal('');
    isDeleting = signal(false);
    errorMessage = signal('');

    loadAuditLogs(event: TableLazyLoadEvent) {
        const limit = event.rows ?? 25;
        const page = Math.floor((event.first ?? 0) / limit) + 1;
        const hasSortField = typeof event.sortField === 'string';
        const sortBy =
            typeof event.sortField === 'string' ? event.sortField : undefined;

        this.sortOrder.set(
            hasSortField ? (event.sortOrder === 1 ? 'asc' : 'desc') : undefined
        );

        this.sortBy.set(sortBy);

        this.auditLogService
            .getAuditLogs(
                page,
                limit,
                this.searchQuery() || undefined,
                this.onSelectedCategory(),
                this.onSelectedTargetType(),
                this.onSelectedOutcome(),
                this.actorIdQuery() || undefined,
                this.targetIdQuery() || undefined,
                this.requestIdQuery() || undefined,
                this.occuredFrom() || undefined,
                this.occuredTo() || undefined,
                this.sortBy(),
                this.sortOrder()
            )
            .subscribe({
                next: (response) => {
                    this.auditLogs.set(response.data);
                    this.isLoading.set(false);
                    this.totalRecords.set(response.meta.total);
                }
            });
    }

    onSearch(value: string, table: Table) {
        this.searchQuery.set(value);
        this.reloadRequests.next(table);
    }
    onCategoryChange(value: AuditCategory | null, table: Table) {
        console.log(value);
        this.onSelectedCategory.set(value ?? undefined);

        this.loadAuditLogs({
            first: 0,
            rows: table.rows ?? 25
        });
    }

    onTargetTypeChange(value: AuditTargetType | null, table: Table) {
        console.log(value);
        this.onSelectedTargetType.set(value ?? undefined);

        this.loadAuditLogs({
            first: 0,
            rows: table.rows ?? 25
        });
    }

    onOutcomeChange(value: AuditOutcome | null, table: Table) {
        console.log(value);
        this.onSelectedOutcome.set(value ?? undefined);

        this.loadAuditLogs({
            first: 0,
            rows: table.rows ?? 25
        });
    }

    onActorIdSearch(value: number, table: Table) {
        this.actorIdQuery.set(
            Number.isInteger(value) && value > 0 ? value : undefined
        );
        this.reloadRequests.next(table);
    }

    onTargetIdSearch(value: number, table: Table) {
        this.targetIdQuery.set(value ?? undefined);
        this.reloadRequests.next(table);
    }

    onRequestIdSearch(value: string, table: Table) {
        this.requestIdQuery.set(value ?? undefined);
        this.reloadRequests.next(table);
    }

    onOccuredFromChange(value: string, table: Table) {
        this.occuredFrom.set(value);
        this.reloadRequests.next(table);
    }

    onOccuredToChange(value: string, table: Table) {
        this.occuredTo.set(value);
        this.reloadRequests.next(table);
    }
}

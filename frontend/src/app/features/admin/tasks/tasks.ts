import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { debounceTime, delay, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import {
    AdminTaskService,
    Tasks,
    TaskStatus
} from '@/app/core/services/admin-task.service';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';

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
        CheckboxModule,
        SelectButtonModule,
        PopoverModule,
        ButtonModule,
        DatePipe
    ],
    templateUrl: './tasks.html',
    styleUrl: './tasks.scss'
})
export class AdminTasks {
    private delayedSearchChanges = new Subject<Table>();
    private reloadRequests = new Subject<Table>();

    statusOptions = [
        { label: 'todo', value: 'todo' },
        { label: 'in_progress', value: 'in_progress' },
        { label: 'review', value: 'review' },
        { label: 'done', value: 'done' }
    ];

    constructor(private userService: AdminTaskService) {
        this.delayedSearchChanges
            .pipe(debounceTime(300), takeUntilDestroyed())
            .subscribe((table) => {
                table.first = 0;

                this.loadTasks({
                    first: 0,
                    rows: table.rows ?? 25
                });
            });

        this.reloadRequests.pipe(takeUntilDestroyed()).subscribe((table) => {
            table.first = 0;

            this.loadTasks({
                first: 0,
                rows: table.rows ?? 25
            });
        });
    }

    isLoading = signal(false);
    tasks = signal<Tasks[]>([]);
    totalRecords = signal(0);
    searchQuery = signal('');
    projectIdQuery = signal<number | undefined>(undefined);
    assigneeIdQuery = signal<number | undefined>(undefined);
    createdByIdQuery = signal<number | undefined>(undefined);
    selectedStatus = signal<TaskStatus | undefined>(undefined);
    hasAssignee = signal<boolean | undefined>(undefined);
    isOverdue = signal<boolean | undefined>(undefined);
    createdFrom = signal('');
    createdTo = signal('');
    dueFrom = signal('');
    dueTo = signal('');
    sortOrder = signal<'asc' | 'desc' | undefined>(undefined);
    sortBy = signal<string | undefined>(undefined);
    isDeleting = signal(false);
    errorMessage = signal('');

    loadTasks(event: TableLazyLoadEvent) {
        const limit = event.rows ?? 25;
        const page = Math.floor((event.first ?? 0) / limit) + 1;
        const hasSortField = typeof event.sortField === 'string';
        const sortBy =
            typeof event.sortField === 'string' ? event.sortField : undefined;

        this.sortOrder.set(
            hasSortField ? (event.sortOrder === 1 ? 'asc' : 'desc') : undefined
        );

        this.sortBy.set(sortBy);

        this.userService
            .getTasks(
                page,
                limit,
                this.searchQuery() || undefined,
                this.projectIdQuery(),
                this.selectedStatus(),
                this.assigneeIdQuery(),
                this.createdByIdQuery(),
                this.hasAssignee(),
                this.isOverdue(),
                this.dueFrom() || undefined,
                this.dueTo() || undefined,
                this.createdFrom() || undefined,
                this.createdTo() || undefined,
                this.sortBy(),
                this.sortOrder()
            )
            .subscribe({
                next: (response) => {
                    console.log(response.data);
                    this.tasks.set(response.data);
                    this.isLoading.set(false);
                    this.totalRecords.set(response.meta.total);
                }
            });
    }

    deleteTask(id: number, table: Table, dialog: HTMLDialogElement) {
        if (this.isDeleting()) {
            return;
        }
        this.isDeleting.set(true);
        this.errorMessage.set('');
        this.userService.deleteTask(id).subscribe({
            next: () => {
                dialog.close();
                this.isDeleting.set(false);
                this.reloadRequests.next(table);
            },
            error: () => {
                this.isDeleting.set(false);
                this.errorMessage.set('Could not delete task');
            }
        });
    }

    onSearch(value: string, table: Table) {
        this.searchQuery.set(value);
        this.delayedSearchChanges.next(table);
    }

    onProjectIdSearch(value: number, table: Table) {
        this.projectIdQuery.set(
            Number.isInteger(value) && value > 0 ? value : undefined
        );
        this.delayedSearchChanges.next(table);
    }

    onAssigneeIdSearch(value: number, table: Table) {
        this.assigneeIdQuery.set(
            Number.isInteger(value) && value > 0 ? value : undefined
        );
        this.delayedSearchChanges.next(table);
    }

    onCreatedByIdSearch(value: number, table: Table) {
        this.createdByIdQuery.set(
            Number.isInteger(value) && value > 0 ? value : undefined
        );
        this.delayedSearchChanges.next(table);
    }

    onStatusChange(value: TaskStatus | null, table: Table) {
        this.selectedStatus.set(value ?? undefined);
        this.reloadRequests.next(table);
    }

    onAssignmentChange(value: 'All' | 'Assigned' | 'Unassigned', table: Table) {
        this.hasAssignee.set(
            value === 'All' ? undefined : value === 'Assigned'
        );

        this.reloadRequests.next(table);
    }
    onOverdueChange(value: 'All' | 'Overdue' | 'Not overdue', table: Table) {
        this.isOverdue.set(value === 'All' ? undefined : value === 'Overdue');

        this.reloadRequests.next(table);
    }

    onCreatedFromChange(value: string, table: Table) {
        this.createdFrom.set(value);
        this.reloadRequests.next(table);
    }

    onCreatedToChange(value: string, table: Table) {
        this.createdTo.set(value);
        this.reloadRequests.next(table);
    }

    onDueFromChange(value: string, table: Table) {
        this.dueFrom.set(value);
        this.reloadRequests.next(table);
    }

    onDueToChange(value: string, table: Table) {
        this.dueTo.set(value);
        this.reloadRequests.next(table);
    }
}

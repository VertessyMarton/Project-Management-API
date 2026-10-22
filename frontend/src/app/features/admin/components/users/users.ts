import {
    AdminUsersService,
    UserStatus,
    UserRoles,
    Users
} from '../../services/admin-users.service';
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
        ButtonModule,
        DatePipe
    ],
    templateUrl: './users.html',
    styleUrl: './users.scss'
})
export class AdminUsers {
    private reloadRequests = new Subject<Table>();

    roleOptions = [
        { label: 'admin', value: 'admin' },
        { label: 'user', value: 'user' }
    ];

    statusOptions = [
        { label: 'verified', value: 'verified' },
        { label: 'unverified', value: 'unverified' }
    ];

    constructor(private userService: AdminUsersService) {
        this.reloadRequests
            .pipe(debounceTime(300), takeUntilDestroyed())
            .subscribe((table) => {
                table.first = 0;

                this.loadUsers({
                    first: 0,
                    rows: table.rows ?? 25
                });
            });
    }

    isLoading = signal(false);
    users = signal<Users[]>([]);
    totalRecords = signal(0);
    searchQuery = signal('');
    selectedRole = signal<UserRoles | undefined>(undefined);
    selectedStatus = signal<UserStatus | undefined>(undefined);
    sortOrder = signal<'asc' | 'desc' | undefined>(undefined);
    sortBy = signal<string | undefined>(undefined);
    isDeleting = signal(false);
    errorMessage = signal('');

    loadUsers(event: TableLazyLoadEvent) {
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
            .getUsers(
                page,
                limit,
                this.searchQuery(),
                this.selectedRole(),
                this.selectedStatus(),
                this.sortBy(),
                this.sortOrder()
            )
            .subscribe({
                next: (response) => {
                    this.users.set(response.data);
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
        this.userService.deleteUser(id).subscribe({
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
        this.reloadRequests.next(table);
    }

    onRoleChange(value: UserRoles | null, table: Table) {
        this.selectedRole.set(value ?? undefined);

        this.loadUsers({
            first: 0,
            rows: table.rows ?? 25
        });
    }

    onStatusChange(value: UserStatus | null, table: Table) {
        this.selectedStatus.set(value ?? undefined);

        this.loadUsers({
            first: 0,
            rows: table.rows ?? 25
        });
    }
}

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
import { PopoverModule } from 'primeng/popover';
import {
    AdminOauthService,
    OauthUsers,
    Providers
} from '../../services/admin-oauth.service';

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
        PopoverModule
    ],
    templateUrl: './oauth.html',
    styleUrl: './oauth.scss'
})
export class AdminOauthUsers {
    private reloadRequests = new Subject<Table>();

    providerOptions = [
        { label: 'google', value: 'google' },
        { label: 'github', value: 'github' },
        { label: 'microsoft', value: 'microsoft' }
    ];

    constructor(private oathService: AdminOauthService) {
        this.reloadRequests
            .pipe(debounceTime(300), takeUntilDestroyed())
            .subscribe((table) => {
                table.first = 0;

                this.loadOauthUsers({
                    first: 0,
                    rows: table.rows ?? 25
                });
            });
    }

    isLoading = signal(false);
    oauthUsers = signal<OauthUsers[]>([]);
    totalRecords = signal(0);
    searchQuery = signal('');
    onSelectedProvider = signal<Providers | undefined>(undefined);
    userIdQuery = signal<number | undefined>(undefined);
    providerIdQuery = signal<string | undefined>(undefined);
    sortOrder = signal<'asc' | 'desc' | undefined>(undefined);
    sortBy = signal<string | undefined>(undefined);
    linkedFrom = signal('');
    linkedTo = signal('');
    isDeleting = signal(false);
    errorMessage = signal('');

    loadOauthUsers(event: TableLazyLoadEvent) {
        const limit = event.rows ?? 25;
        const page = Math.floor((event.first ?? 0) / limit) + 1;
        const hasSortField = typeof event.sortField === 'string';
        const sortBy =
            typeof event.sortField === 'string' ? event.sortField : undefined;

        this.sortOrder.set(
            hasSortField ? (event.sortOrder === 1 ? 'asc' : 'desc') : undefined
        );

        this.sortBy.set(sortBy);

        this.oathService
            .getOauthUsers(
                page,
                limit,
                this.searchQuery() || undefined,
                this.onSelectedProvider(),
                this.userIdQuery() || undefined,
                this.providerIdQuery() || undefined,
                this.linkedFrom() || undefined,
                this.linkedTo() || undefined,
                this.sortBy(),
                this.sortOrder()
            )
            .subscribe({
                next: (response) => {
                    this.oauthUsers.set(response.data);
                    this.isLoading.set(false);
                    this.totalRecords.set(response.meta.total);
                }
            });
    }

    onSearch(value: string, table: Table) {
        this.searchQuery.set(value);
        this.reloadRequests.next(table);
    }
    onProviderChange(value: Providers | null, table: Table) {
        console.log(value);
        this.onSelectedProvider.set(value ?? undefined);

        this.loadOauthUsers({
            first: 0,
            rows: table.rows ?? 25
        });
    }

    onUserIdSearch(value: number, table: Table) {
        this.userIdQuery.set(
            Number.isInteger(value) && value > 0 ? value : undefined
        );
        this.reloadRequests.next(table);
    }

    onProviderIdSearch(value: string, table: Table) {
        this.providerIdQuery.set(value ?? undefined);
        this.reloadRequests.next(table);
    }

    onLinkedFromChange(value: string, table: Table) {
        this.linkedFrom.set(value);
        this.reloadRequests.next(table);
    }

    onLinkedToChange(value: string, table: Table) {
        this.linkedTo.set(value);
        this.reloadRequests.next(table);
    }
}

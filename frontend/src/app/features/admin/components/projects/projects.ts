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
import {
    AdminProjectService,
    Projects
} from '../../services/admin-project.service';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { PopoverModule } from 'primeng/popover';

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
    templateUrl: './projects.html',
    styleUrl: './projects.scss'
})
export class AdminProjects {
    private reloadRequests = new Subject<Table>();

    constructor(private projectService: AdminProjectService) {
        this.reloadRequests
            .pipe(debounceTime(300), takeUntilDestroyed())
            .subscribe((table) => {
                table.first = 0;

                this.loadProjects({
                    first: 0,
                    rows: table.rows ?? 25
                });
            });
    }

    isLoading = signal(false);
    projects = signal<Projects[]>([]);
    totalRecords = signal(0);
    searchQuery = signal('');
    memberIdQuery = signal<number | undefined>(undefined);
    sortOrder = signal<'asc' | 'desc' | undefined>(undefined);
    sortBy = signal<string | undefined>(undefined);
    createdFrom = signal('');
    createdTo = signal('');
    isDeleting = signal(false);
    errorMessage = signal('');

    loadProjects(event: TableLazyLoadEvent) {
        const limit = event.rows ?? 25;
        const page = Math.floor((event.first ?? 0) / limit) + 1;
        const hasSortField = typeof event.sortField === 'string';
        const sortBy =
            typeof event.sortField === 'string' ? event.sortField : undefined;

        this.sortOrder.set(
            hasSortField ? (event.sortOrder === 1 ? 'asc' : 'desc') : undefined
        );

        this.sortBy.set(sortBy);

        this.projectService
            .getProjects(
                page,
                limit,
                this.searchQuery() || undefined,
                this.memberIdQuery(),
                this.createdFrom() || undefined,
                this.createdTo() || undefined,
                this.sortBy(),
                this.sortOrder()
            )
            .subscribe({
                next: (response) => {
                    this.projects.set(response.data);
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
        this.projectService.deleteProject(id).subscribe({
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

    onMemberIdSearch(value: number, table: Table) {
        this.memberIdQuery.set(
            Number.isInteger(value) && value > 0 ? value : undefined
        );
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
}

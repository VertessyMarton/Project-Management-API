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
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
    AdminCommentService,
    Comments
} from '@/app/core/services/admin-comment.service';
import { PopoverModule } from 'primeng/popover';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

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
    templateUrl: './comments.html',
    styleUrl: './comments.scss'
})
export class AdminComments {
    private delayedSearchChanges = new Subject<Table>();
    private reloadRequests = new Subject<Table>();

    constructor(private commentService: AdminCommentService) {
        this.delayedSearchChanges
            .pipe(debounceTime(300), takeUntilDestroyed())
            .subscribe((table) => {
                table.first = 0;

                this.loadComments({
                    first: 0,
                    rows: table.rows ?? 25
                });
            });

        this.reloadRequests.pipe(takeUntilDestroyed()).subscribe((table) => {
            table.first = 0;

            this.loadComments({
                first: 0,
                rows: table.rows ?? 25
            });
        });
    }

    isLoading = signal(false);
    comments = signal<Comments[]>([]);
    totalRecords = signal(0);
    searchQuery = signal('');
    projectIdQuery = signal<number | undefined>(undefined);
    taskIdQuery = signal<number | undefined>(undefined);
    authorIdQuery = signal<number | undefined>(undefined);
    createdFrom = signal('');
    createdTo = signal('');
    sortOrder = signal<'asc' | 'desc' | undefined>(undefined);
    sortBy = signal<string | undefined>(undefined);
    isDeleting = signal(false);
    errorMessage = signal('');

    loadComments(event: TableLazyLoadEvent) {
        const limit = event.rows ?? 25;
        const page = Math.floor((event.first ?? 0) / limit) + 1;
        const hasSortField = typeof event.sortField === 'string';
        const sortBy =
            typeof event.sortField === 'string' ? event.sortField : undefined;

        this.sortOrder.set(
            hasSortField ? (event.sortOrder === 1 ? 'asc' : 'desc') : undefined
        );

        this.sortBy.set(sortBy);

        this.commentService
            .getComments(
                page,
                limit,
                this.searchQuery() || undefined,
                this.projectIdQuery(),
                this.taskIdQuery(),
                this.authorIdQuery(),
                this.createdFrom() || undefined,
                this.createdTo() || undefined,
                this.sortBy(),
                this.sortOrder()
            )
            .subscribe({
                next: (response) => {
                    this.comments.set(response.data);
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
        this.commentService.deleteComment(id).subscribe({
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

    onTaskIdSearch(value: number, table: Table) {
        this.taskIdQuery.set(
            Number.isInteger(value) && value > 0 ? value : undefined
        );
        this.delayedSearchChanges.next(table);
    }

    onAuthorIdSearch(value: number, table: Table) {
        this.authorIdQuery.set(
            Number.isInteger(value) && value > 0 ? value : undefined
        );
        this.delayedSearchChanges.next(table);
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

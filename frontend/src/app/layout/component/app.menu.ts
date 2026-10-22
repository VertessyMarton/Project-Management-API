import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/admin/dashboard']
                    }
                ]
            },
            {
                label: 'UI Components',
                items: [
                    {
                        label: 'Users',
                        icon: 'pi pi-fw pi-table',
                        routerLink: ['/admin/users']
                    },
                    {
                        label: 'Linked accounts',
                        icon: 'pi pi-fw pi-table',
                        routerLink: ['/admin/oauth']
                    },
                    {
                        label: 'Projects',
                        icon: 'pi pi-fw pi-table',
                        routerLink: ['/admin/projects']
                    },
                    {
                        label: 'Tasks',
                        icon: 'pi pi-fw pi-table',
                        routerLink: ['/admin/tasks']
                    },
                    {
                        label: 'Comments',
                        icon: 'pi pi-fw pi-table',
                        routerLink: ['/admin/comments']
                    }
                ]
            }
        ];
    }
}

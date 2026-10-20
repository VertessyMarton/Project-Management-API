import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { DashboardTemp } from './app/features/workspace/pages/dashboard/dashboard';
import { Login } from './app/features/auth/pages/login/login';
import { Register } from './app/features/auth/pages/register/register';
import { AdminUsers } from './app/features/admin/users/users';
import { AdminProjects } from './app/features/admin/projects/projects';
import { AdminTasks } from './app/features/admin/tasks/tasks';
import { AdminComments } from './app/features/admin/comments/comments';
import { adminGuard } from './app/core/guards/admin.guard';
import { authGuard } from './app/core/guards/auth.guard';

export const appRoutes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'user/dashboard',
        canActivate: [authGuard],
        component: DashboardTemp
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'admin',
        component: AppLayout,
        canActivate: [authGuard, adminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },
            { path: 'users', component: AdminUsers },
            { path: 'projects', component: AdminProjects },
            { path: 'tasks', component: AdminTasks },
            { path: 'comments', component: AdminComments }
        ]
    }
];

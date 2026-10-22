import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const loginUrl = router.createUrlTree(['/login']);

    if (!auth.isLoggedIn()) {
        return loginUrl;
    }

    const user = auth.user();

    if (user) {
        return user.role === 'admin' ? true : loginUrl;
    }

    return auth.loadCurrentUser().pipe(
        map((user) => (user.role === 'admin' ? true : loginUrl)),
        catchError(() => of(loginUrl))
    );
};

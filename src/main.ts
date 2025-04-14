import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { provideRouter, Routes } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { bootstrapApplication } from "@angular/platform-browser";
import { RegisterComponent } from "./app/register/register.component";
import { HomeComponent } from "./app/home/home.component";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { LoginComponent } from "./app/login/login.component";
import { AdminComponent } from "./app/admin/admin.component";
import { AdminGuard } from "./app/services/admin.guard";
import { CartComponent } from "./app/cart/cart.component";
import { authInterceptor } from "./app/services/auth.interceptor";

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'cart', component: CartComponent },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AdminGuard]
    }
];

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor]))
    ]
}).catch(err => console.error(err));

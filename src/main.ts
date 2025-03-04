import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {provideRouter, Routes} from "@angular/router";
import {AppComponent} from "./app/app.component";
import {bootstrapApplication} from "@angular/platform-browser";
import {RegisterComponent} from "./app/register/register.component";
import {HomeComponent} from "./app/home/home.component";
import {provideHttpClient} from "@angular/common/http";
import {LoginComponent} from "./app/login/login.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
}).catch(err => console.error(err));

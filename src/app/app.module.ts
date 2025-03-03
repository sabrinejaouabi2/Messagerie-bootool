import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Composants/login/login.component';
import { ChatComponent } from './Composants/chat/chat.component';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './Composants/register/register.component';
import { DashboardComponent } from './Composants/dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChatComponent,
    RegisterComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,




  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

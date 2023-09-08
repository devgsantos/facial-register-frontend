import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './modules/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TokenGenerateService } from './modules/shared/services/token-generate.service';
import { RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule,
    NgxMaskModule.forRoot()
  ],
  providers: [TokenGenerateService],
  bootstrap: [AppComponent]
})
export class AppModule { }

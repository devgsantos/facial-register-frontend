import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuccessPageRoutingModule } from './success-page-routing.module';
import { SuccessPageComponent } from './success-page.component';


@NgModule({
  declarations: [
    SuccessPageComponent
  ],
  imports: [
    CommonModule,
    SuccessPageRoutingModule
  ]
})
export class SuccessPageModule { }

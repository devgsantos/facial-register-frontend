import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TicketFormRoutingModule } from './ticket-form-routing.module';
import { TicketFormComponent } from './ticket-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { TokenGenerateService } from '../shared/services/token-generate.service';
import { NgxMaskModule } from 'ngx-mask';


@NgModule({
  declarations: [
    TicketFormComponent
  ],
  imports: [
    CommonModule,
    TicketFormRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    NgxMaskModule.forChild()
  ],
  providers: [TokenGenerateService]
})
export class TicketFormModule { }

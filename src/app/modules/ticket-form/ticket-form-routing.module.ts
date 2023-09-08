import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketFormComponent } from './ticket-form.component';

const routes: Routes = [{ path: '', component: TicketFormComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketFormRoutingModule { }

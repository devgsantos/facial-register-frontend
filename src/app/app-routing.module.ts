import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CameraCaptureComponent } from './modules/shared/components/camera-capture/camera-capture.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'cadastroIngresso', pathMatch: 'full'
  },
  { path: ' ', loadChildren: () => import('./modules/user-photo/user-photo.module').then(m => m.UserPhotoModule) },
  { path: 'cadastroIngresso', loadChildren: () => import('./modules/ticket-form/ticket-form.module').then(m => m.TicketFormModule) },
  { path: 'sucesso', loadChildren: () => import('./modules/success-page/success-page.module').then(m => m.SuccessPageModule) },
  { path: 'foto', component: CameraCaptureComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

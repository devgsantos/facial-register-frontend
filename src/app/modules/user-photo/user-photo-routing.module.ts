import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserPhotoComponent } from './user-photo.component';

const routes: Routes = [{ path: '', component: UserPhotoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPhotoRoutingModule { }

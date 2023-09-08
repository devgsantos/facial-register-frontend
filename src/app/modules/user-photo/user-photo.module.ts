import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserPhotoRoutingModule } from './user-photo-routing.module';
import { UserPhotoComponent } from './user-photo.component';
import { TokenGenerateService } from '../shared/services/token-generate.service';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    UserPhotoComponent
  ],
  imports: [
    CommonModule,
    UserPhotoRoutingModule,
    RouterModule
  ],
  providers: [TokenGenerateService]
})
export class UserPhotoModule { }

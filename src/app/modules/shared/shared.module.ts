import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraCaptureComponent } from './components/camera-capture/camera-capture.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SafePipePipe } from './pipes/safe-pipe.pipe';
import { TokenGenerateService } from './services/token-generate.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { RequiredDirective } from './directives/required.directive';

@NgModule({
  declarations: [
    CameraCaptureComponent,
    HeaderComponent,
    FooterComponent,
    SafePipePipe,
    RequiredDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CameraCaptureComponent,
    HeaderComponent,
    FooterComponent,
    SafePipePipe
  ],
  providers: [TokenGenerateService, ErrorHandlerService]
})
export class SharedModule { }

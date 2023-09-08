import { Directive, ElementRef, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRequired]'
})
export class RequiredDirective {

  @Input('appAsterisk') isRequired!: boolean;

  constructor(private el: ElementRef, private control: NgControl) { }


}

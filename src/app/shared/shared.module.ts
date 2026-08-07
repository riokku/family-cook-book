import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeFormatPipe } from './pipes/time-format.pipe';

@NgModule({
  declarations: [TimeFormatPipe],
  imports: [CommonModule],
  exports: [TimeFormatPipe]
})
export class SharedModule { }

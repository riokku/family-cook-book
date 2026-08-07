import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: false
})
export class TimeFormatPipe implements PipeTransform {

  transform(minutes: number): string {
    if (minutes == null) return '';
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hrLabel = hrs === 1 ? 'hr' : 'hrs';
    if (mins === 0) {
      return `${hrs} ${hrLabel}`;
    }
    return `${hrs} ${hrLabel} ${mins} ${mins === 1 ? 'min' : 'mins'}`;
  }

}

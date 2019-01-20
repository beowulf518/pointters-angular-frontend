import { Pipe, PipeTransform } from '@angular/core';
import turf from "@turf/distance";


@Pipe({
  name: 'calcDistance'
})
export class CalcDistancePipe implements PipeTransform {

  transform(value1, value2, value3): any {
    if (!value3 || !value2) {
      return 0;
    }
    return turf(value2,  value3);
  }

}

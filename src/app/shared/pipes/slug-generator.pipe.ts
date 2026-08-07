import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'slugGenerator',
    standalone: false
})

export class SlugGeneratorPipe implements PipeTransform{

  transform(incomingString: string) {
    return incomingString.replaceAll(" ", "-").toLowerCase().trim();
  }

}

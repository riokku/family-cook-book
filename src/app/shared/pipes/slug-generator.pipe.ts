import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'slugGenerator'})

export class SlugGeneratorPipe implements PipeTransform{

  transform(incomingString: string) {
    //return incomingString.toUpperCase();

    return incomingString.replaceAll(" ", "-").toLowerCase().trim();


  }

}

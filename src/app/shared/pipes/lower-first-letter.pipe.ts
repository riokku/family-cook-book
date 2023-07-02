import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'lowerFirstLetter'})

export class LowerFirstLetterPipe implements PipeTransform{

  transform(incomingString: string){

    let firstCharacter = incomingString.charAt(0).toLowerCase();
    let restOfString = incomingString.slice(1);

    let outgoingString = firstCharacter + restOfString;

    return outgoingString;
  }

}

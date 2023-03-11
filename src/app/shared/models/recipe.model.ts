import { Ingredient } from "./ingredient.model";
import { Step } from "./step.model";


export class Recipe {
  public name: string;
  public description: string;
  public imagePath: string;
  public ingredients: Ingredient[];
  public cookTime: number;
  public servingSize: number;
  public featured: boolean;
  public steps: Step[];

  constructor(
    name: string,
    description: string,
    imagePath: string,
    ingredients: Ingredient[],
    cookTime: number,
    servingSize: number,
    featured: boolean,
    steps: Step[]
    ){
    this.name = name;
    this.description = description;
    this.imagePath = imagePath;
    this.ingredients = ingredients;
    this.cookTime = cookTime;
    this.servingSize = servingSize;
    this.featured = featured;
    this.steps = steps;
  }

}

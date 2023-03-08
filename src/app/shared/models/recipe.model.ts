import { Ingredient } from "./ingredient.model";


export class Recipe {
  public name: string;
  public description: string;
  public imagePath: string;
  public ingredients: Ingredient[];
  public cookTime: number;
  public servingSize: number;
  public featured: boolean;
  public steps: string[];

  constructor(
    name: string,
    description: string,
    imagePath: string,
    ingredients: Ingredient[],
    cookTime: number,
    servingSize: number,
    featured: boolean,
    steps: string[]
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

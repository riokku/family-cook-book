import { Ingredient } from "./ingredient.model";
import { Step } from "./step.model";


export class Recipe {
  public id?: string;
  public name: string;
  public slug: string;
  public author: string;
  public description: string;
  public imagePath: string;
  public ingredients: Ingredient[];
  public cookTime: number;
  public servingSize: number;
  public featured: boolean;
  public steps: Step[];
  public tags: string[];
  public created: Date;

  constructor(
    id: string,
    name: string,
    slug: string,
    author: string,
    description: string,
    imagePath: string,
    ingredients: Ingredient[],
    cookTime: number,
    servingSize: number,
    featured: boolean,
    steps: Step[],
    tags: string[],
    createdDate: Date
    ){
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.author = author;
    this.description = description;
    this.imagePath = imagePath;
    this.ingredients = ingredients;
    this.cookTime = cookTime;
    this.servingSize = servingSize;
    this.featured = featured;
    this.steps = steps;
    this.tags = tags;
    this.created = createdDate;
  }

}

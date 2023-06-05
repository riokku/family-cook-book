import { Ingredient } from "./ingredient.model";
import { Step } from "./step.model";


export class Recipe {
  public id?: string; //optional
  public name: string;
  public slug: string;
  public author: string;
  public link?: string; //optional
  public description: string;
  public imagePath?: string; //optional
  public ingredients: Ingredient[];
  public prepTime?: number; //optional
  public cookTime?: number; //optional
  public chillTime?: number; //optional
  public totalTime: number;
  public servingSize: number;
  public featured: boolean;
  public steps: Step[];
  public tags: string[];
  public created: Date;
  public notes?: string; //optional

  constructor(
    id: string,
    name: string,
    slug: string,
    author: string,
    link: string,
    description: string,
    imagePath: string,
    ingredients: Ingredient[],
    prepTime: number,
    cookTime: number,
    chillTime: number,
    totalTime: number,
    servingSize: number,
    featured: boolean,
    steps: Step[],
    tags: string[],
    createdDate: Date,
    notes: string
    ){
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.author = author;
    this.link = link;
    this.description = description;
    this.imagePath = imagePath;
    this.ingredients = ingredients;
    this.prepTime = prepTime,
    this.cookTime = cookTime,
    this.chillTime = chillTime,
    this.totalTime = totalTime,
    this.servingSize = servingSize;
    this.featured = featured;
    this.steps = steps;
    this.tags = tags;
    this.created = createdDate;
    this.notes = notes;
  }

}

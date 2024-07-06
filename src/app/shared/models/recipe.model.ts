import { IngredientGroup } from "./ingredient-group.model";
import { Step } from "./step.model";


export class Recipe {
  public id?: number; //Will not have for new recipes
  public name: string;
  public slug: string;
  public author: string;
  public link?: string; //optional
  public description: string;
  public image_path?: string; //optional
  public ingredient_groups: IngredientGroup[];
  public prep_time?: number; //optional
  public cook_time?: number; //optional
  public chill_time?: number; //optional
  public total_time: number;
  public serving_size: number;
  public featured: boolean;
  public steps: Step[];
  public tags: string[];
  public created: Date;
  public notes?: string; //optional

  constructor(
    id: number,
    name: string,
    slug: string,
    author: string,
    link: string,
    description: string,
    image_path: string,
    ingredient_groups: IngredientGroup[],
    prep_time: number,
    cook_time: number,
    chill_time: number,
    total_time: number,
    serving_size: number,
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
    this.image_path = image_path;
    this.ingredient_groups = ingredient_groups;
    this.prep_time = prep_time,
    this.cook_time = cook_time,
    this.chill_time = chill_time,
    this.total_time = total_time,
    this.serving_size = serving_size;
    this.featured = featured;
    this.steps = steps;
    this.tags = tags;
    this.created = createdDate;
    this.notes = notes;
  }

}

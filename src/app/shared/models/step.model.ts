export interface StepIngredient {
  ingredientName: string;
  ingredientAmount: number;
  ingredientMeasurementType: string;
}

export class Step {
  constructor(
    public step: string,
    public stepIngredients?: StepIngredient[]
  ) {}
}

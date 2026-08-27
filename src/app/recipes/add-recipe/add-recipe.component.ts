import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { RecipeService } from '../../shared/services/recipe.service';
import { SupaService } from 'src/app/shared/services/supa.service';

@Component({
    selector: 'app-add-recipe',
    templateUrl: './add-recipe.component.html',
    styleUrls: ['./add-recipe.component.scss'],
    standalone: false
})

export class AddRecipeComponent implements OnInit {

  recipeCreatedDate: Date;
  recipeForm: FormGroup;

  latestRecipeName: string;

  ingredientAmountTypeOptions: string[] = ["Cups", "Teaspoons", "Tablespoons", "Fluid ounces", "Pints", "Quarts", "Milliliters", "Liters", "Grams", "Kilograms", "Ounces", "Pounds", "Count"];
  recipeTagOptions: string[] = ["Appetizer", "Dinner", "Cast iron", "Beverage", "Breakfast", "Dessert", "Cookies", "Grilling", "Italian", "Mexican", "Salad", "Seafood", "Soup"];

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private supaService: SupaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(){
    let recipeName = '';
    let recipeSlug = '';
    let recipeAuthor = '';
    let link = '';
    let recipeDescription = '';
    let recipePrepTime;
    let recipeCookTime;
    let recipeChillTime;
    let recipeTotalTime;
    let recipeServingSize;
    let recipeFeatured;
    let recipeImagePath = '';
    let recipeIngredientsGroupArray = new FormArray([this.createIngredientGroup()]);
    let recipeStepsArray = new FormArray([]);
    let recipeTags: string[] = [];
    this.recipeCreatedDate = new Date();
    let recipeNotes: string;

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'slug': new FormControl(recipeSlug, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'author': new FormControl(recipeAuthor, Validators.required),
      'link': new FormControl(link),
      'prep_time': new FormControl(recipePrepTime),
      'cook_time': new FormControl(recipeCookTime),
      'chill_time': new FormControl(recipeChillTime),
      'total_time': new FormControl(recipeTotalTime, Validators.required),
      'serving_size': new FormControl(recipeServingSize, Validators.required),
      'featured': new FormControl(recipeFeatured),
      'image_path': new FormControl(recipeImagePath),
      'ingredient_groups': recipeIngredientsGroupArray,
      'steps': recipeStepsArray,
      'tags': new FormControl(recipeTags, Validators.required),
      'created': new FormControl(this.recipeCreatedDate, Validators.required),
      'notes': new FormControl(recipeNotes)
    });
  }

  // ── Slug ──────────────────────────────────────────────────────────────────

  onNameInput(event: Event): void {
    const name = (event.target as HTMLInputElement).value;
    const slug = name.replaceAll(' ', '-').toLowerCase().trim();
    this.recipeForm.get('slug').setValue(slug, { emitEvent: false });
  }

  // ── Steps ─────────────────────────────────────────────────────────────────

  get recipeStepsControls() {
    return (this.recipeForm.get('steps') as FormArray).controls;
  }

  onAddStep() {
    (<FormArray>this.recipeForm.get('steps')).push(
      new FormGroup({
        'step': new FormControl(null, Validators.required),
        'stepIngredients': new FormArray([])
      })
    );
  }

  onDeleteStep(index: number) {
    (<FormArray>this.recipeForm.get('steps')).removeAt(index);
  }

  // ── Step ingredients ──────────────────────────────────────────────────────

  /** Flat list of all named ingredients across every ingredient group in the form. */
  get allIngredients(): { name: string; amount: number; unit: string }[] {
    const result: { name: string; amount: number; unit: string }[] = [];
    const groups = this.recipeIngredientGroupControls;
    for (let i = 0; i < groups.length; i++) {
      const grp = groups.at(i) as FormGroup;
      const ings = grp.get('ingredients') as FormArray;
      for (let j = 0; j < ings.length; j++) {
        const ing = ings.at(j) as FormGroup;
        const name = ing.get('ingredientName').value;
        if (name) {
          result.push({
            name,
            amount: ing.get('ingredientAmount').value,
            unit: ing.get('ingredientMeasurementType').value
          });
        }
      }
    }
    return result;
  }

  getStepIngredients(stepIndex: number): FormArray {
    return (this.recipeForm.get('steps') as FormArray)
      .at(stepIndex).get('stepIngredients') as FormArray;
  }

  createStepIngredient(name: string = null, amount: number = null, unit: string = null): FormGroup {
    return new FormGroup({
      'ingredientName': new FormControl(name, Validators.required),
      'ingredientAmount': new FormControl(amount, [Validators.required, Validators.min(0.001)]),
      'ingredientMeasurementType': new FormControl(unit)
    });
  }

  addStepIngredient(stepIndex: number): void {
    this.getStepIngredients(stepIndex).push(this.createStepIngredient());
  }

  deleteStepIngredient(stepIndex: number, ingredientIndex: number): void {
    this.getStepIngredients(stepIndex).removeAt(ingredientIndex);
  }

  /** When an ingredient is chosen from the dropdown, auto-populate its unit and cap the amount. */
  onStepIngredientNameChange(stepIndex: number, ingredientIndex: number): void {
    const stepIng = this.getStepIngredients(stepIndex).at(ingredientIndex) as FormGroup;
    const selected = stepIng.get('ingredientName').value;
    const master = this.allIngredients.find(i => i.name === selected);
    if (master) {
      stepIng.get('ingredientMeasurementType').setValue(master.unit, { emitEvent: false });
      stepIng.get('ingredientAmount').setValidators([
        Validators.required,
        Validators.min(0.001),
        Validators.max(master.amount)
      ]);
      stepIng.get('ingredientAmount').updateValueAndValidity();
    }
  }

  /** Returns the max allowed amount for a given ingredient name (from the master list). */
  maxAmountFor(ingredientName: string): number | null {
    if (!ingredientName) return null;
    return this.allIngredients.find(i => i.name === ingredientName)?.amount ?? null;
  }

  dropStep(event: CdkDragDrop<FormGroup[]>): void {
    this.moveArrayItem(
      this.recipeForm.get('steps') as FormArray,
      event.previousIndex,
      event.currentIndex
    );
  }

  // ── Ingredient Groups ─────────────────────────────────────────────────────

  get recipeIngredientGroupControls() {
    return this.recipeForm.get('ingredient_groups') as FormArray;
  }

  addIngredientGroup(): void {
    this.recipeIngredientGroupControls.push(this.createIngredientGroup());
  }

  createIngredientGroup(): FormGroup {
    return new FormGroup({
      'ingredientGroupName': new FormControl(null, Validators.required),
      'ingredients': new FormArray([this.createIngredient()])
    });
  }

  deleteIngredientGroup(index: number): void {
    this.recipeIngredientGroupControls.removeAt(index);
  }

  dropIngredientGroup(event: CdkDragDrop<FormGroup[]>): void {
    this.moveArrayItem(
      this.recipeIngredientGroupControls,
      event.previousIndex,
      event.currentIndex
    );
  }

  // ── Ingredients ───────────────────────────────────────────────────────────

  getIngredients(layerIndex: number): FormArray {
    return (this.recipeIngredientGroupControls.at(layerIndex) as FormGroup).get('ingredients') as FormArray;
  }

  addIngredient(layerIndex: number): void {
    this.getIngredients(layerIndex).push(this.createIngredient());
  }

  createIngredient(): FormGroup {
    return new FormGroup({
      'ingredientName': new FormControl(null, Validators.required),
      'ingredientAmount': new FormControl(null, Validators.required),
      'ingredientMeasurementType': new FormControl(null, Validators.required)
    });
  }

  deleteIngredient(ingredientGroupIndex: number, ingredientIndex: number): void {
    this.getIngredients(ingredientGroupIndex).removeAt(ingredientIndex);
  }

  dropIngredient(event: CdkDragDrop<FormGroup[]>, groupIndex: number): void {
    this.moveArrayItem(
      this.getIngredients(groupIndex),
      event.previousIndex,
      event.currentIndex
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Reorders a FormArray by removing the item at `from` and inserting it at `to`. */
  private moveArrayItem(formArray: FormArray, from: number, to: number): void {
    const item = formArray.at(from);
    formArray.removeAt(from);
    formArray.insert(to, item);
  }

  // ── Form actions ──────────────────────────────────────────────────────────

  onSubmit() {
    this.recipeService.submitRecipe(this.recipeForm.value);
    this.latestRecipeName = this.recipeForm.value.name;
    this.recipeForm.reset();
  }

  onSubmitNew(){
    this.supaService.getLoggedInUser();
    this.supaService.addRecipeNew(this.recipeForm.value);
    this.latestRecipeName = this.recipeForm.value.name;
    this.recipeForm.reset();
  }

  onCancel() {
    this.router.navigate(['/admin'], {relativeTo: this.route});
  }

}

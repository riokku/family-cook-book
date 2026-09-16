import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { SupaService } from 'src/app/shared/services/supa.service';
import { CookProgressService } from 'src/app/shared/services/cook-progress.service';
import { RecentlyViewedService } from 'src/app/shared/services/recently-viewed.service';
import { SeoService } from 'src/app/shared/services/seo.service';
import { WakeLockService } from 'src/app/shared/services/wake-lock.service';
import { buildShoppingList, formatScale, scaledServings } from 'src/app/shared/utils/shopping-list.util';

@Component({
    selector: 'app-recipe',
    templateUrl: './recipe.component.html',
    styleUrls: ['./recipe.component.scss'],
    standalone: false
})

export class RecipeComponent implements OnInit, OnDestroy {

    // Shared between the template's data-bs-target and the teardown below, so
    // renaming one cannot quietly leave the other pointing at nothing.
    private static readonly SHOPPING_MODAL_ID = 'shoppingListModal';

    recipe: Recipe;
    slug: string;
    isAdmin: boolean = false;

    // What the recipe is being multiplied by. Half covers cooking for one out
    // of something written for four, which turned out to be asked for as often
    // as doubling.
    readonly scaleOptions: number[] = [0.5, 1, 2, 3];
    scale: number = 1;

    // Checked-off ingredients, keyed "groupIndex:ingredientIndex" — an index
    // pair rather than the name, because a recipe can call for butter twice and
    // crossing off one should not cross off the other.
    checkedIngredients = new Set<string>();
    checkedSteps = new Set<number>();

    /** Bigger text, a held-open screen, and the finished steps faded back. */
    cookMode: boolean = false;
    keepAwakeFailed: boolean = false;

    shoppingListText: string = '';
    copyState: 'idle' | 'copied' | 'failed' = 'idle';

    private copyResetTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(
      private supaService: SupaService,
      private route: ActivatedRoute,
      private router: Router,
      private seo: SeoService,
      private cookProgress: CookProgressService,
      private recentlyViewed: RecentlyViewedService,
      private wakeLock: WakeLockService
    ){}

    ngOnInit(): void {
      this.route.params.subscribe(
        (params: Params) => {
           this.slug = params['slug'];
           this.recipe = this.supaService.getRecipe(this.slug);
           this.onRecipeChanged();
        }
      );

      // Separate from the params subscription: the scale changes without the
      // recipe changing, and re-running the whole load on every press of ×2
      // would throw away the checked-off steps.
      this.route.queryParams.subscribe((params: Params) => {
        this.scale = this.parseScale(params['scale']);
        this.refreshShoppingList();
      });

      this.supaService.checkAdminStatus().then(isAdmin => {
        this.isAdmin = isAdmin;
      });
    }

    private onRecipeChanged(): void {
      if(!this.recipe){
        return;
      }

      this.seo.setRecipe(this.recipe);
      this.recentlyViewed.record(this.slug);

      const progress = this.cookProgress.load(this.slug);
      this.checkedIngredients = progress.ingredients;
      this.checkedSteps = progress.steps;

      this.refreshShoppingList();
    }

    /**
     * The scale from the URL, so a halved recipe survives a reload and can be
     * sent to someone as what it is.
     *
     * Only the offered scales are honoured — an arbitrary ?scale=0.37 from a
     * mangled link would render a page of amounts nobody can measure.
     */
    private parseScale(raw: unknown): number {
      const value = Number(raw);
      return this.scaleOptions.includes(value) ? value : 1;
    }

    setScale(scale: number): void {
      if(scale === this.scale){
        return;
      }
      this.router.navigate([], {
        relativeTo: this.route,
        // Dropped from the URL at ×1 rather than written out: the unscaled
        // recipe is the plain address for it.
        queryParams: { scale: scale === 1 ? null : scale },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }

    get isScaled(): boolean {
      return this.scale !== 1;
    }

    /** "1/2" rather than "0.5", matching how the amounts below are written. */
    scaleLabel(scale: number): string {
      return formatScale(scale);
    }

    /**
     * The same choice in words, for the radio's label.
     *
     * "×1/2" read aloud is "times one slash two", and the servings it works out
     * to is the useful part anyway — it is what someone is choosing between.
     */
    scaleDescription(scale: number): string {
      const servings = scaledServings(this.recipe, scale);
      const words = scale === 0.5 ? 'Half the recipe'
        : scale === 1 ? 'The recipe as written'
        : `${scale} times the recipe`;
      return servings ? `${words}, about ${servings} servings` : words;
    }

    /**
     * Moves to the ingredients or the steps from the phone-width jump bar.
     *
     * Focus follows the scroll, not just the viewport: both headings carry
     * tabindex="-1" so that someone navigating by keyboard ends up *in* the
     * section rather than back at the top of the page on their next tab.
     */
    jumpTo(id: string): void {
      const target = document.getElementById(id);
      if(!target){
        return;
      }
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    }

    get servings(): number | null {
      return scaledServings(this.recipe, this.scale);
    }

    /**
     * How many lines the shopping list will come to, shown on the button that
     * builds it. Scaling changes the amounts but never the number of
     * ingredients, so this does not depend on the scale.
     */
    get ingredientCount(): number {
      return (this.recipe?.ingredient_groups ?? [])
        .reduce((total, group) => total + (group.ingredients?.length ?? 0), 0);
    }

    // --- Checking things off -------------------------------------------------

    ingredientKey(groupIndex: number, ingredientIndex: number): string {
      return `${groupIndex}:${ingredientIndex}`;
    }

    isIngredientChecked(groupIndex: number, ingredientIndex: number): boolean {
      return this.checkedIngredients.has(this.ingredientKey(groupIndex, ingredientIndex));
    }

    toggleIngredient(groupIndex: number, ingredientIndex: number): void {
      const key = this.ingredientKey(groupIndex, ingredientIndex);
      this.checkedIngredients.has(key)
        ? this.checkedIngredients.delete(key)
        : this.checkedIngredients.add(key);
      this.saveProgress();
    }

    isStepChecked(index: number): boolean {
      return this.checkedSteps.has(index);
    }

    toggleStep(index: number): void {
      this.checkedSteps.has(index)
        ? this.checkedSteps.delete(index)
        : this.checkedSteps.add(index);
      this.saveProgress();
    }

    get checkedCount(): number {
      return this.checkedIngredients.size + this.checkedSteps.size;
    }

    get stepsDone(): number {
      return this.checkedSteps.size;
    }

    /**
     * The step to draw attention to while cooking: the first one not yet ticked
     * off. Looking up from the pan to find your place is the moment the steps
     * list exists for, so one row is marked rather than leaving a wall of
     * equals. -1 outside cook mode, and once every step is done.
     */
    get currentStepIndex(): number {
      if(!this.cookMode || !this.recipe?.steps){
        return -1;
      }
      for(let i = 0; i < this.recipe.steps.length; i++){
        if(!this.checkedSteps.has(i)){
          return i;
        }
      }
      return -1;
    }

    resetProgress(): void {
      this.checkedIngredients.clear();
      this.checkedSteps.clear();
      this.cookProgress.clear(this.slug);
    }

    private saveProgress(): void {
      this.cookProgress.save(this.slug, this.checkedIngredients, this.checkedSteps);
    }

    // --- Cook mode -----------------------------------------------------------

    async toggleCookMode(): Promise<void> {
      this.cookMode = !this.cookMode;

      if(this.cookMode){
        // Larger type is the half of cook mode that always works, so a refused
        // wake lock is reported rather than treated as a failure to turn on.
        this.keepAwakeFailed = this.wakeLock.isSupported && !(await this.wakeLock.enable());
        return;
      }

      this.keepAwakeFailed = false;
      await this.wakeLock.disable();
    }

    get screenHeldAwake(): boolean {
      return this.cookMode && this.wakeLock.isHeld;
    }

    get wakeLockSupported(): boolean {
      return this.wakeLock.isSupported;
    }

    /**
     * Prints the recipe.
     *
     * The print stylesheet does the work; this is here so that the option is
     * visible. Ctrl+P is not something everyone in a family knows, and on a
     * tablet there is no keyboard to press it on.
     */
    print(): void {
      window.print();
    }

    // --- Shopping list -------------------------------------------------------

    /**
     * Readies the dialog. Bootstrap opens and closes it from the data
     * attributes on the button, so there is no visibility to track here.
     *
     * The list is rebuilt rather than trusted: the scale can have changed since
     * it was last written, and a stale list is worse than no list because
     * nothing on screen says it is out of date. The copy message is cleared too,
     * so reopening does not greet you with a confirmation of something you did
     * five minutes ago.
     */
    openShoppingList(): void {
      this.refreshShoppingList();
      this.copyState = 'idle';
    }

    private refreshShoppingList(): void {
      if(this.recipe){
        this.shoppingListText = buildShoppingList(this.recipe, this.scale);
      }
    }

    async copyShoppingList(): Promise<void> {
      try{
        await navigator.clipboard.writeText(this.shoppingListText);
        this.copyState = 'copied';
      }catch{
        // Denied, or no clipboard API at all. The list is on screen and
        // selectable either way, so say so rather than failing silently.
        this.copyState = 'failed';
      }

      if(this.copyResetTimer){
        clearTimeout(this.copyResetTimer);
      }
      this.copyResetTimer = setTimeout(() => { this.copyState = 'idle'; }, 4000);
    }

    get canShare(): boolean {
      return typeof navigator !== 'undefined' && !!navigator.share;
    }

    async shareShoppingList(): Promise<void> {
      try{
        await navigator.share({
          title: `${this.recipe.name} — shopping list`,
          text: this.shoppingListText
        });
      }catch{
        // Dismissing the share sheet rejects, and a cancelled share is not an
        // error worth putting on the page.
      }
    }

    /**
     * Takes the shopping list dialog down with the page it belongs to.
     *
     * Bootstrap appends the backdrop to <body> and puts .modal-open on it,
     * both outside the part of the DOM Angular owns. Leaving this page with
     * the dialog open — the back button is the easy way to do it — destroys
     * the dialog along with this component and leaves the backdrop behind: a
     * fixed, full-screen, invisible sheet above every route, with no dialog
     * left to press Escape on. Nothing on the site can be clicked or scrolled
     * after that, and only a reload clears it.
     *
     * Any backdrop still standing at this point is stale by definition, since
     * the page it belonged to is the one going away.
     */
    private dismissShoppingList(): void {
      const element = document.getElementById(RecipeComponent.SHOPPING_MODAL_ID);
      if(element){
        // Loaded as a global script, so it is reached through window rather
        // than imported, and guarded in case it has not loaded at all.
        (window as any).bootstrap?.Modal?.getInstance(element)?.dispose();
      }

      const backdrops = document.querySelectorAll('.modal-backdrop');
      if(!backdrops.length){
        return;
      }

      backdrops.forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
      // Bootstrap sets both inline while the dialog is up: overflow to stop the
      // page behind it scrolling, and padding to replace the scrollbar's width
      // so the layout does not jump.
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    }

    ngOnDestroy(): void {
      this.wakeLock.disable();
      this.dismissShoppingList();
      if(this.copyResetTimer){
        clearTimeout(this.copyResetTimer);
      }
    }

}

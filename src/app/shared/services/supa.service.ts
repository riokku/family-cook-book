import { Injectable } from '@angular/core';
import { Session, SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Recipe } from '../models/recipe.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SupaService {

  private supabaseClient: SupabaseClient;
  private authStateSubject = new BehaviorSubject<Session | null>(null);
  authState$ = this.authStateSubject.asObservable();

  private recipes: Recipe[] = [];

  constructor() {
    this.supabaseClient = createClient(environment.supabase.url, environment.supabase.key, {
      auth: {
        // Supabase uses navigator.locks (Web Locks API) for token serialization, but
        // Zone.js intercepts the resulting promise rejections and logs them as unhandled
        // errors. For a single-tab SPA there are no true concurrent auth writers, so
        // replacing the lock with a passthrough is safe and eliminates the noise.
        lock: (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn()
      }
    });
    this.supabaseClient.auth.onAuthStateChange((event, session) => {
      this.authStateSubject.next(session);
    });
  }


  //Sign up
  signUp(email: string, password: string){
    return this.supabaseClient.auth.signUp({
      email,
      password
    })
  }

  //Sign in
  signIn(email: string, password: string){
    return this.supabaseClient.auth.signInWithPassword({
      email,
      password
    })
  }

  //Get logged in user
  async getLoggedInUser(){
    const { data: { user } } = await this.supabaseClient.auth.getUser();
    return user;
  }

  //Logout
  async logout(){
    const { error } = await this.supabaseClient.auth.signOut();
    if(error){
      console.error(error);
      return false;
    };
    return true;
  }

  //Checks if user can access admin table in database, if so, set user as admin
  async checkAdminStatus(): Promise<boolean> {
    // The PostgREST client calls getSession() internally before attaching the JWT,
    // so no explicit getSession() call is needed here — doing so causes two
    // concurrent lock requests on the same Supabase auth lock key.
    const { data: admins } = await this.supabaseClient
      .from('admins')
      .select('*');
    return !!(admins && admins.length > 0);
  }


  //Invoke an edge function, attaching the current session JWT automatically
  async invokeFunction<T>(name: string, body: unknown): Promise<T> {
    const { data, error } = await this.supabaseClient.functions.invoke(name, { body });
    if (error) {
      console.error(`Edge function "${name}" failed:`, error);
      throw error;
    }
    return data as T;
  }


  //Recipe functions

  //Add new recipe
  async addRecipeNew(incomingRecipe: Recipe){
    const { data, error } = await this.supabaseClient
    .from('recipes')
    .insert([
      incomingRecipe
    ])
    .select();

    if(error){
      console.error(error);
    }
  }

  //Fetch all recipes
  async fetchRecipes():Promise<Recipe[]>{
    let { data: recipes, error } = await this.supabaseClient
    .from('recipes')
    .select('*');
    if(error){
      console.error(error)
    }
    this.recipes = recipes;
    return recipes
  }

  //Get specific recipe
  getRecipe(slug: string){
    return this.recipes.find(recipe => recipe.slug === slug);
  }

  //Update recipe
  async updateRecipe(updatedRecipe: Recipe){
    const { data, error } = await this.supabaseClient
    .from('recipes')
    .update(updatedRecipe)
    .eq('id', updatedRecipe.id)
    .select();

    if(error){
      console.error(error)
    }
  }

  //Delete recipe
  async deleteRecipe(toBeDeletedRecipeID: number){
    const { error } = await this.supabaseClient
    .from('recipes')
    .delete()
    .eq('id', toBeDeletedRecipeID)

    if(error){
      console.error(error)
    }
  }

  //Get featured recipes
  async getFeaturedRecipes(): Promise<Recipe[]>{
    return this.recipes.filter(recipe => recipe.featured);
  }

}

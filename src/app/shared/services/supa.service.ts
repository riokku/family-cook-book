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
    this.supabaseClient = createClient(environment.supabase.url, environment.supabase.key);
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
    if(user){
      console.log('Logged in user info: ', user);
    } else {
      console.log('Nobody is logged in');
    }
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
  async checkAdminStatus(){
    let { data: admins, error } = await this.supabaseClient
    .from('admins')
    .select('*');
    if(admins.length > 0){
      return true;
    } else {
      return false;
    }

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

    if(data){
      console.log('New recipe', data);
    }
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
  getRecipe(slug: string):any{
    return this.recipes.find(recipe => recipe.slug === slug);
  }


}

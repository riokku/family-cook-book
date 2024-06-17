import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})

export class SupaService {

  private supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = createClient(environment.supabase.url, environment.supabase.key)
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

  async checkAdminStatus(){
    let { data: admins, error } = await this.supabaseClient
    .from('admins')
    .select('*');

    if(admins.length > 0){
      return true;
    } else {
      console.error(error);
      return false;
    }

  }


  //Recipe functions

  async addRecipeNew(incomingRecipe: Recipe){
    const { data, error } = await this.supabaseClient
    .from('recipes')
    .insert([
      incomingRecipe
    ])
    .select()

    if(data){
      console.log('New recipe', data);
    }
    if(error){
      console.error(error);
    }

    console.log(incomingRecipe);

  }


}

// Must be imported before any Angular module to define $localize globally
// (required by @ng-bootstrap components that use Angular's i18n system)
import '@angular/localize/init';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   firebase: {
//     projectId: 'family-cook-book-b02f5',
//     appId: '1:702749183458:web:e2a5688b2bf3f78187bdbb',
//     databaseURL: 'https://family-cook-book-b02f5-default-rtdb.firebaseio.com',
//     storageBucket: 'family-cook-book-b02f5.appspot.com',
//     apiKey: 'AIzaSyDAH1PKpRYnyQ5isq8Mn7t8PP7Ffz6L8V4',
//     authDomain: 'family-cook-book-b02f5.firebaseapp.com',
//     messagingSenderId: '702749183458',
//   },
//   production: false,
//   firebaseAPIKey: 'AIzaSyDAH1PKpRYnyQ5isq8Mn7t8PP7Ffz6L8V4'
// };


export const environment = {
  production: true,
  supabase: {
    url: "https://cfdohsyuemvqcnkjfrfk.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZG9oc3l1ZW12cWNua2pmcmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcwMzM5NDIsImV4cCI6MjAzMjYwOTk0Mn0.S1yPYepNr0kQPC01ZTRPXBvd2Xml2Px5K4vGz279vYs"
  }
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

export const environment = {
  production: true,
  firebaseAPIKey: 'AIzaSyDAH1PKpRYnyQ5isq8Mn7t8PP7Ffz6L8V4',
  supabase: {
    url: "https://cfdohsyuemvqcnkjfrfk.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZG9oc3l1ZW12cWNua2pmcmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcwMzM5NDIsImV4cCI6MjAzMjYwOTk0Mn0.S1yPYepNr0kQPC01ZTRPXBvd2Xml2Px5K4vGz279vYs"
  }
  // Note: the Gemini API key is NOT here by design. It lives as the
  // GEMINI_API_KEY secret on the `scan-recipe` Supabase edge function so it
  // never ships to the browser.
};

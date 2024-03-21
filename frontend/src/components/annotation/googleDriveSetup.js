// googleDriveSetup.js
import { gapi } from 'gapi-script';

const clientId = "6557393626-pkvae2frkr2ethfi7t3gf5vvmo2tqvoi.apps.googleusercontent.com";
const clientSecret = "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"; // Generally not used in client-side flow
const scope = "https://www.googleapis.com/auth/drive.file";
const discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

export const initClient = (updateSignInStatus) => {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: clientSecret, // Optional for client-side requests
      clientId,
      discoveryDocs,
      scope,
    }).then(() => {
      // Listen for sign-in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

      // Handle the initial sign-in state
      updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  });
};

export const signIn = () => {
  gapi.auth2.getAuthInstance().signIn();
};

export const signOut = () => {
  gapi.auth2.getAuthInstance().signOut();
};

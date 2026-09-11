const firebaseConfig = {
  apiKey: "AIzaSyCWSBgfLvE9LogM5qUDJNAR1KhJuglCq9E",
  authDomain: "ghbadge-tracker.firebaseapp.com",
  projectId: "ghbadge-tracker",
  storageBucket: "ghbadge-tracker.firebasestorage.app",
  messagingSenderId: "444929177629",
  appId: "1:444929177629:web:aa68b34a5be5f00ebeeef4",
  measurementId: "G-P1B0PX1PJP"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Set up the GitHub provider and request the 'repo' scope 
// so we can read private repos and commits just like the PAT did.
const githubProvider = new firebase.auth.GithubAuthProvider();
githubProvider.addScope('repo');

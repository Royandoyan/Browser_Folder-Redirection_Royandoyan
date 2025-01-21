import { auth, db } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showSignin = document.getElementById('showSignin');

    // Toggle Sign-In and Sign-Up forms
    showSignup.addEventListener('click', () => {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    showSignin.addEventListener('click', () => {
        signupForm.style.display = 'none';
        signinForm.style.display = 'block';
    });

    // Sign-In
    document.getElementById('signinBtn').addEventListener('click', async () => {
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user);
            localStorage.setItem('currentUserEmail', email);
            window.location.href = "home.html";
        } catch (error) {
            console.error('Error during login:', error.message);
            alert('Login failed. Please check your credentials.');
        }
    });

    // Sign-Up
    document.getElementById('signupBtn').addEventListener('click', async () => {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('fullName').value;
        const age = document.getElementById('age').value;
        const address = document.getElementById('address').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                fullName,
                age,
                address,
                email: user.email,
                uid: user.uid
            });
            

            alert('Sign-up successful! Redirecting...');
            window.location.href = "index.html";
        } catch (error) {
            console.error('Error during sign-up:', error.message);
            alert('Sign-up failed. Please try again.');
        }
    });
});

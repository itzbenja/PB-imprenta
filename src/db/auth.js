/**
 * auth.js — Firebase Email/Password authentication helpers.
 */

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase.js';

export function getCurrentUser() {
  return auth.currentUser;
}

export function isLoggedIn() {
  return auth.currentUser !== null;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function login(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await signOut(auth);
}

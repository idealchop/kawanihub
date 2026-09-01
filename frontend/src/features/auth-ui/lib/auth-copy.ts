/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '@/config/brand';
import { type AppLocale, pickCopy } from '@/lib/locale';
import { localCredentials } from './local-credentials';

const copy = {
  en: {
    signInTitle: `Sign in to ${brand.productName}`,
    signUpTitle: `Create your ${brand.productName} account`,
    usernameLabel: 'Username',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submitSignIn: 'Sign in',
    submitSignUp: 'Create account',
    toggleToSignUp: 'Need an account? Sign up',
    toggleToSignIn: 'Already have an account? Sign in',
    demoHint: `Local webapp — no Firebase. Username: ${localCredentials.username} · Password: ${localCredentials.password}`,
    invalidCredentials: 'Invalid username or password.',
    resetSent: 'Password reset email sent.',
    demoReset: 'Local mode has no email reset. Use admin / password.',
  },
  fil: {
    signInTitle: `Mag-sign in sa ${brand.productName}`,
    signUpTitle: `Gumawa ng ${brand.productName} account`,
    usernameLabel: 'Username',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submitSignIn: 'Mag-sign in',
    submitSignUp: 'Gumawa ng account',
    toggleToSignUp: 'Walang account? Mag-sign up',
    toggleToSignIn: 'May account na? Mag-sign in',
    demoHint: `Lokal na webapp — walang Firebase. Username: ${localCredentials.username} · Password: ${localCredentials.password}`,
    invalidCredentials: 'Mali ang username o password.',
    resetSent: 'Naipadala ang password reset email.',
    demoReset: 'Walang email reset sa local mode. Gamitin ang admin / password.',
  },
} as const;

export function getAuthCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}

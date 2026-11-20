import { type FormEvent, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { KeyRound, Lock, Mail, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DashboardView } from './DashboardView';

export function TeacherPortal() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSubmitting(false);
    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        setAuthError('Email atau kata sandi salah. Pastikan akun guru sudah dibuat di Supabase.');
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        setAuthError(
          'Email belum dikonfirmasi. Centang "Auto Confirm User" saat membuat akun di Supabase Dashboard.'
        );
      } else {
        setAuthError(error.message);
      }
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setPassword('');
  }

  if (checkingSession) {
    return (
      <div className="guru-auth-page">
        <div className="guru-auth-card">
          <p className="guru-loading-text">Memeriksa sesi autentikasi guru...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <DashboardView
        teacherEmail={session.user.email}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="guru-auth-page">
      <div className="guru-auth-card">
        <div className="guru-auth-head">
          <div className="guru-auth-icon">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="eyebrow">Akses Khusus Guru</span>
            <h1>Gerbang Database Portal ICT</h1>
            <p>
              Masuk dengan akun guru Supabase untuk mengelola materi, tugas, nilai, karya, dan
              migrasi spreadsheet tanpa melalui halaman siswa.
            </p>
          </div>
        </div>

        {authError ? (
          <div className="dash-feedback err">
            <AlertTriangle size={16} />
            <span>{authError}</span>
          </div>
        ) : null}

        <form className="dash-form" onSubmit={handleLogin}>
          <label htmlFor="guru-email">
            <Mail size={12} className="inline-icon" /> Email Guru
          </label>
          <input
            id="guru-email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@guru.smp.belajar.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="guru-pass">
            <KeyRound size={12} className="inline-icon" /> Kata Sandi
          </label>
          <input
            id="guru-pass"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn-block dash-submit-btn" disabled={submitting}>
            <Lock size={15} />
            <span>{submitting ? 'Memverifikasi...' : 'Masuk ke Dashboard Database'}</span>
          </button>
        </form>

        <div className="guru-setup-guide">
          <strong>Cara Menyiapkan Akun Guru (Sekali Saja):</strong>
          <ol>
            <li>
              Buka <strong>Supabase Dashboard → Authentication → Users</strong>.
            </li>
            <li>
              Klik <strong>Add User → Create new user</strong>, masukkan email &amp; password guru,
              lalu centang <strong>Auto Confirm User</strong>.
            </li>
            <li>
              Agar publik/siswa tidak bisa mendaftar, matikan opsi{' '}
              <strong>Allow new users to sign up</strong> di{' '}
              <em>Authentication → Providers → Email</em>.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile } from '../api/endpoints';
import { site as defaults } from '../config/site';

const ProfileContext = createContext({ profile: null, refresh: () => {} });

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);

  const refresh = useCallback(async (signal) => {
    try {
      const res = await getProfile(signal);
      setProfile(res.data);
    } catch {
      /* keep the defaults from config/site.js if the API is unreachable */
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const value = useMemo(() => ({ profile, refresh: () => refresh() }), [profile, refresh]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext);

const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

/** Site details: values saved in the admin dashboard override config/site.js. */
export function useSite() {
  const { profile } = useProfile();

  return useMemo(() => {
    if (!profile) return defaults;
    const pick = (key) => (profile[key] ? profile[key] : defaults[key]);
    const name = pick('name');
    const paragraphs = (profile.bio || '')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    return {
      ...defaults,
      name,
      initials: initialsOf(name) || defaults.initials,
      role: pick('role'),
      tagline: pick('tagline'),
      description: pick('description'),
      email: pick('email'),
      github: pick('github'),
      linkedin: pick('linkedin'),
      photo: profile.photo?.url || defaults.photo,
      bio: paragraphs.length ? paragraphs : defaults.bio,
    };
  }, [profile]);
}

/** Last path segment of a profile URL, e.g. "dipakhore979" (used as a display handle). */
export const handleFromUrl = (url = '') => url.replace(/\/+$/, '').split('/').pop() || url;


-- 1) Recovery code + name lock columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS recovery_code TEXT,
  ADD COLUMN IF NOT EXISTS name_locked BOOLEAN NOT NULL DEFAULT true;

-- backfill recovery codes for existing players
UPDATE public.profiles
  SET recovery_code = upper(substring(md5(random()::text || id::text) from 1 for 10))
  WHERE recovery_code IS NULL;

-- 2) Lock down PII: restrict column-level SELECT (recovery_code unreadable via Data API)
REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (
  id, username, display_name, avatar_url, country, favorite_club, bio,
  rating, wins, losses, draws, goals_scored, goals_conceded,
  tournaments_played, tournaments_won, created_at, updated_at,
  fb_name, contact_number, fb_profile_link, dob, district,
  current_location, playing_device, konami_uid, blood_group, name_locked
) ON public.profiles TO authenticated;

GRANT SELECT (
  id, username, display_name, avatar_url, country, favorite_club, bio,
  rating, wins, losses, draws, goals_scored, goals_conceded,
  tournaments_played, tournaments_won, created_at, updated_at,
  fb_name, district, playing_device, blood_group
) ON public.profiles TO anon;

GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 3) UPDATE policy: own or staff
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users update own or staff updates any"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_staff(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_staff(auth.uid()));

-- 4) Trigger: only staff can change display_name / fb_name / username
CREATE OR REPLACE FUNCTION public.enforce_name_lock()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    IF NEW.fb_name IS DISTINCT FROM OLD.fb_name
       OR NEW.display_name IS DISTINCT FROM OLD.display_name
       OR NEW.username IS DISTINCT FROM OLD.username THEN
      RAISE EXCEPTION 'Name change is locked. Contact an admin to update your name.';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS enforce_name_lock_trigger ON public.profiles;
CREATE TRIGGER enforce_name_lock_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_name_lock();

-- 5) Secure access to recovery_code (only the user or staff)
CREATE OR REPLACE FUNCTION public.get_recovery_code(_user_id uuid)
RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _code TEXT;
BEGIN
  IF auth.uid() = _user_id OR public.is_staff(auth.uid()) THEN
    SELECT recovery_code INTO _code FROM public.profiles WHERE id = _user_id;
    RETURN _code;
  END IF;
  RAISE EXCEPTION 'forbidden';
END; $$;
REVOKE ALL ON FUNCTION public.get_recovery_code(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_recovery_code(uuid) TO authenticated;

-- Allow staff to reset a user's recovery code
CREATE OR REPLACE FUNCTION public.regenerate_recovery_code(_user_id uuid)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _code TEXT;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  _code := upper(substring(md5(random()::text || _user_id::text || clock_timestamp()::text) from 1 for 10));
  UPDATE public.profiles SET recovery_code = _code WHERE id = _user_id;
  RETURN _code;
END; $$;
REVOKE ALL ON FUNCTION public.regenerate_recovery_code(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.regenerate_recovery_code(uuid) TO authenticated;

-- 6) Admin name-change helper (bypasses lock by running as definer)
CREATE OR REPLACE FUNCTION public.admin_update_player_name(
  _user_id uuid, _username TEXT, _display_name TEXT, _fb_name TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.profiles
    SET username = COALESCE(NULLIF(_username, ''), username),
        display_name = COALESCE(NULLIF(_display_name, ''), display_name),
        fb_name = COALESCE(NULLIF(_fb_name, ''), fb_name)
    WHERE id = _user_id;
END; $$;
REVOKE ALL ON FUNCTION public.admin_update_player_name(uuid, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_player_name(uuid, TEXT, TEXT, TEXT) TO authenticated;

-- 7) Update handle_new_user to also generate a recovery code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _username TEXT;
  _code TEXT;
BEGIN
  _username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1));
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) LOOP
    _username := _username || floor(random()*1000)::text;
  END LOOP;
  _code := upper(substring(md5(random()::text || NEW.id::text) from 1 for 10));
  INSERT INTO public.profiles (id, username, display_name, recovery_code)
    VALUES (NEW.id, _username, COALESCE(NEW.raw_user_meta_data->>'display_name', _username), _code);
  IF NEW.email = 'mrfaikmahmud@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'super_admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'player') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

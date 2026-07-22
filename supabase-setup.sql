-- =====================================================
-- Aysu & Elshen Wedding - Supabase Cədvəl Qurulması
-- Bu SQL-i Supabase Dashboard > SQL Editor-də işlədin
-- =====================================================

-- 1. Wishes (Təbriklər) cədvəlini yarat
CREATE TABLE IF NOT EXISTS wishes (
    id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    name       TEXT        NOT NULL CHECK (char_length(name) <= 100),
    message    TEXT        NOT NULL CHECK (char_length(message) <= 1000),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security (RLS) aktiv et
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- 3. Hər kəs oxuya bilsin (qonaqlara mesajları göstərmək üçün)
CREATE POLICY "Hamı oxuya bilər" ON wishes
    FOR SELECT USING (true);

-- 4. Hər kəs yaza bilsin (qonaqlar təbrik yaza bilsin)
CREATE POLICY "Hamı əlavə edə bilər" ON wishes
    FOR INSERT WITH CHECK (true);

-- 5. Silmə (admin panel üçün)
CREATE POLICY "Hamı silə bilər" ON wishes
    FOR DELETE USING (true);

-- =====================================================
-- Qurulum tamamlandı!
-- Vercel Environment Variables üçün:
--   SUPABASE_URL    → Project Settings > API > Project URL
--   SUPABASE_ANON_KEY → Project Settings > API > anon public key
-- =====================================================

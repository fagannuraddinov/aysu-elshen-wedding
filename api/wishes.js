/**
 * Vercel Serverless Function — /api/wishes
 * Supabase ilə GET, POST, DELETE əməliyyatları
 */
const { createClient } = require('@supabase/supabase-js');

// Supabase client — environment variables Vercel dashboard-da təyin edilir
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
    // CORS Başlıqları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS (preflight) sorğusu
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    try {
        // ── GET /api/wishes ── Bütün mesajları gətir
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('wishes')
                .select('id, name, message, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Köhnə frontend-lə uyğunluq üçün created_at → timestamp
            const wishes = data.map(w => ({ ...w, timestamp: w.created_at }));
            return res.status(200).json(wishes);
        }

        // ── POST /api/wishes ── Yeni mesaj əlavə et
        if (req.method === 'POST') {
            const { name, message } = req.body;

            if (!name || !message) {
                return res.status(400).json({ error: 'Ad və mesaj mütləqdir' });
            }

            const { data, error } = await supabase
                .from('wishes')
                .insert([{
                    name:    name.substring(0, 100),
                    message: message.substring(0, 1000)
                }])
                .select()
                .single();

            if (error) throw error;

            return res.status(201).json({
                success: true,
                wish: { ...data, timestamp: data.created_at }
            });
        }

        // ── DELETE /api/wishes?id=xxx ── Mesajı sil (admin panel)
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'ID parametri mütləqdir' });
            }

            const { error } = await supabase
                .from('wishes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Metod dəstəklənmir' });

    } catch (err) {
        console.error('API Xətası:', err.message);
        return res.status(500).json({ error: 'Server xətası baş verdi' });
    }
};

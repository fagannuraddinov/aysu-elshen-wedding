/**
 * Vercel Serverless Function — /api/wishes
 * Supabase ilə GET, POST, DELETE əməliyyatları
 */
const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;
function getSupabase() {
    if (!supabaseClient) {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY is missing in Environment Variables");
        }
        supabaseClient = createClient(url, key);
    }
    return supabaseClient;
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
    // CORS Başlıqları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS (preflight) sorğusu
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    try {
        const supabase = getSupabase();

        // ── GET /api/wishes ── Bütün mesajları gətir
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('wishes')
                .select('id, name, message, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const wishes = (data || []).map(w => ({ ...w, timestamp: w.created_at }));
            return sendJson(res, 200, wishes);
        }

        // ── POST /api/wishes ── Yeni mesaj əlavə et
        if (req.method === 'POST') {
            let bodyData = req.body;
            if (typeof bodyData === 'string') {
                try { bodyData = JSON.parse(bodyData); } catch (e) {}
            }

            const { name, message } = bodyData || {};

            if (!name || !message) {
                return sendJson(res, 400, { error: 'Ad və mesaj mütləqdir' });
            }

            const { data, error } = await supabase
                .from('wishes')
                .insert([{
                    name:    String(name).substring(0, 100),
                    message: String(message).substring(0, 1000)
                }])
                .select()
                .single();

            if (error) throw error;

            return sendJson(res, 201, {
                success: true,
                wish: { ...data, timestamp: data.created_at }
            });
        }

        // ── DELETE /api/wishes?id=xxx ── Mesajı sil (admin panel)
        if (req.method === 'DELETE') {
            const id = req.query ? req.query.id : null;

            if (!id) {
                return sendJson(res, 400, { error: 'ID parametri mütləqdir' });
            }

            const { error } = await supabase
                .from('wishes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return sendJson(res, 200, { success: true });
        }

        return sendJson(res, 405, { error: 'Metod dəstəklənmir' });

    } catch (err) {
        console.error('API Xətası:', err.message);
        return sendJson(res, 500, { error: err.message || 'Server xətası baş verdi' });
    }
};

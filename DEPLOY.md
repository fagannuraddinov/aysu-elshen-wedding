# 🎉 Aysu & Elşən — Vercel + Supabase Deploy Təlimatı

## Ümumi baxış
- **Frontend + API:** Vercel (pulsuz)
- **Veritabanı:** Supabase (pulsuz)
- **Domen:** Vercel avtomatik `xxx.vercel.app` verir

---

## Addım 1 — Supabase Qurulması

### 1.1 Hesab yarat
1. [supabase.com](https://supabase.com) → **Start your project** (GitHub ilə giriş)
2. **New project** düyməsinə basın
3. Layihə adı: `aysu-elshen-wedding`
4. Database Password: istədiyiniz şifrə (saxlayın!)
5. Region: `Frankfurt (EU Central)` seçin (Azərbaycana ən yaxın)
6. **Create new project** → 1-2 dəqiqə gözləyin

### 1.2 Cədvəl yarat
1. Sol menyudan **SQL Editor** seçin
2. `supabase-setup.sql` faylının içindəki bütün kodu kopyalayın
3. SQL Editor-ə yapışdırın və **Run** düyməsinə basın
4. ✅ "Success" mesajı görünməlidir

### 1.3 API açarlarını götürün
1. Sol menyudan **Project Settings** → **API** seçin
2. Bu iki dəyəri kopyalayın:
   - **Project URL** → `SUPABASE_URL` üçün
   - **anon public** key → `SUPABASE_ANON_KEY` üçün

---

## Addım 2 — Vercel Deploy

### 2.1 Vercel hesabı
1. [vercel.com](https://vercel.com) → **Sign Up** (GitHub ilə giriş)

### 2.2 Layihəni import et
1. Vercel Dashboard-da **Add New Project** düyməsinə basın
2. GitHub hesabınızı qoşun
3. `aysu-elshen-wedding` reposunu tapın → **Import** düyməsinə basın

### 2.3 Environment Variables əlavə et
Deploy etməzdən əvvəl, **Environment Variables** bölməsində:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Supabase-dən kopyaladığınız Project URL |
| `SUPABASE_ANON_KEY` | Supabase-dən kopyaladığınız anon key |

### 2.4 Deploy et
- **Deploy** düyməsinə basın
- 1-2 dəqiqə gözləyin
- ✅ `https://aysu-elshen-wedding-xxx.vercel.app` linki alacaqsınız!

---

## Addım 3 — Test

1. Saytı açın → zərfi açın → mesaj yazın → göndərin
2. Supabase Dashboard-da **Table Editor** → `wishes` cədvəlini yoxlayın
3. Admin paneli: `https://sizin-url.vercel.app/admin.html` (şifrə: `admin123`)

---

## Yerli Test (Localhost)

Yerli testlər üçün köhnə `server.js` hələ də işləyir:
```bash
node server.js
# → http://localhost:8080
```

Yeni Vercel API-ni yerli test etmək üçün:
1. `.env.local` faylı yaradın:
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJxxx...
   ```
2. `npx vercel dev` işlədin

---

## Fayl Strukturu

```
aysu-elshen-wedding/
├── api/
│   └── wishes.js          ← Vercel serverless function (Supabase API)
├── index.html             ← Əsas dəvətnamə
├── admin.html             ← Admin panel
├── styles.css             ← Dizayn
├── script.js              ← Frontend JavaScript
├── server.js              ← Yerli development server (Vercel istifadə etmir)
├── db.json                ← Yerli database (Vercel istifadə etmir)
├── background.png         ← Arxa fon şəkli
├── track.m4a              ← Musiqi
├── package.json           ← Supabase paketi
├── vercel.json            ← Vercel konfiqurasiyası
└── supabase-setup.sql     ← Supabase cədvəl yaratmaq üçün SQL
```

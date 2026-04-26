# CAM-O Geliştirme Listesi

> Proje: Kamera Fiyat & Kar Hesaplama Uygulaması  
> Analiz Tarihi: 2026-04-26 | Son Güncelleme: 2026-04-26  
> Teknoloji: Vanilla JS + Node.js/Express + PWA

---

## 🔴 KRİTİK (Güvenlik / Veri Kaybı)

### GÜV-01 — PIN ve Admin Key Şifrelemesi
- **Sorun:** PIN ve admin anahtarı `btoa()` ile Base64 olarak saklanıyor. Base64 şifreleme değil, sadece kodlamadır; herhangi biri kolayca çözebilir.
- **Çözüm:** `crypto.subtle.digest` veya PBKDF2 ile hash'lenerek saklanmalı.
- **Dosya:** `index.html` ~1273. satır

### GÜV-02 — GitHub Token Güvenliği
- **Sorun:** GitHub Gist token'ı `localStorage`'da düz metin olarak tutuluyor. DevTools ile kolayca görülebilir.
- **Çözüm:** Token'ı `sessionStorage`'da tutmak veya kullanıcıya her oturumda girmesini istemek.
- **Dosya:** `index.html` — Gist yapılandırma bölümü

### GÜV-03 — Sunucu Tarafı Veri Doğrulama Yok
- **Sorun:** `server.js` gelen JSON verisini hiç doğrulamadan `data.json`'a yazıyor. Bozuk veya kötü amaçlı veri tüm cihazlara yayılabilir.
- **Çözüm:** JSON şema doğrulaması (örn. `ajv`) ekle.
- **Dosya:** `server.js`

### GÜV-04 — Rate Limiting Yok
- **Sorun:** Sunucuda istek sınırlama yok; brute-force ve DoS saldırılarına açık.
- **Çözüm:** `express-rate-limit` paketi ile `/sync` ve `/update` endpoint'lerine limit ekle.
- **Dosya:** `server.js`

### GÜV-05 — Başarısız Giriş Kilitleme Yok
- **Sorun:** PIN ekranında yanlış giriş denemesi sınırlaması yok; sonsuz deneme yapılabilir.
- **Çözüm:** 5 yanlış denemeden sonra 30 saniyelik bekleme süresi ekle.
- **Dosya:** `index.html` — `checkPin()` fonksiyonu

---

## 🟠 YÜKSEK ÖNCELİK (Eksik İşlev / Kullanılabilirlik)

### ÖNL-01 — PDF / Teklif Çıktısı ✅ TAMAMLANDI
- Detay modalında "🖨 Yazdır" butonu eklendi. `window.print()` ile temiz teklif sayfası açılıyor; tarayıcıdan PDF olarak kaydedilebiliyor.

### ÖNL-02 — Negatif Fiyat / Miktar Girişi Engelleme ✅ TAMAMLANDI
- `updateMat()`, `updateMatFromList()`, `addProductWithQty()` fonksiyonlarına `Math.max(0, ...)` koruması eklendi.

### ÖNL-03 — Proje Arama & Filtreleme ✅ TAMAMLANDI
- Geçmiş sekmesine anlık arama kutusu eklendi. Müşteri adı, tarih ve nota göre filtreler.

### ÖNL-04 — Tarayıcı `confirm()` / `prompt()` Kaldırıldı ✅ TAMAMLANDI
- 9 farklı yerdeki `confirm()` ve `prompt()` çağrısı özel modal sistemine taşındı.
- Confirm modal: iptal butonu, ESC tuşu, backdrop click destekli.
- Admin key modal: fiyat listesi senkronizasyonu için güvenli giriş.

### ÖNL-05 — Ortam Değişkenleri (.env) Desteği
- **Sorun:** PORT, labor oranı (0.30), minimum labor (4000 TL) ve Gist dosya adı kod içinde sabit yazılı.
- **Çözüm:** `.env` dosyası ve `dotenv` paketi ile yapılandırılabilir hale getir.
- **Dosya:** `server.js`, `index.html`

### ÖNL-06 — Aynı Ürünün Tekrar Eklenmesi ✅ TAMAMLANDI
- `addProductWithQty()` güncellendi: aynı ürün + aynı fiyat zaten listede varsa miktar artıyor, yeni satır açılmıyor.

### ÖNL-07 — Ürün Arama ✅ TAMAMLANDI
- Hesaplama sekmesine anlık arama kutusu eklendi. Arama sırasında gruplar otomatik açılıyor, subgruplar doğrudan listeleniyor.

### ÖNL-08 — Çevrimdışı Değişiklik Kuyruğu (Server Modu)
- **Sorun:** Gist modunda bekleyen değişiklikler takip ediliyor ama Server modunda çevrimdışıyken yapılan değişiklikler kaybolabilir.
- **Çözüm:** Server modunda da yerel değişiklik kuyruğu (pending queue) ekle.

### ÖNL-09 — Öneri Teklif Fiyatı ✅ TAMAMLANDI
- Teklif kutusunun altına %20 / %30 / %40 kar marjına göre 3 öneri butonu eklendi.
- Fiyatlar psikolojik olarak en yakın 50 TL'ye yuvarlanıyor. Tıklanınca teklif alanına otomatik uygulanıyor.

---

## 🟡 ORTA ÖNCELİK (Kalite / Bakım)

### KAL-01 — Monolitik Yapı Bölünmeli
- **Sorun:** Tüm uygulama 1.900 satırlık tek bir HTML dosyasında; bakımı ve hata ayıklaması çok zor.
- **Çözüm:** CSS ayrı dosyaya, JS modüllere (hesaplama, geçmiş, senkronizasyon, UI) bölünmeli. En azından `<script src="app.js">` ayrımı yapılmalı.

### KAL-02 — Sabit Sayılar Sabitlenmeli
- **Sorun:** `30000`, `300000`, `15 * 60 * 1000`, `4000` gibi sihirli sayılar kod içine gömülü.
- **Çözüm:** Dosyanın tepesinde `const HEARTBEAT_MS = 30_000` gibi sabitler tanımla.
- **Dosya:** `index.html` ~54, 657, 1748. satırlar

### KAL-03 — Hata Yönetimi Tutarsız
- **Sorun:** Bazı `fetch` çağrıları `.catch(() => {})` ile sessizce başarısız oluyor; kullanıcıya bilgi verilmiyor.
- **Çözüm:** Tüm hataları merkezi `handleError()` fonksiyonundan geçir ve kullanıcıya toast göster.

### KAL-04 — Sunucu Güvenlik Başlıkları Ekle
- **Sorun:** Express sunucusu CORS, CSP veya temel güvenlik başlıkları göndermiyor.
- **Çözüm:** `helmet` paketi ekle; sadece yerel ağdan gelen isteklere izin ver.
- **Dosya:** `server.js`

### KAL-05 — Sunucu İstek Loglama
- **Sorun:** Sunucuda hiç log yok; bağlanan cihazları veya hataları takip etmek imkânsız.
- **Çözüm:** `morgan` paketi ile istek loglama ekle.
- **Dosya:** `server.js`

### KAL-06 — HTTPS Desteği (Yerel Ağ)
- **Sorun:** Uygulama HTTP üzerinden çalışıyor; özellikle token ve pin iletimi şifresiz.
- **Çözüm:** `start.bat/sh` içinde self-signed sertifika ile HTTPS sunucusu başlat.

### KAL-07 — İşçilik Oranı Kullanıcı Tarafından Ayarlanabilmeli
- **Sorun:** İşçilik oranı %30 ve minimum 4.000 TL sabit kodlu; farklı işler veya müşteriler için değiştirilemez.
- **Çözüm:** Ayarlar sekmesine işçilik oranı ve minimum tutarı düzenlenebilir alan ekle.

### KAL-08 — Veri Yedekleme
- **Sorun:** Otomatik yedekleme yok; Gist entegrasyonu kesilirse veri kaybı riski var.
- **Çözüm:** Ayarlar sekmesine "JSON olarak dışa aktar / içe aktar" butonu ekle.

---

## 🟢 DÜŞÜK ÖNCELİK (Geliştirme / Niceleme)

### GEL-01 — Karanlık Mod
- **Sorun:** CSS değişkenleri tanımlı ama tema değiştirici yok.
- **Çözüm:** `prefers-color-scheme` medya sorgusu ve manuel toggle ekle.

### GEL-02 — Kar Analitik Paneli
- **Sorun:** Aylık/müşteri bazlı kar özeti yok; büyük resmi görmek imkânsız.
- **Çözüm:** Geçmiş sekmesine toplam proje sayısı, toplam ciro, ortalama kar marjı gibi özet kartlar ekle.

### GEL-03 — CSV Dışa Aktarma
- **Sorun:** Proje geçmişi CSV formatında dışa aktarılamıyor; Excel'de analiz yapılamıyor.
- **Çözüm:** Geçmiş sekmesine "CSV'ye Aktar" butonu ekle.

### GEL-04 — Baskı Dostu Görünüm
- **Sorun:** `@media print` CSS kuralı yok; tarayıcıdan yazdırınca kötü görünüyor.
- **Çözüm:** Baskı için gereksiz öğeleri (butonlar, menü) gizleyen `@media print` kuralları ekle.

### GEL-05 — Erişilebilirlik (a11y) İyileştirmeleri
- **Sorun:** Bazı inputlarda `<label>` yok; ARIA attribute eksik; klavye navigasyonu tamamlanmamış.
- **Çözüm:** Tüm formlara uygun `<label for>` ve gerekli `aria-label` ekle.

### GEL-06 — Readme ve Kurulum Belgesi
- **Sorun:** Projede `README.md` yok; yeni kişi nasıl kuracağını bilemiyor.
- **Çözüm:** Kurulum adımları, ortam değişkenleri ve Gist yapılandırması açıklayan `README.md` oluştur.

### GEL-07 — Mobilk Görünüm İyileştirmesi
- **Sorun:** Viewport genişliği 700px olarak sabitlenmiş; küçük ekranlarda öğeler taşıyor.
- **Çözüm:** Responsive breakpoint'ler ekle; 375px genişliğe kadar düzgün görünsün.

### GEL-08 — Ürün Grubu Sıralama
- **Sorun:** Fiyat listesinde ürün grupları sürükle-bırak ile yeniden sıralanamıyor.
- **Çözüm:** Grup ve ürün sırası için `draggable` API veya basit yukarı/aşağı butonları ekle.

---

## Özet Tablo

| Öncelik | Adet | Kategoriler |
|---------|------|-------------|
| 🔴 Kritik | 5 | Güvenlik, Veri Bütünlüğü |
| 🟠 Yüksek | 8 | Eksik Özellik, UX |
| 🟡 Orta | 8 | Kod Kalitesi, Altyapı |
| 🟢 Düşük | 8 | Ekstra Özellik |
| **Toplam** | **29** | |

---

## Önerilen Uygulama Sırası

1. **GÜV-02** (GitHub token güvenliği) — Kolay ve kritik
2. **ÖNL-02** (Negatif değer engeli) — 10 dakika
3. **ÖNL-04** (Modal diyaloglar) — UX büyük iyileşme
4. **GÜV-01** (PIN şifrelemesi) — Güvenlik temeli
5. **ÖNL-01** (PDF teklif çıktısı) — Müşteri değeri
6. **ÖNL-03** (Proje arama) — Günlük kullanım konforu
7. **KAL-07** (İşçilik oranı ayarı) — Esneklik
8. **KAL-08** (JSON yedekleme) — Veri güvenliği

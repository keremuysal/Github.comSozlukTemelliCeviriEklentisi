# GitHub Türkçe Extension - Geliştirme Günlüğü

## Özet
Bu belge, **GitHub Türkçe Chrome Extension** projesinin sıfırdan oluşturulması ve geliştirilmesi sürecini adım adım içermektedir.

**🎉 Son Hal**: Sözlük tabanlı çeviri sistemi stabil ve döngü korumalı ✅

---

## 📋 Aşama 12: Stabilizasyon ve Sonsuz Döngü Düzeltmesi

**Tarih**: April 2026  
**Amaç**: MutationObserver kaynaklı tekrar çeviri döngüsünü ve metin şişmesini engellemek

### Yapılan İşler:
- ✅ `dictMap` ve `masterRegex` bağlama hatası düzeltildi
- ✅ Sözlük yüklendikten sonra `document.body` için yeniden çeviri tetiklemesi eklendi
- ✅ Node bazlı idempotent çeviri için `WeakMap` tabanlı takip eklendi
- ✅ Aynı node'un kendi üretilen sonucu tekrar işleme alması engellendi
- ✅ "Sponsor ol ol ol..." tipindeki zincirleme büyüme sorunu giderildi
- ✅ Aşırı debug log çıktı gürültüsü azaltıldı

### Sonuç:
- ✅ Sonsuz döngü davranışı kaldırıldı
- ✅ Çeviri akışı daha stabil hale geldi

---

## 📋 Aşama 13: Mimari Sadeleştirme (Sözlük-Only)

**Tarih**: April 2026  
**Amaç**: Gereksiz API/arka plan bileşenlerini kaldırıp eklentiyi sadeleştirmek

### Yapılan İşler:
- ✅ `background.js` kaldırıldı
- ✅ Manifest'ten service worker bağımlılığı kaldırıldı
- ✅ API/rate limit/cache odaklı kullanılmayan kod blokları temizlendi
- ✅ Çeviri akışı yalnızca yerel sözlük üzerinden çalışacak şekilde netleştirildi

---

## 📋 Aşama 1: Temel Sözlük Oluşturması

**Tarih**: April 2026  
**Amaç**: GitHub UI'ının önemli terimlerini Türkçe sözlüğe eklemek

### Yapılan İşler:
- ✅ 250+ GitHub teknoloji teriminin Türkçe karşılıklarını oluşturma
- ✅ Sözlüğü A-D, E-L, M-R, S-Z şeklinde kategorilere ayırma
- ✅ "-ing" ve plural "s" suffix formlarını ekleme
- ✅ Örnek terimler:
  - `"pull request"` → `"Değişiklik İsteği (Pull Request)"`
  - `"branch"` → `"Dal (Branch)"`
  - `"commit"` → `"İşleme (Commit)"`
  - `"watching"` → `"İzleme"`
  - `"committing"` → `"İşleme Yapma"`

**Dosya**: `content.js` (githubDictionary)

---

## 📋 Aşama 2: Popup Panel ve UI Oluşturması

**Amaç**: Kullanıcıya sözlük bilgilerini ve kontrol paneli göstermek

### Yapılan İşler:
- ✅ `popup.html` oluşturma
  - GitHub Türkçe logo ve başlık
  - Durum göstergesi (Aktif/Pasif)
  - Sözlük girişi sayısı (dinamik)
  - Manifest sürümü
  - 4 ana özellik listesi

- ✅ `popup.css` oluşturma
  - Dark theme (GitHub-uyumlu)
  - CSS variables ile renk yönetimi
  - Responsive tasarım

- ✅ `popup.js` oluşturma
  - content.js'den sözlük boyutunu alma (chrome.tabs.sendMessage)
  - Popup açıldığında GitHub sayfasını kontrol etme

**Dosyalar**: `popup.html`, `popup.css`, `popup.js`

---

## 📋 Aşama 3: CSP (Content Security Policy) Hataları Çözümü

**Sorun**: Manifest V3 inline `<style>` ve `<script>` etiketlerini engelledi

### Yapılan İşler:
- ✅ Inline CSS'i `popup.css` dış dosyasına taşıma
- ✅ Inline script'i `popup.js` dış dosyasına taşıma
- ✅ Google Fonts `@import`'ını kaldırma (sistem fontlarını kullanma)
- ✅ manifest.json'a uygun izinleri ekleme

---

## 📋 Aşama 4: Toggle Switch Uygulaması

**Amaç**: Kullanıcının extension'ı açıp kapatabilmesini sağlamak

### Yapılan İşler:
- ✅ HTML'e toggle switch inputu ekleme
- ✅ iOS-style toggle switch CSS'i yazma
- ✅ `popup.js`'ye toggle event handler'ı ekleme
- ✅ `chrome.storage.local` ile durumu kaydetme
- ✅ Toggle açıldığında status badge'i "Aktif" ↔ "Pasif" değiştirme

---

## 📋 Aşama 5: Durum Yönetimi (State Management)

**Amaç**: Sayfa refresh'lense bile toggle durumunun korunması

### Yapılan İşler:
- ✅ `content.js`'de `extensionEnabled` state variable'ı
- ✅ `initializeExtension()` fonksiyonu ile storage'dan durumu yükleme
- ✅ Pasif modda çeviri yapılmıyor (performans)
- ✅ Aktif modda toggle'ı açarken `translateSubtree()` çağrılıyor

---

## 📋 Aşama 6: Hybrid Çeviri Sistemi v1 (MyMemory API)

**Amaç**: Sözlükte olmayan kelimeleri otomatik çevirmek

### İlk Yaklaşım:
- ✅ MyMemory Free API entegrasyonu
- ✅ Async/await ile API çağrıları
- ✅ Cache system

**Problem**: MyMemory API günlük limit aşıldı (sözlüğe dönüldü)

---

## 📋 Aşama 7: Hybrid Çeviri Sistemi v2 (Parenthesis)

**Amaç**: Chicken translate sorununu çözmek

### Problem:
- ❌ Full-page çeviri (cümleyi tamamen Türkçeye çevirme) = context kaybı
- ❌ API limit aşma problemi

### Çözüm: Parantez İçi Çeviri
- ✅ Sözlükteki kelimeleri `(Parantez)` içinde koy
- ✅ Cümleyi İngilizce tut
- ✅ API yok (sözlük-only)

**Örnek**:
```
"Pull requests" → "(Değişiklik İsteği (Pull Request))"
```

---

## 📋 Aşama 8: Regex Optimizasyonu

**Sorunlar**:
1. ❌ `"pull requests"` → `"(Değişiklik İsteği (Pull Request))s"` (plural s dışarıda)
2. ❌ Recursive loop (parantez match'i tekrar eşleşiyor)
3. ❌ "-ing" formları eşleşmiyor (`"watching"` → `"watch"`)

### Çözümler:
- ✅ Regex'e `(?:s|ing)?` ekleme
- ✅ Handler'da trailing suffix'leri kaldırma (ings → ing → s)
- ✅ Tam match ilk check, base form ikinci check
- ✅ Recursive protection (çizgi varsa tekrar çevirme)

---

## 📋 Aşama 9: Parenthesis Kaldırma (Doğal Türkçe)

**Sorun**: Parantezler saçma görünüyor

### Çözüm:
- ✅ Parantez tamamen kaldır
- ✅ Direkt çevirili metni göster
- ✅ Doğal, akıcı Türkçe okuma

**Örnek**:
```
KOYMADAN ÖNCE:  "The (Değişiklik İsteği) into the (Depo)"
SONRA:          "The Değişiklik İsteği into the Depo"
```

---

## 📋 Aşama 10: LibreTranslate API Entegrasyonu

**Amaç**: Sözlükte olmayan kelimeleri otomatik çevirmek (CORS'suz)

### Problem:
- ❌ **CORS Error**: `libretranslate.de` preflight request'e izin vermiyor
- ❌ LibreTranslate public örneği çakışıyor

---

## 📋 Aşama 11: Service Worker + Google Translate GTX

**Çözüm**: CORS bypass

### Yapılan İşler:
- ✅ `background.js` (Service Worker) oluşturma
- ✅ Google Translate GTX endpoint: `translate.googleapis.com`
- ✅ Content script → Service Worker → Google API akışı
- ✅ CORS sorunu çözüldü (Service Worker extension context'inde çalışır)
- ✅ Rate limiting (150 API çağrısı/sayfa)
- ✅ Cache system (aynı kelime tekrar sorulmuyor)

### manifest.json güncelleme:
```json
"background": { "service_worker": "background.js" },
"host_permissions": ["https://translate.googleapis.com/*"]
```

---

## 📊 Final Özellik Matrisi

| Özellik | Durum | Detay |
|---------|-------|-------|
| **Sözlük Çeviri** | ✅ | 250+ terim, sync, hızlı |
| **Google Çeviri** | ✅ | Sözlükte olmayan kelimelere, async, rate limited |
| **Popup Toggle** | ✅ | Aktif/Pasif durumu, persistent state |
| **Regex Matching** | ✅ | Case-insensitive, plural/ing forms, word boundaries |
| **MutationObserver** | ✅ | Dinamik GitHub content'i takip |
| **TreeWalker** | ✅ | TEXT_NODE only, event listeners korunur |
| **SKIP_TAGS** | ✅ | CODE/PRE/SCRIPT/STYLE korunur |
| **Cache** | ✅ | Sözlük ve API çeviriler |
| **Rate Limiting** | ✅ | 150 API çağrısı/sayfa |
| **CSP Compliant** | ✅ | External CSS/JS, no inline code |
| **Service Worker** | ✅ | CORS bypass, background API calls |
| **Parantez YOK** | ✅ | Direkt çevirili metin, doğal Türkçe |

---

## 🎯 Workflow: Nasıl Çalışıyor?

```
1. Sayfa yüklenir
   ↓
2. content.js çalışır → extensionEnabled storage'dan check
   ↓
3. extensionEnabled = true ise:
   ├─→ translateSubtree(document.body)
   └─→ TreeWalker tüm TEXT_NODE'ları tara
   ↓
4. Her TEXT_NODE için:
   ├─→ Sözlük regex match'i (synchronous)
   │   ├─→ Tam match varsa → türkçe yapıştır
   │   ├─→ Base form varsa → türkçe yapıştır
   │   └─→ Yoksa → "_PENDING_word_PENDING_" işareti
   │
   └─→ Pending'ler için Google API (async)
       ├─→ Service Worker'a mesaj gönder
       ├─→ Google Translate çevirisi al
       ├─→ Cache'e sat
       └─→ Çeviri sonucunu yapıştır
   ↓
5. MutationObserver yeni element'leri dinler → repeat
```

---

## 📝 Kullanılan Teknolojiler

- **Manifest V3**: Chrome Extension framework
- **Service Workers**: Background API calls (CORS bypass)
- **TreeWalker API**: DOM text node processing
- **MutationObserver**: Dynamic content tracking
- **RegExp**: Case-insensitive pattern matching
- **localStorage**: Persistent state (chrome.storage.local)
- **Google Translate GTX**: Ücretsiz çeviri API

---

## 🚀 Performance Notes

- **Sözlük çeviri**: `<1ms` per node (synchronous, local)
- **Google çeviri**: `~200-500ms` per unique word (API, cached)
- **Rate limit**: 150 API calls per page load
- **MutationObserver debounce**: 100ms (GitHub SPA optimization)
- **Text cache**: Duplicate words reuse cached translation

---

## 🔮 Sonrası İçin Fikirler

- [ ] Daha fazla terim ekleme (500+)
- [ ] Terimlerin kategori sekmelerine bölünmesi
- [ ] Custom sözlük yükleme (user-defined)
- [ ] Türkçe → İngilizce reverse çeviri
- [ ] Çeviri istatistikleri gösterme
- [ ] Özel karakterler sorunun çözümü
- [ ] Dark/Light theme toggle
- [ ] Keyboard shortcuts (enable/disable)

---

**Son Güncelleme**: April 14, 2026  
**Durum**: ✅ Stabil (Sözlük-Only Mimari)  
**Test Durumu**: ✅ GitHub.com üzerinde temel akışlar doğrulandı  
**Bilinen Durum**: ℹ️ Sözlük kapsamı dışındaki metinler tasarım gereği çevrilmez



# Pencere Mobil — Rehberli "Sakinleşme" Seansı

- Tarih: 2026-10-16
- Durum: Tasarım onaylandı, uygulama planı bekleniyor
- Kapsam: `mobile/` (Expo / React Native)

## Amaç

Kaygılı birinin uygulamayı açtığında tek bir dokunuşla, dışarıdan gelecek bir yönlendirmeye ihtiyaç duymadan sakinleşebileceği **rehberli bir seans** sunmak. Seans; mevcut pencere manzarası ve ambiyans sesi üzerine yumuşak bir katman olarak gelir, kullanıcıyı nefes ve duyusal topraklama ile adım adım yavaşlatır.

Not: İlk değerlendirilen "panik anı için anlık hızlı sakinleşme" yönü, bu ilk sürümde kapsam dışı bırakıldı.

## Kapsam

**Dahil**
- Tek, özenli seans: "Sakinleşme" (~3–4 dakika, 7 adım).
- Mobiide tam ekran rehberli overlay (yatay/landscape düzen).
- Yalnızca **yazılı** rehberlik + mevcut ambiyans sesi. Sesli/TTS anlatım yok.
- Hibrit tempo: otomatik akan adımlar + dokunarak ilerleme + duraklatma.

**Dahil değil (YAGNI)**
- Birden fazla seans türü seçimi (topraklama, vücut taraması, uyku vb.).
- Sesli anlatım (TTS veya kayıtlı insan sesi).
- İlerleme/istatistik kaydı, hatırlatıcılar, bildirimler.
- Web (`src/`) sürümüne taşıma.

## Deneyim Akışı

1. **Giriş:** Alt kontrol çubuğunda yeni bir "Sakinleş" butonu (nefes/yaprak ikonu). Dokununca seans tam ekran açılır.
2. **Arka plan:** Mevcut manzara ve ambiyans sesi aynen devam eder; sahne değişmez, ses kısılmaz.
3. **Düzen (seçilen "C" düzeni):**
   - Solda: yavaş nefes halkası — tüm seans boyunca 4 sn al / 6 sn ver ritminde sakin bir çapa.
   - Sağda: aşama etiketi, adım metni ve ilerleme noktaları.
4. **Tempo (hibrit):** Her adımın varsayılan bir süresi vardır; süre dolunca metin yumuşakça sonraki adıma geçer. Kullanıcı ekrana dokunursa hemen sonraki adıma geçer. "Duraklat" ile oto-akış durur.
5. **Çıkış:** Sağ üstteki ✕ ile her an çıkılır. Son adım bittiğinde nazik bir kapanış gösterilir ve overlay otomatik kapanır.

## Seans İçeriği — "Sakinleşme"

| # | Aşama | Süre | Metin |
|---|-------|------|-------|
| 1 | Yerleş | 20 sn | Rahat bir duruş bul. Ayağını yere bas. Omuzlarını yavaşça indir. |
| 2 | Nefesi fark et | 40 sn | Şimdi sadece nefesini izle. Değiştirmene gerek yok. |
| 3 | Topraklama · gör | 30 sn | Gördüğün 3 şeyi fark et. |
| 4 | Topraklama · duy | 30 sn | Duyduğun 2 sesi fark et. |
| 5 | Topraklama · dokun | 30 sn | Dokunabildiğin 1 şeyi fark et. Sıcaklığını hisset. |
| 6 | Yavaş verişler | 50 sn (5 tur × 10 sn) | Yavaşça al… ve bırak. |
| 7 | Kapanış | 20 sn | İyi geldin. Bu dinginliği yanında taşı. |

Toplam süre ≈ 220 sn (~3,7 dk). 6. adımın 10 sn'lik turu, halkanın 4 sn al / 6 sn ver döngüsüyle birebir hizalanır.

Bu içerik ayrı bir veri dosyasında tutulur; yeni seans eklemek yalnızca veri eklemek olur.

## Mimari

### Yeni dosyalar

- `mobile/src/config/calmSession.ts`
  - Seans ve adım verisi (saf veri, yan etkisiz).
- `mobile/src/hooks/useCalmSession.ts`
  - Adım ilerleme mantığı; UI'dan bağımsız, birimden test edilebilir.
- `mobile/src/components/CalmSessionOverlay.tsx`
  - Tam ekran overlay: adım metni, ilerleme noktaları, nefes halkası, duraklat/kapat kontrolleri.

### Değişecek dosyalar

- `mobile/src/components/BreathingRing.tsx`
  - Animasyonlu halka çekirdeği yeniden kullanılabilir bir `<BreathingCircle/>` bileşenine ayrılır (`active`, `inhaleMs`, `exhaleMs`, `size` propları).
  - `BreathingRing` bunu ekran ortasında kompoze eder (mevcut davranış korunur).
  - `CalmSessionOverlay` de aynı çekirdeği solda, kendi boyutuyla kullanır. Kod tekrarı yok.
- `mobile/src/components/ControlBar.tsx`
  - Yeni `onStartCalm` prop'u ve "Sakinleş" butonu.
- `mobile/src/screens/MainScreen.tsx`
  - `isCalmOpen` state'i; overlay render'ı; seans açıkken sahne jestlerinin (PanResponder) ve kontrol çubuğunun pasifleşmesi; otomatik sahne döngüsünün geçici durdurulması.

### Veri modeli

```ts
export type CalmStepKind = 'settle' | 'notice' | 'senses' | 'breath' | 'closing';

export interface CalmStep {
  id: string;
  kind: CalmStepKind;
  label?: string;      // aşama etiketi, örn. "Topraklama · gör"
  text: string;        // ekranda gösterilen tek cümle
  durationMs: number;  // otomatik ilerleme süresi
}

export interface CalmSession {
  id: string;
  title: string;
  steps: CalmStep[];
}
```

### `useCalmSession` arayüzü

```ts
interface CalmSessionState {
  stepIndex: number;
  step: CalmStep;
  stepProgress: number; // 0..1, mevcut adım içindeki ilerleme
  isPaused: boolean;
  isFinished: boolean;
  next(): void;              // hemen sonraki adım
  togglePause(): void;       // oto-akışı duraklat/dirilt
  setPaused(value: boolean): void; // AppState (arka plan) için
}

function useCalmSession(
  session: CalmSession,
  options: { onFinish?: () => void }
): CalmSessionState;
```

Davranış:
- Adım değişince zamanlayıcı `durationMs` ile kurulur; dolunca `next()` çağrılır.
- `isPaused` iken zamanlayıcı durur; `stepProgress` sabit kalır.
- Son adım bitince `isFinished` true olur ve `onFinish` tetiklenir.
- Unmount'ta tüm zamanlayıcılar temizlenir.

## Etkileşim ve Kenar Durumlar

- **Sahne değişmez, ses devam eder.** Seans ambiyansı bozmaz.
- **Otomatik sahne döngüsü** seans açıkken geçici olarak durur; seans kapanınca eski durumuna döner.
- **`onlyWatchMode`** açıkken "Sakinleş" butonu gösterilmez.
- **Sahne jestleri** (kaydırma/dokunma) seans açıkken devre dışı; dokunma yalnızca adımı ilerletir.
- **Arka plana alma:** Uygulama arka plana alındığında seans otomatik duraklar (AppState gözlemi); dönünce kaldığı yerden devam eder.
- **Ses hazır değilse** seans yine çalışır (sessiz).
- **Kaynak temizliği:** Tüm zamanlayıcılar ve AppState aboneliği overlay unmount olduğunda temizlenir.

## Yeni Bağımlılıklar

- **Yok** (çalışma zamanı için). Ses ve animasyon mevcut altyapıyla yapılır.
- **Geliştirme (test):** `jest-expo`, `@testing-library/react-native`, `@types/jest` (aşağıya bakınız).

## Test Stratejisi (TDD)

Mobilde test altyapısı kurulu değil; kurulacak:
- `jest-expo` preset'i + `@testing-library/react-native`.
- `package.json`'a `test` script'i.

Test kapsamı:
- `useCalmSession` birim testleri (fake timers):
  - Süre dolunca otomatik ilerleme.
  - `next()` ile anında ilerleme.
  - `togglePause()` davranışı (zamanlayıcı durur, ilerleme sabit kalır).
  - Son adım sonrası `isFinished` ve `onFinish` çağrısı.
  - Unmount'ta zamanlayıcı temizliği.
- Saf veri testi: `calmSession.ts` adım sayısı ve süreleri tutarlı (pozitif süre, boş metin yok).

UI bileşeni (`CalmSessionOverlay`) için ilk sürümde ağır görsel test yok; doğrulama cihazda manuel.

## Doğrulama

"Bitti" demeden önce:
- `mobile/` içinde `npx expo lint` temiz.
- `npx tsc --noEmit` hatasız.
- `npm test` (jest) geçer.
- **Gerçek cihazda manuel doğrulama** (kullanıcı tarafından):
  - Seans başlatma, adımların akışı, duraklat/ilerle, ✕ ile çıkış.
  - Arka plana alıp dönünce devam.
  - Ambiyans sesinin bozulmadığı.
- **Push yok**: mobilde cihazda doğrulanmadan önce hiçbir şey push edilmez.

## Gelecek (kapsam dışı)

- Birden fazla seans (vücut taraması, uykuya hazırlık, güvenli yer).
- Sesli anlatım (TTS veya kayıtlı ses).
- Seans süresi/tercihlerinin hatırlanması.

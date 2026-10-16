export type CalmStepKind = 'settle' | 'notice' | 'senses' | 'breath' | 'closing';

export interface CalmStep {
  id: string;
  kind: CalmStepKind;
  label?: string;
  text: string;
  durationMs: number;
}

export interface CalmSession {
  id: string;
  title: string;
  steps: CalmStep[];
}

export const CALM_SESSION: CalmSession = {
  id: 'sakinlesme',
  title: 'Sakinleşme',
  steps: [
    {
      id: 'settle',
      kind: 'settle',
      text: 'Rahat bir duruş bul. Ayağını yere bas. Omuzlarını yavaşça indir.',
      durationMs: 20000,
    },
    {
      id: 'notice',
      kind: 'notice',
      text: 'Şimdi sadece nefesini izle. Değiştirmene gerek yok.',
      durationMs: 40000,
    },
    {
      id: 'see',
      kind: 'senses',
      label: 'Topraklama · gör',
      text: 'Gördüğün 3 şeyi fark et.',
      durationMs: 30000,
    },
    {
      id: 'hear',
      kind: 'senses',
      label: 'Topraklama · duy',
      text: 'Duyduğun 2 sesi fark et.',
      durationMs: 30000,
    },
    {
      id: 'touch',
      kind: 'senses',
      label: 'Topraklama · dokun',
      text: 'Dokunabildiğin 1 şeyi fark et. Sıcaklığını hisset.',
      durationMs: 30000,
    },
    {
      id: 'breathe',
      kind: 'breath',
      label: 'Yavaş verişler',
      text: 'Yavaşça al… ve bırak.',
      durationMs: 50000,
    },
    {
      id: 'close',
      kind: 'closing',
      text: 'İyi geldin. Bu dinginliği yanında taşı.',
      durationMs: 20000,
    },
  ],
};

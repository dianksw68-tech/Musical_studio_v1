export interface AppInputs {
  channelName: string;
  songTitle: string;
  storyTheme: string;
  vibe: string;
  thumbnailLocation: string;
  characterDescription?: string;
  characterImage?: string;
  targetAudience: 'Indonesia' | 'Global';
  lyricsLanguage: string;
  bpm: number;
}

export const BASE_LANGUAGES = [
  'Indonesia',
  'Inggris',
  'Jawa',
  'Sunda',
  'Korea',
  'Jepang',
  'Mandarin',
  'Thailand',
  'Arab'
];

export const LYRICS_LANGUAGES = [
  ...BASE_LANGUAGES,
  'Mix Languages',
  'Custom Language'
];

export interface AppOutputs {
  lyrics: string;
  translation: string;
  stylePrompts: string[];
  basePrompt: string;
  characterDescription?: string;
  imagePrompt: string;
  textOverlayInstructions: string;
  seoMetadata: {
    titles: string[];
    description: string;
    tags: string;
    pinnedComment: string;
    shorts: {
      title: string;
      description: string;
      tags: string;
    };
  };
  generatedImageFull?: string; // Base64 image URL
  generatedImageClose?: string; // Base64 image URL
  generatedThumbnail?: string; // Base64 image URL
  visualAssets: {
    scenes: {
      id: string;
      lyricsSnippet: string;
      imagePrompt: string;
      videoPrompts: string[];
      generatedImage?: string;
    }[];
  };
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  inputs: AppInputs;
  outputs: AppOutputs;
}

export type VibeOption = 
  | 'Nike Ardilla' 
  | 'Deddy Dores' 
  | 'Tiara Andini' 
  | 'Mahalini' 
  | 'Raisa' 
  | 'Isyana Sarasvati' 
  | 'Tulus' 
  | 'Glenn Fredly' 
  | 'Chrisye' 
  | 'Agnez Mo' 
  | 'Lyodra' 
  | 'Ziva Magnolya' 
  | 'Judika' 
  | 'Ari Lasso' 
  | 'Once Mekel' 
  | 'Bunga Citra Lestari' 
  | 'Rossa' 
  | 'Anggun' 
  | 'Inka Christie' 
  | 'Poppy Mercury' 
  | 'IU (K-Pop Soloist)'
  | 'NewJeans (K-Pop Group)'
  | 'BLACKPINK (K-Pop Group)'
  | 'BTS (K-Pop Group)'
  | 'Taeyeon (K-Pop Soloist)'
  | 'Ailee (K-Pop Diva)'
  | 'Stray Kids (K-Pop Group)'
  | 'IVE (K-Pop Group)'
  | 'Taylor Swift (Global Pop)'
  | 'Billie Eilish (Global Alt)'
  | 'Bruno Mars (Global Funk/R&B)'
  | 'Custom Vibe'
  | 'Random Vibe';

export const VIBE_OPTIONS: VibeOption[] = [
  'Nike Ardilla',
  'Deddy Dores',
  'Inka Christie',
  'Poppy Mercury',
  'Chrisye',
  'Glenn Fredly',
  'Ari Lasso',
  'Judika',
  'Once Mekel',
  'Tiara Andini',
  'Mahalini',
  'Lyodra',
  'Ziva Magnolya',
  'Raisa',
  'Isyana Sarasvati',
  'Tulus',
  'Agnez Mo',
  'Bunga Citra Lestari',
  'Rossa',
  'Anggun',
  'IU (K-Pop Soloist)',
  'NewJeans (K-Pop Group)',
  'BLACKPINK (K-Pop Group)',
  'BTS (K-Pop Group)',
  'Taeyeon (K-Pop Soloist)',
  'Ailee (K-Pop Diva)',
  'Stray Kids (K-Pop Group)',
  'IVE (K-Pop Group)',
  'Taylor Swift (Global Pop)',
  'Billie Eilish (Global Alt)',
  'Bruno Mars (Global Funk/R&B)',
  'Custom Vibe',
  'Random Vibe'
];

export const RANDOM_THEMES = [
  'Patah hati karena restu orang tua',
  'Kerinduan mendalam pada kekasih yang jauh',
  'Penyesalan setelah meninggalkan seseorang yang tulus',
  'Cinta bertepuk sebelah tangan di masa sekolah',
  'Kehilangan sahabat terbaik selamanya',
  'Perjuangan hidup di kota besar yang keras',
  'Kenangan manis di desa kelahiran',
  'Cinta segitiga yang rumit dan menyakitkan',
  'Harapan baru setelah kegagalan besar',
  'Kesetiaan yang dikhianati demi harta',
  'Pertemuan kembali dengan cinta pertama setelah 10 tahun',
  'Rasa syukur atas kehadiran seseorang yang sederhana',
  'Kesepian di tengah keramaian kota',
  'Janji setia yang tak pernah ditepati',
  'Perpisahan di stasiun kereta saat hujan'
];

export const RANDOM_LOCATIONS = [
  'Pantai saat sunset dengan ombak tenang',
  'Hutan pinus berkabut yang misterius',
  'Jalanan kota Tokyo saat hujan malam hari dengan lampu neon',
  'Kafe klasik bergaya vintage yang sepi',
  'Taman bunga sakura yang sedang berguguran',
  'Stasiun kereta api tua yang melankolis',
  'Puncak gunung dengan pemandangan awan',
  'Kamar tidur dengan cahaya lampu hangat dan jendela hujan',
  'Padang rumput luas di bawah langit berbintang',
  'Danau tenang dengan pantulan cahaya bulan',
  'Perpustakaan tua dengan rak buku kayu tinggi',
  'Atap gedung (rooftop) dengan pemandangan city light',
  'Studio musik modern dengan cahaya neon biru dan ungu',
  'Pasar malam yang ramai namun terasa kesepian',
  'Tepi sungai dengan jembatan kayu tua'
];

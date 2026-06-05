export interface Player {
  id: string;
  name: string;
  points: number;
  department: string;
  created_at: string;
}

export interface EventPhoto {
  id: string;
  url: string;
  caption: string;
  isFeatured: boolean;
}

export interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  type: 'past' | 'upcoming';
  results?: string; // HTML or text describing the results
  photos?: EventPhoto[]; // array of structured event photos
  awardedPoints?: { [playerId: string]: number }; // tracks points added to each player by this event
  awardedDetails?: {
    [playerId: string]: {
      wins: number;
      isChampion: boolean;
      isRunnerUp: boolean;
      isSemiFinalist: boolean;
      isQuarterFinalist: boolean;
    }
  };
}

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
}

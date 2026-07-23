export interface HeroStats {
  complexesCount: string;   
  activeAthletes: string;
  proCoaches: string;
}

export interface NearestComplex {
  name: string;
  address: string;
  rating: string;
  distance: string;
  tags: string[];
}

export interface HeroData {
  stats: HeroStats;
  nearestComplex: NearestComplex;
}
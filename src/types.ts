export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  address: string;
  accreditation: string;
  npsn: string;
  motto: string;
}

export interface Teacher {
  id: string;
  name: string;
  position: string;
  photoUrl?: string;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

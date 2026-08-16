import type { DateAccessItem, PanchangamDay } from "./types/panchangam";

export const todaysPanchangam: PanchangamDay = {
  date: "2026-08-13",
  dateLabel: "13 August 2026",
  vara: "Thursday",
  tithi: "Shukla Saptami",
  paksha: "Shukla Paksha",
  nakshatra: "Swati",
  yoga: "Siddha",
  karana: "Vanija",
  location: "Reference data",
  sunrise: "05:58 AM",
  sunset: "06:42 PM",
  moonrise: "04:12 PM",
  moonset: "03:28 AM",
  rahuKalam: { label: "Rahu Kalam", start: "01:30 PM", end: "03:00 PM" },
  yamagandam: { label: "Yamagandam", start: "06:00 AM", end: "07:30 AM" },
  gulikaKalam: { label: "Gulika Kalam", start: "09:00 AM", end: "10:30 AM" },
  durmuhurtham: { label: "Durmuhurtham", start: "12:18 PM", end: "01:06 PM" },
  varjyam: { label: "Varjyam", start: "08:42 AM", end: "10:18 AM" },
  amritaKalam: { label: "Amrita Kalam", start: "11:24 AM", end: "12:48 PM" },
  abhijitMuhurtham: {
    label: "Abhijit Muhurtham",
    start: "11:54 AM",
    end: "12:42 PM",
  },
  festivals: ["Varalakshmi Vratham"],
  vratas: ["Shukla Paksha Vrat"],
};

export const tomorrowPreview = {
  date: "2026-08-14",
  dateLabel: "14 August 2026",
  tithi: "Shukla Ashtami",
  vara: "Friday",
  nakshatra: "Vishakha",
};

export const dateAccessItems: DateAccessItem[] = [
  { label: "Today", date: "2026-08-13", access: "full" },
  { label: "Yesterday", date: "2026-08-12", access: "full" },
  {
    label: "Tomorrow",
    date: "2026-08-14",
    access: "preview",
    previewFields: ["Tithi", "Vara", "Nakshatra"],
  },
  { label: "14 Aug", date: "2026-08-14", access: "locked" },
  { label: "15 Aug", date: "2026-08-15", access: "locked" },
  { label: "16 Aug", date: "2026-08-16", access: "locked" },
];

export const premiumBenefits = [
  "Full Panchangam for any past or future date",
  "Calendar navigation and advanced search",
  "Tithi, Nakshatra, and Muhurtham finders",
  "Multiple locations and ad-free experience",
];

export const freeFeatures = [
  "Today's complete Panchangam",
  "Yesterday's complete Panchangam",
  "Tomorrow's basic preview",
  "Today's festivals",
  "Essential daily timings",
];

export const premiumFeatures = [
  "Full Panchangam for any date",
  "Future dates",
  "Historical dates",
  "Calendar navigation",
  "Tithi Finder",
  "Nakshatra Finder",
  "Festival Calendar",
  "Muhurtham Finder",
  "Multiple locations",
  "Ad-free experience",
];

export const faqItems = [
  {
    question: "Is Today's Panchangam free?",
    answer:
      "Yes. Today's complete Panchangam is available for free, including Tithi, Nakshatra, timings, and festivals.",
  },
  {
    question: "Can I check tomorrow's Panchangam?",
    answer:
      "You can see a basic preview of tomorrow with Tithi, Vara, and Nakshatra. Full details require Premium.",
  },
  {
    question: "Can I check previous dates?",
    answer:
      "Yesterday's complete Panchangam is available for free. Other historical dates require Premium.",
  },
  {
    question: "Can I check future dates?",
    answer: "Yes, with Premium. Unlock complete Panchangam for any future date.",
  },
  {
    question: "What information is included?",
    answer:
      "Tithi, Vara, Nakshatra, Yoga, Karana, sunrise/sunset, Rahu Kalam, Yamagandam, Gulika, special timings, festivals, and more.",
  },
  {
    question: "Can I select my location?",
    answer:
      "Yes. Panchangam is location-dependent, so the experience supports location selection. Premium unlocks multiple locations.",
  },
];

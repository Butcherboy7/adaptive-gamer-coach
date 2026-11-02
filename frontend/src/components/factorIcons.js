import {
  BedDouble, CalendarDays, Clock, CloudRain, CreditCard, Flame, Hourglass,
  MessageSquareWarning, Moon, Smile, User, Users, Waves, Zap,
} from 'lucide-react';

// One icon per model input, used in the sliders and in the problem list so the same
// thing always looks the same.
export const FACTOR_ICONS = {
  daily_gaming_hours: Clock,
  weekly_sessions: CalendarDays,
  night_gaming_ratio: Moon,
  sleep_hours: BedDouble,
  toxic_exposure: MessageSquareWarning,
  microtransactions_spending: CreditCard,
  stress_level: Zap,
  anxiety_score: Waves,
  aggression_score: Flame,
  depression_score: CloudRain,
  happiness_score: Smile,
  loneliness_score: User,
  social_interaction_score: Users,
  years_gaming: Hourglass,
};

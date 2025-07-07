export interface MileageCard {
  _id?: string;
  name: string;
  bank: string;
  program: string;
  pointsPerReal: number;
  annualFee: number;
  benefits: string[];
  status: 'active' | 'inactive';
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MileageTransaction {
  _id?: string;
  description: string;
  value: number;
  category: string;
  program: string;
  points: number;
  type: 'earned' | 'redeemed';
  date: string;
  cardId?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MileageProgram {
  _id?: string;
  name: string;
  partners: string[];
  status: 'active' | 'inactive';
  totalPoints: number;
  estimatedValue: number;
  lastUpdated: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MileageGoal {
  _id?: string;
  name: string;
  description: string;
  targetPoints: number;
  currentPoints: number;
  targetDate: string;
  program: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CardRecommendation {
  id: string;
  name: string;
  bank: string;
  program: string;
  pointsPerReal: number;
  annualFee: number;
  benefits: string[];
  score: number;
  reason: string;
}

export interface MileageAnalytics {
  totalPoints: number;
  totalValue: number;
  activeCards: number;
  activePrograms: number;
  monthlyEarnings: number;
  topCategories: Array<{
    category: string;
    points: number;
    value: number;
  }>;
  topPrograms: Array<{
    program: string;
    points: number;
    value: number;
  }>;
} 
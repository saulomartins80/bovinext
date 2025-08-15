import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  bank: string;
  program: string;
  number: string; // Últimos 4 dígitos
  limit: number;
  used: number;
  dueDate: number; // Dia do vencimento
  closingDate: number; // Dia do fechamento
  pointsPerReal: number;
  annualFee: number;
  benefits: string[];
  status: 'active' | 'inactive' | 'blocked';
  color: string;
  bankLogo?: string;
  category: 'premium' | 'standard' | 'basic';
  cashback?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  cardId: mongoose.Types.ObjectId;
  amount: number;
  dueDate: Date;
  closingDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  description?: string;
  paidAt?: Date;
  paymentMethod?: string;
  transactions: Array<{
    date: Date;
    description: string;
    amount: number;
    category?: string;
    points?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMileageProgram extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  airline: string;
  pointsBalance: number;
  estimatedValue: number;
  conversionRate: number;
  status: 'active' | 'inactive';
  programLogo?: string;
  bestUse?: string;
  expirationPolicy?: string;
  recentEarned: number;
  expiringPoints: number;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  bank: {
    type: String,
    required: true,
    trim: true
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{4}$/.test(v);
      },
      message: 'Número deve conter apenas os últimos 4 dígitos'
    }
  },
  limit: {
    type: Number,
    required: true,
    min: 0
  },
  used: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  dueDate: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  closingDate: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  pointsPerReal: {
    type: Number,
    required: true,
    min: 0
  },
  annualFee: {
    type: Number,
    required: true,
    min: 0
  },
  benefits: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  bankLogo: {
    type: String
  },
  category: {
    type: String,
    enum: ['premium', 'standard', 'basic'],
    default: 'standard'
  },
  cashback: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

const InvoiceSchema = new Schema<IInvoice>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  cardId: {
    type: Schema.Types.ObjectId,
    ref: 'Card',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  closingDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true
  },
  paidAt: {
    type: Date
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  transactions: [{
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      trim: true
    },
    points: {
      type: Number,
      min: 0
    }
  }]
}, {
  timestamps: true
});

const MileageProgramSchema = new Schema<IMileageProgram>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  airline: {
    type: String,
    required: true,
    trim: true
  },
  pointsBalance: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  estimatedValue: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  conversionRate: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  programLogo: {
    type: String
  },
  bestUse: {
    type: String,
    trim: true
  },
  expirationPolicy: {
    type: String,
    trim: true
  },
  recentEarned: {
    type: Number,
    min: 0,
    default: 0
  },
  expiringPoints: {
    type: Number,
    min: 0,
    default: 0
  },
  expirationDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para otimização
CardSchema.index({ userId: 1, status: 1 });
CardSchema.index({ userId: 1, bank: 1 });
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ userId: 1, dueDate: 1 });
MileageProgramSchema.index({ userId: 1, status: 1 });

export const Card = mongoose.model<ICard>('Card', CardSchema);
export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export const MileageProgram = mongoose.model<IMileageProgram>('MileageProgram', MileageProgramSchema);

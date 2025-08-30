declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  // Declaração genérica para todos os ícones Lucide
  export type LucideIcon = FC<LucideProps>;
  
  // Exportações específicas para os ícones mais usados no projeto
  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ArrowDown: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUp: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const Award: LucideIcon;
  export const BarChart: LucideIcon;
  export const BarChart2: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bell: LucideIcon;
  export const Bitcoin: LucideIcon;
  export const BookOpen: LucideIcon;
  export const BookText: LucideIcon;
  export const Bot: LucideIcon;
  export const Brain: LucideIcon;
  export const Calendar: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Copy: LucideIcon;
  export const CreditCard: LucideIcon;
  export const Crown: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Download: LucideIcon;
  export const Edit: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Filter: LucideIcon;
  export const Flag: LucideIcon;
  export const Gem: LucideIcon;
  export const Globe: LucideIcon;
  export const Handshake: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Home: LucideIcon;
  export const Image: LucideIcon;
  export const Layers: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const List: LucideIcon;
  export const Loader2: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const Menu: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const Mic: LucideIcon;
  export const Minus: LucideIcon;
  export const Monitor: LucideIcon;
  export const Moon: LucideIcon;
  export const Phone: LucideIcon;
  export const PieChart: LucideIcon;
  export const Play: LucideIcon;
  export const Plus: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Rocket: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const Shield: LucideIcon;
  export const Sliders: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Square: LucideIcon;
  export const Star: LucideIcon;
  export const Sun: LucideIcon;
  export const Target: LucideIcon;
  export const ThumbsUp: LucideIcon;
  export const Trash: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Trophy: LucideIcon;
  export const User: LucideIcon;
  export const Wallet: LucideIcon;
  export const X: LucideIcon;
  export const XCircle: LucideIcon;
  export const Zap: LucideIcon;
  export const Banknote: LucideIcon;
  export const Bookmark: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  export const Briefcase: LucideIcon;
  export const Building: LucideIcon;
  export const ArrowDownCircle: LucideIcon;
  export const ArrowUpCircle: LucideIcon;
  export const Clock: LucideIcon;
  export const Cpu: LucideIcon;
  export const Users: LucideIcon;
  export const Wifi: LucideIcon;
  export const BellOff: LucideIcon;
  export const BadgeCheck: LucideIcon;
  export const Pause: LucideIcon;
  export const Database: LucideIcon;
  export const FileText: LucideIcon;
  export const CircleHelp: LucideIcon;
  export const Video: LucideIcon;
  
  // Declaração genérica que permite qualquer ícone Lucide
  const lucideReact: Record<string, LucideIcon>;
  export = lucideReact;
}

import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

const icons: Record<string, LucideIcon> = {
  'arrow-left': LucideIcons.ArrowLeft,
  'arrow-right-from-bracket': LucideIcons.LogOut,
  'arrow-trend-up': LucideIcons.TrendingUp,
  'bag-shopping': LucideIcons.ShoppingBag,
  ban: LucideIcons.Ban,
  'basket-shopping': LucideIcons.ShoppingBasket,
  bell: LucideIcons.Bell,
  'bell-concierge': LucideIcons.ConciergeBell,
  'border-all': LucideIcons.Grid2X2,
  'boxes-stacked': LucideIcons.Boxes,
  'chart-simple': LucideIcons.ChartNoAxesColumn,
  check: LucideIcons.Check,
  'chevron-down': LucideIcons.ChevronDown,
  'chevron-left': LucideIcons.ChevronLeft,
  'chevron-right': LucideIcons.ChevronRight,
  'circle-check': LucideIcons.CircleCheck,
  'circle-exclamation': LucideIcons.CircleAlert,
  'circle-info': LucideIcons.Info,
  copy: LucideIcons.Copy,
  'credit-card': LucideIcons.CreditCard,
  cube: LucideIcons.Box,
  download: LucideIcons.Download,
  envelope: LucideIcons.Mail,
  eye: LucideIcons.Eye,
  fire: LucideIcons.Flame,
  'fire-burner': LucideIcons.CookingPot,
  gear: LucideIcons.Settings,
  'hand-pointer': LucideIcons.Hand,
  lock: LucideIcons.Lock,
  'magnifying-glass': LucideIcons.Search,
  'magnifying-glass-minus': LucideIcons.ZoomOut,
  'magnifying-glass-plus': LucideIcons.ZoomIn,
  motorcycle: LucideIcons.Bike,
  pause: LucideIcons.Pause,
  play: LucideIcons.Play,
  print: LucideIcons.Printer,
  qrcode: LucideIcons.QrCode,
  receipt: LucideIcons.ReceiptText,
  rocket: LucideIcons.Rocket,
  rotate: LucideIcons.RotateCcw,
  'rotate-right': LucideIcons.RotateCw,
  route: LucideIcons.Route,
  spinner: LucideIcons.LoaderCircle,
  star: LucideIcons.Star,
  store: LucideIcons.Store,
  'table-cells-large': LucideIcons.Grid2X2,
  tags: LucideIcons.Tags,
  ticket: LucideIcons.Ticket,
  'trash-can': LucideIcons.Trash2,
  'triangle-exclamation': LucideIcons.TriangleAlert,
  user: LucideIcons.User,
  'user-group': LucideIcons.Users,
  users: LucideIcons.Users,
  utensils: LucideIcons.Utensils,
  wallet: LucideIcons.Wallet,
  whatsapp: LucideIcons.MessageCircle,
};

export const Icon: React.FC<IconProps> = ({ name, className = '', style }) => {
  const classes = name.split(/\s+/);
  const iconName = classes.find((part) => part in icons);
  const extraClasses = classes.filter((part) => part !== iconName).join(' ');
  const IconComponent = iconName ? icons[iconName] : LucideIcons.CircleHelp;

  return <IconComponent className={`${extraClasses} ${className}`.trim()} style={style} aria-hidden="true" />;
};

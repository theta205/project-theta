// Define the navigation item type
export type NavigationItem = {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
};

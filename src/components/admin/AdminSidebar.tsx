import {
  LayoutDashboard,
  Image,
  Wrench,
  BookOpen,
  Monitor,
  MessageSquareQuote,
  UserCircle,
  PhoneCall,
  PanelBottom,
  Settings,
  FileText,
  Code,
  ClipboardList,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { BarChart3 } from "lucide-react";

const contentItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Hero Section", url: "/admin/hero", icon: Image },
  { title: "Services", url: "/admin/services", icon: Wrench },
  { title: "Case Studies", url: "/admin/case-studies", icon: BookOpen },
  { title: "Platforms", url: "/admin/platforms", icon: Monitor },
  { title: "Testimonials", url: "/admin/testimonials", icon: MessageSquareQuote },
  { title: "About Section", url: "/admin/about", icon: UserCircle },
  { title: "CTA Section", url: "/admin/cta", icon: PhoneCall },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Footer", url: "/admin/footer", icon: PanelBottom },
  { title: "Scripts", url: "/admin/scripts", icon: Code },
  { title: "Audit Requests", url: "/admin/audit-requests", icon: ClipboardList },
];

const settingsItems = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 shrink-0 text-primary" />
          {!collapsed && (
            <span className="font-bold text-sidebar-foreground text-sm">
              TrackRight
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            Admin Panel v1.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

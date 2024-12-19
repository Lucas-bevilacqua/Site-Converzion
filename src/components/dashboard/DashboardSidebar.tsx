import { useNavigate } from "react-router-dom";
import { Home, QrCode, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const items = [
    {
      title: "Dashboard",
      icon: Home,
      onClick: () => navigate('/dashboard')
    },
    {
      title: "WhatsApp",
      icon: QrCode,
      onClick: () => navigate('/dashboard')
    },
    {
      title: "Configurações",
      icon: Settings,
      onClick: () => navigate('/dashboard/settings')
    },
    {
      title: "Sair",
      icon: LogOut,
      onClick: handleLogout
    }
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
import * as React from "react";
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user";
import logo from '../assets/logo.png'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [],
  navMain: [
    {
      title: "Cover Letter",
      url: "/dashboard/cover",
      icon: BookOpen,
    },
    {
      title: "ATS Verifier",
      url: "/dashboard/ats-verifier",
      icon: Bot,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: SquareTerminal,
    },
    {
      title: "Get the Job",
      url: "/dashboard/get-job",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>

      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

// import {
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarGroupContent,
// } from "@/components/ui/sidebar";

// export function RecentChats() {
//   return (
//     <SidebarGroup>
//       <SidebarGroupLabel>Recent chats</SidebarGroupLabel>

//       <SidebarGroupContent>
//         <SidebarMenu>
//           {/* Existing chats */}
//           {chats?.map((chat) => (
//             <SidebarMenuItem key={chat.id}>
//               <SidebarMenuButton asChild>
//                 <Link href={`/chat/${chat.id}`}>
//                   <MessagesSquare />
//                   <span>{chat.title}</span>
//                 </Link>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           ))}
//         </SidebarMenu>
//       </SidebarGroupContent>
//     </SidebarGroup>
//   );
// }

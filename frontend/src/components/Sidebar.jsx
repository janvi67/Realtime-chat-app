import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "../components/skeletons/SidebarSkeleton";
import { unReadNotifications } from "../lib/unReadNotifications";

 const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    notifications,
    markNotificationAsRead,
    messages,
    getMessages, // make sure this exists in your store
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [query,setQuery]=useState('')

  // Fetch users on mount
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Fetch messages for each user after users load
  useEffect(() => {
    const uniqueSenderIds = [...new Set(notifications.map((n) => n.senderId))];

    uniqueSenderIds.forEach((senderId) => {
      getMessages(senderId); // Always fetch messages for sender on notification
    });
  }, [notifications, getMessages]);

  const filteredSearchUsers = users.filter((user) =>
    typeof user.fullName === 'string' && user.fullName.includes(query.toLowerCase())
  );
  console.log("serach",filteredSearchUsers)


  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : filteredSearchUsers;

  if (isUsersLoading) return <SidebarSkeleton />;

  const unread = unReadNotifications(notifications);

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="relative mt-3">
        <div className="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input type="search" onChange={(e)=>setQuery(e.target.value.toLowerCase())} id="default-search" className="block w-full p-2  ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Contacts..." required />
       
    </div>
        {/* <input type="text" onChange={(e)=>setQuery(e.target.value.toLowerCase())}/> */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => {
          const userUnread = unread.filter((n) => n.senderId === user._id);

          // Get messages exchanged with this user
          const userMessages = messages.filter(
            (m) => m.senderId === user._id || m.receiverId === user._id
          );

          const lastUserMessage =
            userMessages.length > 0
              ? userMessages[userMessages.length - 1].text
              : "";

          return (
            <button
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                markNotificationAsRead(user._id);
              }}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }`}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>

              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
                <div className="text-sm text-zinc-400 truncate">
                  {lastUserMessage || "No messages yet"}
                </div>
              </div>

              {userUnread.length > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {userUnread.length}
                </div>
              )}
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
"use client";
import { MessageInput } from "@/components/dashboard/input-field";
import { useQuery } from "@tanstack/react-query";
import { Hash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Channel, Post } from "../../../generated/prisma";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";

export function MainChatArea({
  selectedChannel,
  socket,
}: {
  selectedChannel: Channel;
  socket: Socket;
}) {
  const [messages, setMessages] = useState<Post[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  /**
   *
   * @returns A promise that resolves to an array of messages for the selected channel
   * Fetches messages for the selected channel and updates the state
   * if no channel is selected, it returns early
   * If fetching messages fails, it logs an error to the console
   * The function is called whenever the selectedChannel changes
   *
   */

  const { data, isError } = useQuery({
    queryKey: [`messages`, selectedChannel.id],
    queryFn: async (): Promise<Post[]> => {
      const res = await fetch(`/api/messages?channelId=${selectedChannel.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (data && !isError) {
      setMessages(data);
    }
  }, [data, isError]);

  /**
   * Sets up a WebSocket listener for incoming chat messages
   * When a new message is received, it appends the message to the existing list of messages in the state
   * Cleans up the listener when the component is unmounted or when the socket changes
   * The effect depends on the socket instance
   * If the socket is not available, the effect does nothing
   * The listener listens for the 'chat message' event
   * The new message is expected to be of type Post
   * The messages state is updated using the functional form of setState to ensure the latest state is used
   * This effect ensures that the chat interface stays updated in real-time as new messages arrive
   * It is important for real-time communication applications
   */
  useEffect(() => {
    socket.on("chat message", (msg: Post) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off(`chat message`);
    };
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white/10 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="p-4 bg-white/20 backdrop-blur-xl border-b border-white/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-800">
            {selectedChannel?.name || `Select a Channel`}
          </h1>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 group">
              <Avatar className="w-10 h-10 shadow-lg">
                <AvatarFallback
                  className={`bg-gradient-to-r bg-blue-500 text-white`}
                >
                  {msg.authorName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">
                    {msg.authorName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.postedDate).toLocaleDateString()}
                    {" • "}
                    {new Date(msg.postedDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-3 shadow-sm group-hover:scale group-hover:bg-white/40 transition-all duration-200">
                  <p className="text-gray-800">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Message Input */}
      <MessageInput channelId={selectedChannel.id} socket={socket} />
    </div>
  );
}

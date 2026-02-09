"use client";

import { getChannels } from "@/lib/channels";
import { getServers } from "@/lib/servers";
import { Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Channel, Server } from "../../../generated/prisma";

import { MainChatArea } from "./main-chat-area";

/**
 *
 * @returns A React component representing the dashboard of a chat application
 * The dashboard includes a list of servers, channels, and a main chat area
 * It manages state for servers, channels, selected server/channel, and WebSocket connection
 * It fetches servers and channels from the backend and establishes a WebSocket connection for real-time chat
 * The layout is styled using Tailwind CSS for a modern and responsive design
 */
export function Dashboard() {
  const [servers, setServers] = useState<Server[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [socket, setSocket] = useState<Socket>();

  /**
   * Establishes a WebSocket connection to the server
   * The connection is made to 'http://localhost:3001'
   * The socket instance is stored in the component's state
   * The connection is re-established whenever the selectedChannel changes
   * Cleans up the connection when the component is unmounted or when selectedChannel changes
   * If there is an existing socket connection, it is disconnected before creating a new one
   * This ensures that there is only one active connection at a time
   * The effect depends on the selectedChannel state
   */
  useEffect(() => {
    const newSocket = io(`http://localhost:3001`, {});
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && selectedChannel) {
      socket.emit("join", selectedChannel.id);
    }
  }, [socket, selectedChannel]);
  /**
   * Fetches the list of servers from the backend
   * The fetched servers are stored in the component's state
   * If there is no selected server and the fetched list is not empty,
   */
  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await getServers();
        setServers(res);
        if (selectedServer === null && res.length > 0) {
          setSelectedServer(res[0]);
        }
        return res;
      } catch (error) {
        console.error("Failed to fetch servers", error);
      }
    }
    fetchServers();
  }, []);

  /**
   * Fetches the list of channels for the selected server
   * The fetched channels are stored in the component's state
   * If there is a selected server, it fetches the channels for that server
   * If there is no selected server, it returns early
   * If fetching channels fails, it logs an error to the console
   * The function is called whenever the selectedServer changes
   */
  useEffect(() => {
    async function fetchChannels() {
      if (!selectedServer) {
        return;
      }
      try {
        const res = await getChannels({ serverId: selectedServer.id });
        setChannels(res);
        setSelectedChannel(res[0]);
        return res;
      } catch (error) {
        console.error("Failed to fetch channels", error);
      }
    }
    fetchChannels();
  }, [selectedServer]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-sky-200 via-blue-200 to-cyan-200 flex overflow-hidden z-10">
      <div className="max-md:hidden w-80 bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col">
        {/* Server List */}
        <div className="p-4 border-b border-white/20">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            Servers
          </h2>
          <div className="space-y-2">
            {servers?.map((server) => (
              <button
                key={server.id}
                onClick={() => setSelectedServer(server)}
                className={`w-full p-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  selectedServer === server
                    ? "bg-white/40 backdrop-blur-sm shadow-lg scale-105"
                    : "bg-white/10 hover:bg-white/20 hover:scale-102"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  <p className="text-xs">⭐</p>
                </div>
                <span className="font-medium text-gray-800">{server.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="p-4 border-b border-white/20">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Channels
          </h3>
          <div className="space-y-1">
            {channels?.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full p-2 rounded-lg hover:bg-white/20 transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900 ${
                  selectedChannel === channel
                    ? "bg-white/40 backdrop-blur-sm shadow-lg scale-105"
                    : "bg-white/10 hover:bg-white/20 hover:scale-102"
                }`}
              >
                <Hash className="w-4 h-4" />
                <span className="text-sm">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      {socket && selectedChannel ? (
        <MainChatArea selectedChannel={selectedChannel} socket={socket} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading chat…</p>
        </div>
      )}
    </div>
  );
}

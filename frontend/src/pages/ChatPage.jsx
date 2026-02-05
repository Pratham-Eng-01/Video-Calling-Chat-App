import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getSmartReply, getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastIncomingMessage, setLastIncomingMessage] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when authUser is available
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //
        const channelId = [authUser._id, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId, yourId]
        // if you start the chat => channelId: [yourId, myId]  => [myId,yourId]

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  useEffect(() => {
    if (!channel || !authUser) return;

    const updateLastIncoming = () => {
      const messages = channel.state?.messages || [];
      const lastMessage = [...messages]
        .reverse()
        .find((msg) => msg.user?.id && msg.user.id !== authUser._id && !msg.deleted_at);

      setLastIncomingMessage(lastMessage?.text || "");
    };

    const handleNewMessage = (event) => {
      const newMsg = event?.message;
      if (newMsg?.user?.id && newMsg.user.id !== authUser._id) {
        setLastIncomingMessage(newMsg.text || "");
      }
    };

    updateLastIncoming();
    channel.on("message.new", handleNewMessage);

    return () => {
      channel.off("message.new", handleNewMessage);
    };
  }, [channel, authUser]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  const handleGenerateReply = async () => {
    if (!lastIncomingMessage) {
      toast.error("No incoming message to reply to.");
      return;
    }

    try {
      setAiLoading(true);
      setAiReply("");
      const data = await getSmartReply(lastIncomingMessage);
      setAiReply(data.reply || "");
    } catch (error) {
      console.error("Error generating AI reply:", error);
      const message = error?.response?.data?.message || "AI reply failed. Please try again.";
      toast.error(message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyReply = async () => {
    if (!aiReply) return;
    try {
      await navigator.clipboard.writeText(aiReply);
      toast.success("Reply copied to clipboard");
    } catch (error) {
      console.error("Error copying AI reply:", error);
      toast.error("Could not copy reply");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] flex flex-col">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative flex flex-col h-full">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>

      <div className="border-t border-base-300 bg-base-100 p-4">
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-4 gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-sm">AI Smart Reply</h3>
                <p className="text-xs opacity-70">
                  Suggest a response to the last incoming message.
                </p>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleGenerateReply}
                disabled={aiLoading}
              >
                {aiLoading ? "Generating..." : "Generate Reply"}
              </button>
            </div>

            <div className="text-sm">
              <span className="opacity-70">Last message:</span>{" "}
              <span className="font-medium line-clamp-1">
                {lastIncomingMessage || "No messages yet"}
              </span>
            </div>

            {aiReply ? (
              <div className="flex items-start justify-between gap-3 bg-base-100 border border-base-300 rounded-lg p-3">
                <p className="text-sm">{aiReply}</p>
                <button className="btn btn-xs btn-ghost flex-shrink-0" onClick={handleCopyReply}>
                  Copy
                </button>
              </div>
            ) : (
              <div className="text-sm opacity-70">No suggestion yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatPage;

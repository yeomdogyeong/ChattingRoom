import React, { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import Love from "./love2.png";
import Pet from "./icon_Pet.png";

type ChatEvent = {
  message: string;
  room: string;
  createdAt: string;
  sender: string;
};

const ChatComponent: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    { room: string; message: string; createdAt: Date; sender: string }[]
  >([]);

  const socketRef = useRef<Socket | null>(null);
  const [room, setRoom] = useState<string>("기본 대기실");
  const [inputValue, setInputValue] = useState<string>("");
  const filteredMessages = messages.filter((msg) => msg.room === room);
  useEffect(() => {
    console.log("socketRef.current:", socketRef.current);
    socketRef.current = io("http://localhost:4000");

    socketRef.current.emit("joinRoom", room);

    socketRef.current?.on("chat", (data: ChatEvent) => {
      console.log("Received chat event:", data);
      setMessages((messages) => [
        ...messages,
        { ...data, createdAt: new Date() },
      ]);
    });
    socketRef.current?.on("load_messages", (messages) => {
      setMessages(messages);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [room]);

  const joinRoom = () => {
    console.log("조인룸");
    if (socketRef.current && inputValue) {
      setRoom(inputValue);
      socketRef.current.emit("joinRoom", inputValue);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    console.log("메세지");
    e.preventDefault();

    if (socketRef.current) {
      socketRef.current.emit("chat", {
        message,
        room,
        sender: "me",
      });

      setMessage("");
    }
  };

  return (
    <div className="flex flex-col w-full h-screen p-4 md:p-8">
      <h2 className="text-xl mb-2 md:text-2xl">현재 방 : {room}</h2>
      <form className="mb-4">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="mb-3 p-2 rounded-md border w-full md:w-1/2 md:text-lg"
          placeholder="Enter room"
        />
        <button
          type="button"
          onClick={joinRoom}
          className="w-full bg-[#E19898] text-white p-2 rounded-md hover:bg-[#FFB7B7] md:w-1/2 md:text-lg"
        >
          Join Room
        </button>
      </form>
      <div className="flex-grow overflow-auto mb-4 p-3 bg-white rounded-md">
        {filteredMessages.map((message, i) => (
          <div
            key={i}
            className={`mb-3 p-2 rounded-md space-x-10 bg-gray-100 text-gray-900 flex items-center ${
              message.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <img
              className="rounded-full h-8 w-8 md:h-10 md:w-10 border-4 border-gray-300 bg-gray-300"
              src={message.sender === "me" ? Love : Pet}
              alt="heart_picture"
            ></img>
            <p>{message.sender ? message.sender : "another"}</p>
            <p className="text-sm md:text-base">{message.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          id="input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-1 md:text-lg"
        />
        <button
          id="send-button"
          type="submit"
          className="bg-[#E19898] hover:bg-[#FFB7B7] text-white py-2 px-4 rounded-r-md md:text-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;

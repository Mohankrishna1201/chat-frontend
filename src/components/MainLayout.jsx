import React, { useState, useEffect } from "react";
import { client } from "../context/stream";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../context/firebase";
import UserList from "./UserList";
import GroupChat from "./GroupChat";
import ChatLayout from "./ChatLayout";

const MainLayout = () => {
    const [users, setUsers] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersList = usersSnapshot.docs.map((doc) => doc.data());
            setUsers(usersList);
        };
        fetchUsers();
    }, []);

    const startChat = async (userId) => {
        const channel = client.channel("messaging", {
            members: [client.userID, userId],
        });
        await channel.create();
        setActiveChannel(channel);
    };

    const createGroupChat = async (groupName, selectedUsers) => {
        const channel = client.channel("messaging", {
            name: groupName,
            members: [client.userID, ...selectedUsers],
        });
        await channel.create();
        setActiveChannel(channel);
    };

    return (
        <div className="flex">
            <UserList users={users} startChat={startChat} />
            <GroupChat users={users} createGroupChat={createGroupChat} />
            <ChatLayout client={client} activeChannel={activeChannel} />
        </div>
    );
};

export default MainLayout;

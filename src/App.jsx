import React, { useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Chat } from 'stream-chat-react';
import { client } from "./context/stream"; // Ensure this is correctly imported
import { auth, db } from "./context/firebase"; // Firebase setup (auth and db imports)
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import UserList from "./components/UserList";
import GroupChat from "./components/GroupChat";
import ChatLayout from "./components/ChatLayout"; // Import ChatLayout component
import 'stream-chat-react/dist/css/index.css';

function App() {
  const [user] = useAuthState(auth);
  const [streamUser, setStreamUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [groupChats, setGroupChats] = useState([]); // State to hold group chats
  const [currentuser, setCurrentUser] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [streamToken, setStreamToken] = useState('');
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    if (currentuser) {
      check();
    }
  }, [currentuser]);

  const check = async () => {
    const Token = await fetchStreamToken(currentuser.uid);
    setStreamToken(Token);
  };

  const fetchStreamToken = async (uid) => {
    try {
      const response = await fetch('https://chat-backend-2c4u.onrender.com/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: uid }),
      });

      const data = await response.json();
      console.log("Stream Token: ", data.token);
      return data.token;
    } catch (error) {
      console.error("Error fetching Stream token: ", error);
    }
  };

  // Sign in with Google and connect user to Stream
  const signIn = () => {
    signInWithPopup(auth, googleProvider)
      .then(async (result) => {
        const { uid, email, displayName } = result.user;
        setCurrentUser({
          id: uid,
          email: email,
          name: displayName
        });

        // Store user data in Firestore
        await setDoc(doc(db, 'users', uid), {
          uid,
          email,
          displayName,
          photoURL: result.user.photoURL,
        });

        const token = await fetchStreamToken(uid); // Fetch token after sign-in

        // Connect user to Stream Chat
        await client.connectUser(
          {
            id: uid, // The Stream user ID will be the Firebase UID
            name: displayName,
            image: result.user.photoURL,
          },
          token // Pass the token obtained from the backend
        );

        setStreamUser(client.user);
        fetchGroupChats(); // Fetch group chats after connection
      })
      .catch((error) => {
        console.error("Sign-in or Stream connection error: ", error);
      });
  };

  const signOut = async () => {
    await auth.signOut();
    if (client) {
      await client.disconnectUser();
    }
    setStreamUser(null);
  };

  // Fetch users from Firebase to display in user list
  const fetchUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersList = usersSnapshot.docs.map(doc => doc.data());
    setUsers(usersList);
  };

  // Fetch group chats from Stream
  const fetchGroupChats = async () => {
    try {
      const channels = await client.queryChannels({
        type: 'messaging',
        members: { $in: [client.userID] } // Query for channels where the user is a member
      });

      // Transform the channels into a more manageable format (e.g., id and name)
      const groupChatList = channels.map((channel) => ({
        id: channel.id,
        name: channel.data.name || "Unnamed Group",
      }));

      setGroupChats(groupChatList);
    } catch (error) {
      console.error("Error fetching group chats:", error);
    }
  };

  // Start a one-on-one chat
  const startChat = async (userId) => {
    if (!streamUser) {
      alert("Please wait, connecting to Stream Chat...");
      return;
    }

    const channel = client.channel('messaging', {
      members: [client.userID, userId],
    });
    await channel.create();
    setActiveChannel(channel);
  };

  // Start a group chat from the group list
  const startGroupChat = async (channelId) => {
    const channel = client.channel('messaging', channelId);
    await channel.watch(); // Watch the existing group chat
    setActiveChannel(channel);
  };

  // Create a new group chat
  const createGroupChat = async (groupName, selectedUsers) => {
    if (!streamUser) {
      alert("Please wait, connecting to Stream Chat...");
      return;
    }

    const members = [client.userID, ...selectedUsers];
    if (members.length < 2) {
      alert("A group must contain at least 2 members.");
      return;
    }

    try {
      const channel = client.channel('messaging', {
        name: groupName,
        members: members,
      });
      await channel.create();
      setActiveChannel(channel);
      fetchGroupChats(); // Refresh the group chat list after creation
    } catch (error) {
      console.error("Error creating group chat:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return (
    <div className="App">
      {!user ? (
        <button onClick={signIn} className="bg-blue-500 text-white px-4 py-2 rounded">
          Sign In with Google
        </button>
      ) : (
        <div>
          <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
          <div className="flex">
            <UserList users={users} startChat={startChat} groups={groupChats} startGroupChat={startGroupChat} />
            {streamUser && activeChannel && (
              <Chat client={client} theme="messaging light">
                <ChatLayout activeChannel={activeChannel} /> {/* Use ChatLayout to display chats */}
              </Chat>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState } from "react";

const GroupChat = ({ users, createGroupChat }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const toggleUserSelection = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateGroup = () => {
        if (!groupName) {
            alert("Please provide a group name.");
            return;
        }

        if (selectedUsers.length === 0) {
            alert("Please select at least one user.");
            return;
        }

        // Call the createGroupChat function from props
        createGroupChat(groupName, selectedUsers);
    };

    return (
        <div className="w-1/4 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Create Group Chat</h3>
            <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full p-2 mb-4 border rounded-lg"
            />
            <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2">Select Users</h4>
                {users.map((user) => (
                    <label key={user.uid} className="block my-1">
                        <input
                            type="checkbox"
                            value={user.uid}
                            checked={selectedUsers.includes(user.uid)}
                            onChange={() => toggleUserSelection(user.uid)}
                        />
                        {user.displayName}
                    </label>
                ))}
            </div>
            <button
                onClick={handleCreateGroup}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
            >
                Create Group
            </button>
        </div>
    );
};

export default GroupChat;

import React from "react";

const UserList = ({ users, startChat, groups, startGroupChat }) => {
    return (
        <div className="w-1/4 p-4">
            {/* User List Section */}
            <h3 className="text-xl mb-4">Users</h3>
            {users.map((user) => (
                <button
                    key={user.uid}
                    onClick={() => startChat(user.uid)}
                    className="block bg-gray-200 my-2 p-2 rounded w-full text-left"
                >
                    {user.displayName}
                </button>
            ))}

            {/* Group List Section */}
            <h3 className="text-xl mt-8 mb-4">Groups</h3>
            {groups && groups.length > 0 ? (
                groups.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => startGroupChat(group.id)}
                        className="block bg-blue-200 my-2 p-2 rounded w-full text-left"
                    >
                        {group.name}
                    </button>
                ))
            ) : (
                <p>No groups available</p>
            )}
        </div>
    );
};

export default UserList;

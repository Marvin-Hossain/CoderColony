// import React, { useState, useEffect } from "react";
// import "./UserList.css";
//
// const UserList = () => {
//     const [users, setUsers] = useState([]);
//     const [newUser, setNewUser] = useState({ username: "", email: "" });
//     const [editUser, setEditUser] = useState(null); // Tracks the user being edited
//
//     useEffect(() => {
//         fetchUsers();
//     }, []);
//
//     // Fetch all users
//     const fetchUsers = async () => {
//         try {
//             const response = await fetch("http://localhost:8080/api/users");
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             const data = await response.json();
//             setUsers(data);
//         } catch (error) {
//             console.error("Error fetching users:", error);
//         }
//     };
//
//     // Add a new user
//     const addUser = async () => {
//         try {
//             const response = await fetch("http://localhost:8080/api/users", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(newUser),
//             });
//
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//
//             // Refresh user list
//             fetchUsers();
//             setNewUser({ username: "", email: "" }); // Clear the form
//         } catch (error) {
//             console.error("Error adding user:", error);
//         }
//     };
//
//     // Update an existing user
//     const updateUser = async (id) => {
//         try {
//             const response = await fetch(`http://localhost:8080/api/users/${id}`, {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(editUser),
//             });
//
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//
//             // Refresh user list
//             fetchUsers();
//             setEditUser(null); // Exit edit mode
//         } catch (error) {
//             console.error("Error updating user:", error);
//         }
//     };
//
//     // Delete a user
//     const deleteUser = async (id) => {
//         try {
//             const response = await fetch(`http://localhost:8080/api/users/${id}`, {
//                 method: "DELETE",
//             });
//
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//
//             // Refresh user list
//             fetchUsers();
//         } catch (error) {
//             console.error("Error deleting user:", error);
//         }
//     };
//
//     return (
//         <div>
//             <h1>Admin User Management</h1>
//
//             {/* Add User Form */}
//             <h2>Add New User</h2>
//             <form
//                 onSubmit={(e) => {
//                     e.preventDefault();
//                     addUser();
//                 }}
//             >
//                 <input
//                     type="text"
//                     placeholder="Username"
//                     value={newUser.username}
//                     onChange={(e) =>
//                         setNewUser({ ...newUser, username: e.target.value })
//                     }
//                 />
//                 <input
//                     type="email"
//                     placeholder="Email"
//                     value={newUser.email}
//                     onChange={(e) =>
//                         setNewUser({ ...newUser, email: e.target.value })
//                     }
//                 />
//                 <button type="submit">Add User</button>
//             </form>
//
//             {/* User List */}
//             <h2>User List</h2>
//             <ul>
//                 {users.map((user) => (
//                     <li key={user.id}>
//                         {editUser?.id === user.id ? (
//                             // Edit Mode
//                             <>
//                                 <input
//                                     type="text"
//                                     value={editUser.username}
//                                     onChange={(e) =>
//                                         setEditUser({
//                                             ...editUser,
//                                             username: e.target.value,
//                                         })
//                                     }
//                                 />
//                                 <input
//                                     type="email"
//                                     value={editUser.email}
//                                     onChange={(e) =>
//                                         setEditUser({
//                                             ...editUser,
//                                             email: e.target.value,
//                                         })
//                                     }
//                                 />
//                                 <button onClick={() => updateUser(user.id)}>
//                                     Save
//                                 </button>
//                                 <button onClick={() => setEditUser(null)}>
//                                     Cancel
//                                 </button>
//                             </>
//                         ) : (
//                             // View Mode
//                             <>
//                                 {user.username} ({user.email})
//                                 <button onClick={() => setEditUser(user)}>
//                                     Edit
//                                 </button>
//                                 <button onClick={() => deleteUser(user.id)}>
//                                     Delete
//                                 </button>
//                             </>
//                         )}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };
//
// export default UserList;
import React, { useState, useEffect } from "react";
import "./UserList.css"; // Import custom styles

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: "", email: "" });
    const [editUser, setEditUser] = useState(null); // User currently being edited

    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/users");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Add a new user
    const addUser = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            fetchUsers();
            setNewUser({ username: "", email: "" });
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    // Update an existing user
    const updateUser = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editUser),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            fetchUsers();
            setEditUser(null); // Exit edit mode
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Delete a user
    const deleteUser = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Admin User Management</h1>

            {/* Add User Form */}
            <div className="card mb-4 shadow-sm">
                <div className="card-header bg-primary text-white">Add New User</div>
                <div className="card-body">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            addUser();
                        }}
                    >
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Username"
                                value={newUser.username}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, username: e.target.value })
                                }
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, email: e.target.value })
                                }
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Add User
                        </button>
                    </form>
                </div>
            </div>

            {/* User List Table */}
            <div className="card shadow-sm">
                <div className="card-header bg-secondary text-white">User List</div>
                <div className="card-body">
                    <table className="table table-bordered table-hover">
                        <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                {editUser?.id === user.id ? (
                                    <>
                                        <td>{user.id}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editUser.username}
                                                onChange={(e) =>
                                                    setEditUser({
                                                        ...editUser,
                                                        username: e.target.value,
                                                    })
                                                }
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={editUser.email}
                                                onChange={(e) =>
                                                    setEditUser({
                                                        ...editUser,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-success btn-sm me-2"
                                                onClick={() => updateUser(user.id)}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setEditUser(null)}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => setEditUser(user)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteUser(user.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserList;

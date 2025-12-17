import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, assignRole, removeRole } from "../../redux/slices/roleSlice";

export default function ManageUsers() {
  const dispatch = useDispatch();

  const { users, loading, error } = useSelector((state) => state.role);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleAssignRole = (walletAddress, role) => {
    dispatch(assignRole({ walletAddress, role }));
  };

  const handleRemoveRole = (walletAddress, role) => {
    dispatch(removeRole({ walletAddress, role }));
  };

  // Remove current admin from list
  const filteredUsers = users.filter(
    (user) => user.walletAddress !== currentUser?.walletAddress
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          Manage Users & Roles
        </h1>

        {loading && <p className="text-center">Loading users...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && filteredUsers.length === 0 && (
          <p className="text-center text-gray-500">No users found</p>
        )}

        {!loading && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Wallet Address</th>
                  <th className="px-4 py-3 text-left">Current Role</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const isAdmin = user.role === "admin";
                  const isManager = user.role === "electionManager";

                  return (
                    <tr key={user.walletAddress} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        {user.name || "N/A"}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {user.walletAddress}
                      </td>

                      <td className="px-4 py-3">
                        {user.role || (
                          <span className="text-gray-400">User</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center flex-wrap">
                          {/* Manager Role */}
                          {!isManager && (
                            <button
                              onClick={() =>
                                handleAssignRole(
                                  user.walletAddress,
                                  "electionManager"
                                )
                              }
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Add Manager
                            </button>
                          )}

                          {isManager && (
                            <button
                              onClick={() =>
                                handleRemoveRole(
                                  user.walletAddress,
                                  "electionManager"
                                )
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Remove Manager
                            </button>
                          )}

                          {/* Admin Role */}
                          {!isAdmin && (
                            <button
                              onClick={() =>
                                handleAssignRole(
                                  user.walletAddress,
                                  "admin"
                                )
                              }
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Make Admin
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() =>
                                handleRemoveRole(
                                  user.walletAddress,
                                  "admin"
                                )
                              }
                              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Remove Admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

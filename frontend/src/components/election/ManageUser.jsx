import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, assignRole, removeRole } from "../../redux/slices/roleSlice";

export default function ManageUsers() {
  const dispatch = useDispatch();

  const { users, loading, error } = useSelector((state) => state.role);
  const currentUser = useSelector((state) => state.auth.user);

  const currentRole = currentUser?.role;

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleAssignRole = (walletAddress, role) => {
    dispatch(assignRole({ walletAddress, role }));
  };

  const handleRemoveRole = (walletAddress, role) => {
    dispatch(removeRole({ walletAddress, role }));
  };

  // Remove self from list
  const filteredUsers = users.filter(
    (user) => user.walletAddress !== currentUser?.walletAddress
  );

  const canAssignAdmin = currentRole === "SUPER_ADMIN";
  const canAssignManager = currentRole === "SUPER_ADMIN";
  const canAssignAuthority = currentRole === "ELECTION_MANAGER";
  const canAssignVoter =
    currentRole === "ELECTION_MANAGER" ||
    currentRole === "ELECTION_AUTHORITY";

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
                  <th className="px-4 py-3 text-left">Wallet</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.walletAddress} className="border-t">
                    <td className="px-4 py-3 font-medium">
                      {user.name || "N/A"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {user.walletAddress}
                    </td>

                    <td className="px-4 py-3">
                      {user.role || (
                        <span className="text-gray-400">USER</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center flex-wrap">

                        {/* SUPER ADMIN */}
                        {canAssignAdmin && user.role !== "SUPER_ADMIN" && (
                          <button
                            onClick={() =>
                              handleAssignRole(user.walletAddress, "SUPER_ADMIN")
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Make Admin
                          </button>
                        )}

                        {canAssignAdmin && user.role === "SUPER_ADMIN" && (
                          <button
                            onClick={() =>
                              handleRemoveRole(user.walletAddress, "SUPER_ADMIN")
                            }
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Remove Admin
                          </button>
                        )}

                        {/* ELECTION MANAGER */}
                        {canAssignManager && user.role !== "ELECTION_MANAGER" && (
                          <button
                            onClick={() =>
                              handleAssignRole(
                                user.walletAddress,
                                "ELECTION_MANAGER"
                              )
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Add Manager
                          </button>
                        )}

                        {canAssignManager && user.role === "ELECTION_MANAGER" && (
                          <button
                            onClick={() =>
                              handleRemoveRole(
                                user.walletAddress,
                                "ELECTION_MANAGER"
                              )
                            }
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Remove Manager
                          </button>
                        )}

                        {/* ELECTION AUTHORITY */}
                        {canAssignAuthority &&
                          user.role !== "ELECTION_AUTHORITY" && (
                            <button
                              onClick={() =>
                                handleAssignRole(
                                  user.walletAddress,
                                  "ELECTION_AUTHORITY"
                                )
                              }
                              className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Add Authority
                            </button>
                          )}

                        {/* VOTER */}
                        {canAssignVoter && user.role !== "VOTER" && (
                          <button
                            onClick={() =>
                              handleAssignRole(user.walletAddress, "VOTER")
                            }
                            className="bg-indigo-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Add Voter
                          </button>
                        )}

                        {canAssignVoter && user.role === "VOTER" && (
                          <button
                            onClick={() =>
                              handleRemoveRole(user.walletAddress, "VOTER")
                            }
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Remove Voter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

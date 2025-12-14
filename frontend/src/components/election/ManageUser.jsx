import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  assignRole,
  removeRole
} from "../../redux/slices/roleSlice";

export default function ManageUsers() {
  const dispatch = useDispatch();

  const { users, loading, error } = useSelector((state) => state.role);
  const currentUser = useSelector((state) => state.auth.user); 
  // 👆 assumes auth slice has logged-in user

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleAssignRole = (walletAddress, role) => {
    dispatch(assignRole({ walletAddress, role }));
  };

  const handleRemoveRole = (walletAddress, role) => {
    dispatch(removeRole({ walletAddress, role }));
  };

  // 🔹 Remove current user from list
  const filteredUsers = users.filter(
    (user) => user.walletAddress !== currentUser?.walletAddress
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          Manage Users & Roles
        </h1>

        {loading && (
          <p className="text-center text-gray-600">Loading users...</p>
        )}

        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}

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
                  <th className="px-4 py-3 text-left">Roles</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.walletAddress}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {user.name || "N/A"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {user.walletAddress}
                    </td>

                    <td className="px-4 py-3">
                      {user.roles && user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No roles
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center flex-wrap">
                        {/* Assign Role */}
                        <button
                          onClick={() =>
                            handleAssignRole(
                              user.walletAddress,
                              "ELECTION_MANAGER"
                            )
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Add Manager
                        </button>

                        {/* Remove Role */}
                        <button
                          onClick={() =>
                            handleRemoveRole(
                              user.walletAddress,
                              "ELECTION_MANAGER"
                            )
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Remove Manager
                        </button>
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

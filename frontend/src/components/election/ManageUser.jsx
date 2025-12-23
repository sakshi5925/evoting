import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  getAllUsers,
  assignRole,
  removeRole,
} from "../../redux/slices/roleSlice";

export default function ManageUsers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // Remove self
  const filteredUsers = users.filter(
    (u) => u.walletAddress !== currentUser?.walletAddress
  );

  const canAssignAdmin = currentRole === "SUPER_ADMIN";
  const canAssignManager = currentRole === "SUPER_ADMIN";
  const canAssignAuthority = currentRole === "ELECTION_MANAGER";
  const canAssignVoter =
    currentRole === "ELECTION_MANAGER" ||
    currentRole === "ELECTION_AUTHORITY";

  return (
    <div className="min-h-screen bg-[#0b0f14] px-6 py-10 text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 text-sm text-gray-400 hover:text-gray-200 transition"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-semibold tracking-tight">
            Manage Users
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Assign and revoke platform roles securely
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden">
          {loading && (
            <div className="p-6 text-gray-400">Loading users…</div>
          )}

          {error && (
            <div className="p-6 text-red-400 bg-red-500/10 border-b border-red-500/20">
              {error}
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="p-6 text-gray-400">No users found</div>
          )}

          {!loading && filteredUsers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#020617] border-b border-white/10">
                  <tr className="text-left text-gray-400">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Wallet</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.walletAddress}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="px-6 py-4 font-medium">
                        {user.name || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                        {user.walletAddress}
                      </td>

                      <td className="px-6 py-4">
                        <RoleBadge role={user.role || "USER"} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {/* SUPER ADMIN */}
                          {canAssignAdmin && user.role !== "SUPER_ADMIN" && (
                            <ActionButton
                              label="Make Admin"
                              onClick={() =>
                                handleAssignRole(
                                  user.walletAddress,
                                  "SUPER_ADMIN"
                                )
                              }
                            />
                          )}

                          {canAssignAdmin && user.role === "SUPER_ADMIN" && (
                            <DangerButton
                              label="Remove Admin"
                              onClick={() =>
                                handleRemoveRole(
                                  user.walletAddress,
                                  "SUPER_ADMIN"
                                )
                              }
                            />
                          )}

                          {/* MANAGER */}
                          {canAssignManager &&
                            user.role !== "ELECTION_MANAGER" && (
                              <ActionButton
                                label="Add Manager"
                                onClick={() =>
                                  handleAssignRole(
                                    user.walletAddress,
                                    "ELECTION_MANAGER"
                                  )
                                }
                              />
                            )}

                          {canAssignManager &&
                            user.role === "ELECTION_MANAGER" && (
                              <DangerButton
                                label="Remove Manager"
                                onClick={() =>
                                  handleRemoveRole(
                                    user.walletAddress,
                                    "ELECTION_MANAGER"
                                  )
                                }
                              />
                            )}

                          {/* AUTHORITY */}
                          {canAssignAuthority &&
                            user.role !== "ELECTION_AUTHORITY" && (
                              <ActionButton
                                label="Add Authority"
                                onClick={() =>
                                  handleAssignRole(
                                    user.walletAddress,
                                    "ELECTION_AUTHORITY"
                                  )
                                }
                              />
                            )}

                          {/* VOTER */}
                          {canAssignVoter && user.role !== "VOTER" && (
                            <ActionButton
                              label="Add Voter"
                              onClick={() =>
                                handleAssignRole(
                                  user.walletAddress,
                                  "VOTER"
                                )
                              }
                            />
                          )}

                          {canAssignVoter && user.role === "VOTER" && (
                            <DangerButton
                              label="Remove Voter"
                              onClick={() =>
                                handleRemoveRole(
                                  user.walletAddress,
                                  "VOTER"
                                )
                              }
                            />
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
    </div>
  );
}

/* ---------- UI Components ---------- */

const RoleBadge = ({ role }) => {
  const colors = {
    SUPER_ADMIN: "bg-blue-500/10 text-blue-400",
    ELECTION_MANAGER: "bg-green-500/10 text-green-400",
    ELECTION_AUTHORITY: "bg-purple-500/10 text-purple-400",
    VOTER: "bg-indigo-500/10 text-indigo-400",
    USER: "bg-gray-500/10 text-gray-400",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        colors[role] || colors.USER
      }`}
    >
      {role}
    </span>
  );
};

const ActionButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-md text-xs
               bg-white/5 border border-white/10
               hover:bg-white/10 transition"
  >
    {label}
  </button>
);

const DangerButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-md text-xs
               bg-red-500/10 text-red-400
               hover:bg-red-500/20 transition"
  >
    {label}
  </button>
);



import React, { useEffect, useState } from "react";
import UserService from "./services/UserService";
import axios from "axios";

/* =======================
   INITIAL FORM STATE
======================= */
const initialState = {
  name: "",
  email: "",
  password: "",
  role: "user",
  isActive: true,
};

const User = () => {
  const [user, setUser] = useState(initialState);
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

 const [Error, setError] = useState("");


  /* =======================
     FETCH USERS
  ======================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // FIXED: Use GET request to fetch users
      const res = await axios.get("http://localhost:5000/users/add"); // backend GET /users


      
      setUsers(res.data.data || []); // backend me "data" key me users aa rahe hain
      setError("");
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError("Failed to fetch users. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =======================
     HANDLE INPUT CHANGE
 /* =======================
   HANDLE INPUT CHANGE
======================= */
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setUser((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};

/* =======================
   SUBMIT (ADD / UPDATE)
======================= */
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editId) {
      // UPDATE USER
      const res = await UserService.updateUser(editId, user);
      alert(res?.data?.message || "User updated successfully");
    } else {
      // ADD USER
      const res = await UserService.addUser(user);
      alert(res?.data?.message || "User added successfully");
    }

    // Reset form
    setUser(initialState);
    setEditId(null);

    // Refresh user list
    fetchUsers();
  } catch (err) {
    console.error("Error:", err);

    // Try to show backend message, axios message, or fallback
    const errorMsg =
      err.response?.data?.message || // backend specific message
      err.response?.data ||          // backend raw data
      err.message ||                 // axios message
      "Operation failed";

    alert(errorMsg);
  }
};


  /* =======================
     EDIT USER
  ======================= */
  const handleEdit = (u) => {
    setEditId(u._id);
    setUser({
      name: u.name,
      email: u.email,
      password: "", // do NOT auto-fill password
      role: u.role || "user",
      isActive: u.isActive ?? true,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =======================
     DELETE USER
  ======================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await UserService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* =======================
     JSX
  ======================= */
  return (
    <div className="container mt-4">
      <h3 className="mb-3">{editId ? "Update User" : "Add User"}</h3>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="card p-4 mb-4 shadow-sm">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Name *</label>
            <input
              className="form-control"
              name="name"
              value={user.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={user.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Password {editId ? "(leave blank to keep same)" : "*"}
            </label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={user.password}
              onChange={handleChange}
              required={!editId}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              name="role"
              value={user.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="col-md-4 d-flex align-items-end">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                name="isActive"
                checked={user.isActive}
                onChange={handleChange}
              />
              <label className="form-check-label">Active</label>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-4">
          {editId ? "Update User" : "Save User"}
        </button>
      </form>

      {/* TABLE */}
      <h4>User List</h4>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(u)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(u._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default User;

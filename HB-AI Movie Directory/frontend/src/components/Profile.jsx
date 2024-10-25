import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config";
import { useUser } from '../context/UserContext';
import userLogo from "../imgs/user.png";

const Profile = () => {
  const { user, updateUser } = useUser();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || userLogo);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, bio }),
      });
      if (response.ok) {
        updateUser({ name, bio });
        navigate("/");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("Failed to update profile", "error");
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const response = await fetch(`${apiUrl}/profile/picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        updateUser({ profilePicture: data.profilePicture });
        setImagePreview(data.profilePicture);
        showAlert("Profile picture updated successfully", "success");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      showAlert("Failed to upload profile picture", "error");
    }
  };

  const loadFile = (event) => {
    setImagePreview(URL.createObjectURL(event.target.files[0]));
    setFile(event.target.files[0]);
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      {alert.show && (
        <div className={`p-4 rounded-md mb-4 ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {alert.message}
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Profile</h2>
      
      <div className="mb-6">
        <div className="relative mx-auto w-40 h-40 rounded-full border-4 border-gray-300 overflow-hidden">
          <img
            src={imagePreview}
            id="output"
            alt="Profile"
            className="w-full h-full object-cover"
          />
          <label htmlFor="file" className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <span className="text-white">Change Image</span>
          </label>
          <input
            type="file"
            id="file"
            className="hidden"
            onChange={loadFile}
          />
        </div>
        <button
          onClick={handleFileUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          Upload Picture
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            htmlFor="bio"
          >
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;

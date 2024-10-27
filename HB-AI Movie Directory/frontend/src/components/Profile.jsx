import React, { useState, useEffect } from "react";
import { apiUrl } from "../config";
import { useUser } from '../context/UserContext';
import userLogo from "../imgs/user.png";

const Profile = () => {
  const { user, updateUser } = useUser();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || userLogo);
  const [previousImagePreview, setPreviousImagePreview] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUrl, setCreatedUrl] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setImagePreview(user.profilePicture || userLogo);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Create a new user object with updated values
      const updatedUserData = {
        ...user,
        name,
        bio
      };
      
      // Store the current image preview in case we need to revert
      setPreviousImagePreview(user.profilePicture);
      
      // Update the UI
      updateUser(updatedUserData);
      
      // Send updated name and bio to the server
      const profileResponse = await fetch(`${apiUrl}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, bio }),
      });
  
      if (!profileResponse.ok) {
        // If the request fails, revert the update
        updateUser(user);
        throw new Error("Failed to update profile details");
      }
  
      const profileData = await profileResponse.json();
      
      // Handle file upload if there's a new file
      if (file) {
        try {
          const formData = new FormData();
          formData.append("profilePicture", file);
  
          const pictureResponse = await fetch(`${apiUrl}/profile/picture`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          });
  
          if (!pictureResponse.ok) {
            throw new Error("Failed to upload profile picture");
          }
  
          const pictureData = await pictureResponse.json();
          
          // Update the user data with the new profile picture
          const finalUserData = {
            ...updatedUserData,
            profilePicture: pictureData.profilePicture
          };
          
          updateUser(finalUserData);
          showAlert("Profile updated successfully", "success");
        } catch (error) {
          // If picture upload fails, revert to previous image
          setImagePreview(previousImagePreview || userLogo);
          updateUser({
            ...updatedUserData,
            profilePicture: previousImagePreview
          });
          throw new Error("Failed to upload profile picture");
        }
      } else {
        showAlert("Profile updated successfully", "success");
      }
      
      // Clear the file state after successful upload
      setFile(null);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("An error occurred while updating profile", "error");
    } finally {
      setIsSubmitting(false);
      setPreviousImagePreview(null);
    }
  };

  useEffect(() => {
    // Cleanup effect
    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [createdUrl]);

  const loadFile = (event) => {
    const newFile = event.target.files[0];
    if (newFile) {
      // Cleanup previous URL if exists
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
      
      // Create and set the new image preview
      const newImageUrl = URL.createObjectURL(newFile);
      setCreatedUrl(newImageUrl);
      setImagePreview(newImageUrl);
      
      // Optimistically update the user context
      updateUser({
        ...user,
        profilePicture: newImageUrl
      });
      
      setFile(newFile);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-[85vh] text-center justify-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-orange-300 border-t-gray-300"></div>
        <p className="mt-4 text-lg text-slate-900 dark:text-white">Loading...</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Hang tight, your profile is on the way
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      {alert.show && (
        <div className={`p-4 rounded-md mb-4 ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {alert.message}
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Profile</h2>
      
      <div className="mb-6">
        <div className="relative mx-auto w-40 h-40 rounded-full border-2 border-gray-300 overflow-hidden">
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
            accept="image/*"
          />
        </div>
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
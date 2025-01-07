"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMessage } from "@/context/MessageContext";

const EditForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useMessage();
  
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string[]}>({});
  
  const type = searchParams.get("type");
  const itemId = searchParams.get("id");

  useEffect(() => {
    if (!type) {
      setMessage({
        type: "error",
        content: "Missing type parameter",
      });
      router.push("/admin");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      if (itemId) {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            throw new Error("No authentication token found");
          }

          const response = await fetch(`http://127.0.0.1:8000/api/${type}/${itemId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          // Handle both direct object response and nested object response
          const itemData = data[type.charAt(0).toUpperCase() + type.slice(1)] || data;
          setFormData(Array.isArray(itemData) ? itemData[0] : itemData);
        } catch (error) {
          console.error("Error fetching item data:", error);
          setMessage({
            type: "error",
            content: error instanceof Error ? error.message : "Failed to load data",
          });
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [type, itemId, router, setMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: fileInput.files ? fileInput.files[0] : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // Clear the error for this field when the user starts typing
    setErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const token = localStorage.getItem("authToken");
      const url = itemId ? `http://127.0.0.1:8000/api/${type}/${itemId}` : `http://127.0.0.1:8000/api/${type}`;
      const method = itemId ? "POST" : "POST"; // Changed to POST for both create and update due to file upload

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (itemId) {
        formDataToSend.append('_method', 'PUT'); // For Laravel to recognize this as a PUT request
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          // Don't set Content-Type here, let the browser set it with the boundary for multipart/form-data
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
          throw new Error("Validation failed");
        }
        throw new Error(`Failed to ${itemId ? 'update' : 'create'} ${type}`);
      }

      setMessage({
        type: "success",
        content: `${type} ${itemId ? 'updated' : 'created'} successfully`,
      });
      router.push("/admin");
    } catch (error) {
      console.error("Error:", error);
      if (!(error instanceof Error && error.message === "Validation failed")) {
        setMessage({
          type: "error",
          content: error instanceof Error ? error.message : "Failed to save data",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderFormFields = () => {
    switch (type) {
      case "music-tracks":
        return (
          <>
            <input type="hidden" name="id" value={formData.id || ''} onChange={handleChange} />
            <div>
              <label htmlFor="title" className="block mb-1">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
            </div>
            <div>
              <label htmlFor="artist" className="block mb-1">Artist:</label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
              {errors.artist && <p className="text-red-500 text-sm mt-1">{errors.artist[0]}</p>}
            </div>
            <div>
              <label htmlFor="album" className="block mb-1">Album:</label>
              <input
                type="text"
                id="album"
                name="album"
                value={formData.album || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
              {errors.album && <p className="text-red-500 text-sm mt-1">{errors.album[0]}</p>}
            </div>
            <div>
              <label htmlFor="price" className="block mb-1">Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
                min="0"
                step="0.01"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
            </div>
            <div>
              <label htmlFor="is_free" className="block mb-1">Is Free:</label>
              <select
                id="is_free"
                name="is_free"
                value={formData.is_free || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              >
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
              {errors.is_free && <p className="text-red-500 text-sm mt-1">{errors.is_free[0]}</p>}
            </div>
            <div>
              <label htmlFor="file_path" className="block mb-1">Music File:</label>
              <input
                type="file"
                id="file_path"
                name="file_path"
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                accept=".mp3,.wav"
                required={!itemId}
              />
              {errors.file_path && <p className="text-red-500 text-sm mt-1">{errors.file_path[0]}</p>}
              {formData.file_path && typeof formData.file_path === 'string' && (
                <p className="text-sm text-gray-600 mt-1">Current file: {formData.file_path}</p>
              )}
            </div>
          </>
        );
      case "users":
        return (
          <>
            <input type="hidden" name="id" value={formData.id || ''} onChange={handleChange} />
            <div>
              <label htmlFor="name" className="block mb-1">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block mb-1">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block mb-1">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required={!itemId}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
            </div>
            <div>
              <label htmlFor="password_confirmation" className="block mb-1">Confirm Password:</label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required={!itemId}
              />
              {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation[0]}</p>}
            </div>
            <div>
              <label htmlFor="role" className="block mb-1">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role[0]}</p>}
            </div>
          </>
        );
      case "events":
        return (
          <>
            <input type="hidden" name="id" value={formData.id || ''} onChange={handleChange} />
            <div>
              <label htmlFor="name" className="block mb-1">Event Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
            </div>
            <div>
              <label htmlFor="date" className="block mb-1">Event Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date[0]}</p>}
            </div>
            <div>
              <label htmlFor="location" className="block mb-1">Event Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location[0]}</p>}
            </div>
            <div>
              <label htmlFor="price" className="block mb-1">Event Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
                min="0"
                step="0.01"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-6 py-8"
    >
      <h2 className="text-2xl font-bold mb-4">
        {itemId ? 'Edit' : 'Add'} {type ? type.replace("-", " ") : "Unknown Type"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        {renderFormFields()}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {itemId ? 'Save Changes' : 'Create'}
        </button>
      </form>
    </motion.div>
  );
};

export default EditForm;


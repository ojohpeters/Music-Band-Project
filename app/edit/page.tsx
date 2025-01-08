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
          const itemData = data[type.charAt(0).toUpperCase() + type.slice(1)] || data;
          setFormData(Array.isArray(itemData) ? itemData[0] : itemData);
        } catch (error) {
          console.error("Error fetching item data:", error);
          setMessage({
            type: "error",
            content: error instanceof Error ? error.message : "Failed to load data",
          });
        }
      } else {
        setFormData({});
      }
      setIsLoading(false);
    };

    fetchData();
  }, [type, itemId, router, setMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: fileInput.files ? fileInput.files[0] : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const token = localStorage.getItem("authToken");
      const url = itemId 
        ? `http://127.0.0.1:8000/api/${type}/${itemId}`
        : `http://127.0.0.1:8000/api/${type}`;
  
      const method = itemId ? "POST" : "POST";  // Keep this as POST
      
      const formDataToSend = new FormData();
      
      // For update operations, we need to specify this is actually a PUT request
      if (itemId) {
        formDataToSend.append('_method', 'PUT');  // This tells Laravel to treat it as PUT
      }
  
      // Handle the form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          // Special handling for file inputs
          if ((key === 'file_path' || key === 'cover_image') && formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          } 
          // Handle all other fields
          else if (!(formData[key] instanceof File)) {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
  
      const response = await fetch(url, {
        method: "POST",  // Always POST when sending files with FormData
        headers: {
          "Authorization": `Bearer ${token}`,
          // Don't set Content-Type - let the browser set it with the boundary
        },
        body: formDataToSend,
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.messages) {
          setErrors(errorData.messages);
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
              <label htmlFor="title" className="text-gray-700 dark:text-gray-300 block mb-1">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
            </div>
            <div>
              <label htmlFor="artist" className="text-gray-700 dark:text-gray-300 block mb-1">Artist:</label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.artist && <p className="text-red-500 text-sm mt-1">{errors.artist[0]}</p>}
            </div>
            <div>
              <label htmlFor="album" className="text-gray-700 dark:text-gray-300 block mb-1">Album:</label>
              <input
                type="text"
                id="album"
                name="album"
                value={formData.album || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.album && <p className="text-red-500 text-sm mt-1">{errors.album[0]}</p>}
            </div>
            <div>
              <label htmlFor="price" className="text-gray-700 dark:text-gray-300 block mb-1">Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
                min="0"
                step="0.01"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
            </div>
            <div>
              <label htmlFor="is_free" className="text-gray-700 dark:text-gray-300 block mb-1">Is Free:</label>
              <select
                id="is_free"
                name="is_free"
                value={formData.is_free || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              >
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
              {errors.is_free && <p className="text-red-500 text-sm mt-1">{errors.is_free[0]}</p>}
            </div>
            <div>
              <label htmlFor="file_path" className="text-gray-700 dark:text-gray-300 block mb-1">Music File:</label>
              <input
                type="file"
                id="file_path"
                name="file_path"
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                accept=".mp3,.wav"
                required={!itemId}
              />
              {errors.file_path && <p className="text-red-500 text-sm mt-1">{errors.file_path.join(', ')}</p>}
              {formData.file_path && typeof formData.file_path === 'string' && (
                <p className="text-sm text-gray-600 mt-1">Current file: {formData.file_path}</p>
              )}
            </div>
            <div>
              <label htmlFor="cover_image" className="text-gray-700 dark:text-gray-300 block mb-1">Cover Image:</label>
              <input
                type="file"
                id="cover_image"
                name="cover_image"
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                accept="image/*"
              />
              {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image[0]}</p>}
              {formData.cover_image && typeof formData.cover_image === 'string' && (
                <img src={formData.cover_image} alt="Current cover" className="mt-2 max-w-xs" />
              )}
            </div>
          </>
        );

      case "events":
        return (
          <>
            <input type="hidden" name="id" value={formData.id || ''} onChange={handleChange} />
            <div>
              <label htmlFor="name" className="text-gray-700 dark:text-gray-300 block mb-1">Event Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
            </div>
            <div>
              <label htmlFor="date" className="text-gray-700 dark:text-gray-300 block mb-1">Event Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date[0]}</p>}
            </div>
            <div>
              <label htmlFor="location" className="text-gray-700 dark:text-gray-300 block mb-1">Event Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location[0]}</p>}
            </div>
            <div>
              <label htmlFor="price" className="text-gray-700 dark:text-gray-300 block mb-1">Event Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
                min="0"
                step="0.01"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
            </div>
            <div>
              <label htmlFor="cover_image" className="text-gray-700 dark:text-gray-300 block mb-1">Event Cover Image:</label>
              <input
                type="file"
                id="cover_image"
                name="cover_image"
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                accept="image/*"
              />
              {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image[0]}</p>}
              {formData.cover_image && typeof formData.cover_image === 'string' && (
                <img src={formData.cover_image} alt="Current event cover" className="mt-2 max-w-xs" />
              )}
            </div>
          </>
        );

      case "users":
        return (
          <>
            <input type="hidden" name="id" value={formData.id || ''} onChange={handleChange} />
            <div>
              <label htmlFor="name" className="text-gray-700 dark:text-gray-300 block mb-1">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
            </div>
            <div>
              <label htmlFor="date" className="text-gray-700 dark:text-gray-300 block mb-1">Event Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date[0]}</p>}
            </div>
            <div>
              <label htmlFor="location" className="text-gray-700 dark:text-gray-300 block mb-1">Event Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location[0]}</p>}
            </div>
            <div>
              <label htmlFor="price" className="text-gray-700 dark:text-gray-300 block mb-1">Event Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
                min="0"
                step="0.01"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
            </div>
            <div>
              <label htmlFor="cover_image" className="text-gray-700 dark:text-gray-300 block mb-1">Event Cover Image:</label>
              <input
                type="file"
                id="cover_image"
                name="cover_image"
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                accept="image/*"
              />
              {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image[0]}</p>}
              {formData.cover_image && typeof formData.cover_image === 'string' && (
                <img src={formData.cover_image} alt="Current event cover" className="mt-2 max-w-xs" />
              )}
            </div>
          </>
        );
      case "users":
        return (
          <>
            <input type="hidden" name="id" value={formData.id || ''} onChange={handleChange} />
            <div>
              <label htmlFor="name" className="text-gray-700 dark:text-gray-300 block mb-1">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
            </div>
            <div>
              <label htmlFor="email" className="text-gray-700 dark:text-gray-300 block mb-1">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
            </div>
            <div>
              <label htmlFor="password" className="text-gray-700 dark:text-gray-300 block mb-1">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required={!itemId}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
            </div>
            <div>
              <label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-300 block mb-1">Confirm Password:</label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required={!itemId}
              />
              {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation[0]}</p>}
            </div>
            <div>
              <label htmlFor="role" className="text-gray-700 dark:text-gray-300 block mb-1">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role[0]}</p>}
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
      className="container mx-auto px-6 py-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
    >
      <h2 className="text-2xl font-bold mb-4">
        {itemId ? 'Edit' : 'Add'} {type ? type.replace("-", " ") : "Unknown Type"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        {renderFormFields()}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
          {itemId ? 'Save Changes' : 'Create'}
        </button>
      </form>
    </motion.div>
  );
};

export default EditForm;


"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // This imports useSearchParams
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMessage } from "@/context/MessageContext"; // Assuming the message context exists

const EditForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();  // Get query parameters
  const { setMessage } = useMessage();
  
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const type = searchParams.get("type");  // Get 'type' from URL query
  const itemId = searchParams.get("id");  // Get 'id' from URL query

  useEffect(() => {
    if (!type || !itemId) {
      setMessage({
        type: "error",
        content: "Missing type or ID parameter",
      });
      router.push("/admin");  // Redirect to the admin page if missing parameters
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
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
        setFormData(data);
      } catch (error) {
        console.error("Error fetching item data:", error);
        setMessage({
          type: "error",
          content: error instanceof Error ? error.message : "Failed to load data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, itemId, router, setMessage]); // Trigger effect on type or itemId change

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://127.0.0.1:8000/api/${type}/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${type}`);
      }

      setMessage({
        type: "success",
        content: `${type} updated successfully`,
      });
      router.push("/admin");
    } catch (error) {
      setMessage({
        type: "error",
        content: error instanceof Error ? error.message : "Failed to save data",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-6 py-8"
    >
      <h2 className="text-2xl font-bold mb-4">
        Edit {type ? type.replace("-", " ") : "Unknown Type"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Render form based on `type` */}
        {type === "music-tracks" && (
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
            </div>
            <div>
              <label htmlFor="type" className="block mb-1">Type:</label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                required
              />
            </div>
          </>
        )}
        
        {/* Rendering for Users */}
        {type === "users" && (
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
            </div>
          </>
        )}

        {/* Rendering for Events */}
        {type === "events" && (
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
            </div>
          </>
        )}

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Save Changes
        </button>
      </form>
    </motion.div>
  );
};

export default EditForm;

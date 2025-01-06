"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useMessage } from "@/context/MessageContext"; // Adjust import as needed


interface FormData {
  id?: string;
  title?: string;
  artist?: string;
  type?: string;
  name?: string;
  email?: string;
  date?: string;
  // Add other fields as needed
}


const EditForm: React.FC<{ type: "music-tracks" | "events" | "users" }> = ({ type }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useMessage();
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const itemId = searchParams.get("id");

    if (!itemId) {
      setMessage({ type: "error", content: "No ID provided" });
      router.push("/admin"); // Redirect back to admin page
      return;
    }

    const fetchData = async () => {
      setIsLoading(true)
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
        setIsLoading(false)
      }
    };

    fetchData();
  }, [searchParams, type]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
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

        type: 'success',

        content: `${type} updated successfully`

      });
      router.push("/admin")
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
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-6 py-8"
    >
      <h2 className="text-2xl font-bold mb-4">Edit {type.replace("-", " ")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Music Track Fields */}
        {type === "music-tracks" && (
          <>
            <input type="hidden" name="id" value={formData.id} onChange={handleChange} />
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
         {/* Event Fields */}
         {type === "events" && (
          <>
            <input type="hidden" name="id" value={formData.id} onChange={handleChange} />
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
              <label htmlFor="date" className="block mb-1">Date:</label>
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
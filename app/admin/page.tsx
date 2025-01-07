"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useMessage } from "@/context/MessageContext";

const AdminPage = () => {
  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("Music");
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { setMessage: globalSetMessage } = useMessage();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const fetchWithAuth = async (url: string) => {
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            router.push('/login');
            throw new Error('Unauthorized access');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      };

      const [musicData, userData, eventData] = await Promise.all([
        fetchWithAuth("http://127.0.0.1:8000/api/music-tracks"),
        fetchWithAuth("http://127.0.0.1:8000/api/users"),
        fetchWithAuth("http://127.0.0.1:8000/api/events")
      ]);

      setMusicTracks(Array.isArray(musicData) ? musicData : (musicData.MusicTracks || []));
      setUsers(Array.isArray(userData) ? userData : (userData.Users || []));
      setEvents(Array.isArray(eventData) ? eventData : (eventData.Events || []));

      globalSetMessage({
        type: 'success',
        content: 'Data loaded successfully'
      });
    } catch (error) {
      console.error("Error during fetch:", error);
      globalSetMessage({
        type: 'error',
        content: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (type: string, id?: string) => {
    router.push(`/edit?type=${type}${id ? `&id=${id}` : ''}`);
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/${type}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}`);
      }

      globalSetMessage({
        type: 'success',
        content: `${type} deleted successfully`
      });

      fetchData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      globalSetMessage({
        type: 'error',
        content: error instanceof Error ? error.message : 'Failed to delete data'
      });
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Music":
        return renderMusicTracks();
      case "Users":
        return renderUsers();
      case "Events":
        return renderEvents();
      default:
        return null;
    }
  };

  const renderMusicTracks = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Music Tracks</h2>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4 flex items-center"
        onClick={() => handleEdit("music-tracks")}
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add Music Track
      </button>
      {musicTracks.length === 0 ? (
        <p>No music tracks found.</p>
      ) : (
        <table className="min-w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Title</th>
              <th className="border border-gray-300 px-4 py-2">Artist</th>
              <th className="border border-gray-300 px-4 py-2">Album</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {musicTracks.map((track) => (
              <tr key={track.id}>
                <td className="border border-gray-300 px-4 py-2">{track.title}</td>
                <td className="border border-gray-300 px-4 py-2">{track.artist}</td>
                <td className="border border-gray-300 px-4 py-2">{track.album}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit("music-tracks", track.id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mx-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("music-tracks", track.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 mx-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderUsers = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4 flex items-center"
        onClick={() => handleEdit("users")}
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add User
      </button>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="min-w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit("users", user.id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mx-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("users", user.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 mx-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderEvents = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Events</h2>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4 flex items-center"
        onClick={() => handleEdit("events")}
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add Event
      </button>
      {events.length === 0 || events.every(event => Object.keys(event).length === 0 || !event.name || !event.date) ? (
  <p>No events found.</p>
      ) : (
        <table className="min-w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Event Name</th>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="border border-gray-300 px-4 py-2">{event.name}</td>
                <td className="border border-gray-300 px-4 py-2">{event.date}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit("events", event.id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mx-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("events", event.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 mx-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="p-8">
      {isLoading && (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!isLoading && (
        <div>
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded ${selectedTab === "Music" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
              onClick={() => setSelectedTab("Music")}
            >
              Music
            </button>
            <button
              className={`px-4 py-2 rounded ${selectedTab === "Users" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
              onClick={() => setSelectedTab("Users")}
            >
              Users
            </button>
            <button
              className={`px-4 py-2 rounded ${selectedTab === "Events" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
              onClick={() => setSelectedTab("Events")}
            >
              Events
            </button>
          </div>
          {renderTabContent()}
        </div>
      )}
    </div>
  );
};

export default AdminPage;


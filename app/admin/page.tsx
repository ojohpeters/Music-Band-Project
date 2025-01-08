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
  const [userRole, setUserRole] = useState<string | null>(null);

  const router = useRouter();
  const { setMessage } = useMessage();

  useEffect(() => {
    const checkUserAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/user", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUserRole(userData.role);

        if (userData.role !== 'admin') {
          setMessage({
            type: 'error',
            content: 'Unauthorized! Restricted page.'
          });
          router.back();
        } else {
          fetchData();
        }
      } catch (error) {
        console.error("Error checking user auth:", error);
        setMessage({
          type: 'error',
          content: 'An error occurred while checking authorization.'
        });
        router.push('/login');
      }
    };

    checkUserAuth();
  }, [router, setMessage]);

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

      setMessage({
        type: 'success',
        content: 'Data loaded successfully'
      });
    } catch (error) {
      console.error("Error during fetch:", error);
      setMessage({
        type: 'error',
        content: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (type: string, id?: string) => {
    console.log(`Editing ${type} with ID: ${id}`);
    const url = `/edit?type=${type}${id ? `&id=${id}` : ''}`;
    console.log(`Navigating to: ${url}`);
    router.push(url);
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

      setMessage({
        type: 'success',
        content: `${type} deleted successfully`
      });

      fetchData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setMessage({
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
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Title</th>
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Artist</th>
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Album</th>
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {musicTracks.map((track) => (
              <tr key={track.id}>
                <td className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">{track.title}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">{track.artist}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">{track.album}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit("music-tracks", track.id.toString())}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mx-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("music-tracks", track.id.toString())}
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
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Role</th>
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.role === 'admin' ? (
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="ml-2 text-gray-800 dark:text-gray-200">Admin</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit("users", user.id.toString())}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mx-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete("users", user.id.toString())}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 mx-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
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
      {console.log("Events data:", events)}
      {events.length === 0 || events.every(event => Object.keys(event).length === 0 || !event.name || !event.date) ? (
        <p>No events found.</p>
      ) : (
        <table className="min-w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Event Name</th>
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">{event.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">{event.date}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit("events", event.id.toString())}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mx-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete("events", event.id.toString())}
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null; // This will prevent the admin content from rendering while redirecting
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
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
    </div>
  );
};

export default AdminPage;


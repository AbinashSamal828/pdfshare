// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import Upload from "../components/Upload";
import { PdfGrid } from "../components/PdfGrid";
import { HiOutlineSearch, HiOutlineLogout } from "react-icons/hi";
import { CgSpinner } from "react-icons/cg";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const [ownedPdfs, setOwnedPdfs] = useState([]);
  const [sharedPdfs, setSharedPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPdfs() {
      setLoading(true);
      try {
        const res = await axios.get("/pdf/pdfs");
        setOwnedPdfs(res.data.ownedPdfs || []);
        setSharedPdfs(res.data.sharedPdfs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPdfs();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredOwnedPdfs = ownedPdfs.filter((pdf: any) =>
    pdf.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSharedPdfs = sharedPdfs.filter((pdf: any) =>
    pdf.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="text-black min-h-screen bg-gray-50 flex flex-col py-10">
      {/* Floating Upload Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="shadow-lg rounded-full">
          <Upload />
        </div>
      </div>

      <header className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-6">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="absolute top-0 right-4 flex items-center space-x-2 py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition"
        >
          <HiOutlineLogout className="text-xl" />
          <span>Logout</span>
        </button>

        <div className="relative">
          <HiOutlineSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search for your PDFs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center mt-20">
            <CgSpinner className="animate-spin text-purple-600 text-5xl" />
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                My PDFs
              </h2>
              {filteredOwnedPdfs.length > 0 ? (
                <PdfGrid pdfs={filteredOwnedPdfs} />
              ) : (
                <p className="text-gray-500">
                  You haven't uploaded any PDFs yet.
                </p>
              )}
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Shared with me
              </h2>
              {filteredSharedPdfs.length > 0 ? (
                <PdfGrid pdfs={filteredSharedPdfs} />
              ) : (
                <p className="text-gray-500">
                  No PDFs have been shared with you.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "../api/axios";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import { HiArrowLeft } from "react-icons/hi2";
import { FaBold, FaItalic, FaPaperPlane, FaShare } from "react-icons/fa";

import { useAuth } from "../auth/AuthContext";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  const [numPages, setNumPages] = useState<number | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const commentBoxRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    axios.get(`/pdf/${id}/view-url`).then((res) => {
      setPdf(res.data);
      console.log(res);
    });
    axios.get(`/comments/${id}/comments`).then((res) => {
      setComments(res.data);
    });
  }, [id]);

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  const inviteHandler = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      await axios.post(`/pdf/${id}/share`, {
        email: inviteEmail,
      });

      alert(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
    } catch (error: any) {
      console.error("Failed to send invitation:", error);
      if (error.response?.status === 404) {
        alert("User with that email does not exist.");
      } else if (error.response?.status === 400) {
        alert("This user already owns the PDF.");
      } else {
        alert("Failed to send invitation. Please try again.");
      }
    }
  };

  const generateShareLink = async () => {
    if (!id) return;
    // console.log("working");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Optional: handle case where token is missing, though PrivateRoute should prevent this
        return;
      }
      const res = await axios.post(
        `/pdf/${id}/generate-share-link`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShareLink(res.data.shareLink);
      setIsShareModalOpen(true);
    } catch (error) {
      console.error("Failed to generate share link:", error);
      alert("Could not generate share link.");
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const postComment = async () => {
    await axios.post(`/comments/${id}/comment`, { text });
    const res = await axios.get(`/comments/${id}/comments`);
    setComments(res.data);
    setText("");
  };

  const applyFormatting = (format: "bold" | "italic" | "bullet") => {
    const textarea = commentBoxRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    let newText;

    switch (format) {
      case "bold":
        newText = `${text.substring(
          0,
          start
        )}**${selectedText}**${text.substring(end)}`;
        break;
      case "italic":
        newText = `${text.substring(0, start)}*${selectedText}*${text.substring(
          end
        )}`;
        break;
      case "bullet":
        const bulletedText = selectedText
          .split("\n")
          .map((line) => `- ${line}`)
          .join("\n");
        newText = `${text.substring(0, start)}${bulletedText}${text.substring(
          end
        )}`;
        break;
      default:
        newText = text;
    }

    setText(newText);
    textarea.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-start justify-center py-10 gap-8 px-4">
      {/* Left Panel: PDF Viewer and controls */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-5xl">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <HiArrowLeft className="text-2xl text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-purple-700">
              {pdf?.filename || "Loading..."}
            </h2>
          </div>
          {/* Show sharing controls only to the owner */}
          {user?.userId === pdf?.ownerId && (
            <div className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="Enter email to invite..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="px-4 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <button
                className="ml-2 py-2 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300"
                onClick={inviteHandler}
              >
                Invite
              </button>
              <button
                onClick={generateShareLink}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md flex items-center"
                title="Get shareable link"
              >
                <FaShare />
              </button>
            </div>
          )}
        </div>
        <div
          className="border rounded-lg overflow-hidden"
          style={{ height: "calc(100vh - 15rem)" }}
        >
          <Document
            file={pdf?.url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="p-4 text-center">Loading PDF...</div>}
            className="h-full overflow-y-auto"
          >
            {Array.from(new Array(numPages || 0), (element, index) => (
              <div
                key={`page_wrapper_${index + 1}`}
                className="flex justify-center mb-4 shadow-lg"
              >
                <Page
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>

      {/* Right Panel: Comments */}
      <div
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 flex flex-col"
        style={{ height: "calc(100vh - 5rem)" }}
      >
        <div className="flex-grow overflow-y-auto pr-2">
          <h3 className="text-lg font-semibold text-purple-700 mb-2 sticky top-0 bg-white pb-2 z-10">
            Comments
          </h3>
          <div className="space-y-4">
            {comments.map((c: any) => (
              <div
                key={c.id}
                className="bg-purple-50 rounded-lg p-3 text-gray-800"
              >
                <span className="font-bold text-purple-700 mr-2">
                  {c.user?.name || c.guestName || "Anonymous"}:
                </span>
                <article className="prose prose-sm whitespace-pre-wrap">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {c.text}
                  </ReactMarkdown>
                </article>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            placeholder="Add a comment..."
            ref={commentBoxRef}
            rows={4}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => applyFormatting("bold")}
                className="p-2 hover:bg-gray-200 rounded-md"
                title="Bold"
              >
                <FaBold className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={() => applyFormatting("italic")}
                className="p-2 hover:bg-gray-200 rounded-md"
                title="Italic"
              >
                <FaItalic className="h-4 w-4 text-gray-700" />
              </button>
            </div>
            <button
              onClick={postComment}
              className="py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-blue-600 transition"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-700">
              Share this PDF
            </h3>
            <p className="text-gray-600 mb-2">
              Anyone with this link can view and comment:
            </p>
            <input
              type="text"
              readOnly
              value={shareLink || ""}
              className="w-full p-2 border rounded-lg bg-gray-100 mb-4"
              onFocus={(e) => e.target.select()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(shareLink || "")}
                className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Copy Link
              </button>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "../api/axios";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import { CgSpinner } from "react-icons/cg";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function SharePage() {
  const { shareToken } = useParams();
  const [pdfInfo, setPdfInfo] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [guestName, setGuestName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const commentBoxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!shareToken) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const pdfRes = await axios.get(`/public/pdf/${shareToken}`);
        setPdfInfo(pdfRes.data);

        const commentsRes = await axios.get(`/public/comments/${shareToken}`);
        setComments(commentsRes.data);
      } catch (error) {
        console.error("Failed to load shared document:", error);
        alert("This shared link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shareToken]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const postGuestComment = async () => {
    if (!text || !guestName) {
      alert("Please provide your name and a comment.");
      return;
    }
    try {
      const res = await axios.post(`/public/comments/${shareToken}`, {
        text,
        guestName,
      });
      setComments([...comments, res.data]);
      setText("");
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Could not post comment. Please try again.");
    }
  };

  // ... (applyFormatting function can be copied from PdfDetails.tsx if needed)

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <CgSpinner className="animate-spin text-purple-600 text-6xl" />
      </div>
    );
  }

  if (!pdfInfo) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <p className="text-red-500 text-2xl">Could not load shared PDF.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center py-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          {pdfInfo.filename}
        </h2>
        <div className="flex justify-center mb-6 border rounded-lg overflow-hidden">
          <Document
            file={pdfInfo.url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p>Loading PDF...</p>}
          >
            {Array.from(new Array(numPages || 0), (element, index) => (
              <div key={`page_wrapper_${index + 1}`} className="mb-4 shadow-lg">
                <Page
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Enter your name to comment..."
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Add a comment..."
            ref={commentBoxRef}
          />
          <button
            onClick={postGuestComment}
            className="w-full py-2 px-4 mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-blue-600 transition"
          >
            Post Comment as Guest
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-purple-700 mb-2">
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
      </div>
    </div>
  );
}

import { HiOutlineDocumentText } from "react-icons/hi";
import { Link } from "react-router-dom";

export const PdfGrid = ({ pdfs }: { pdfs: any[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {pdfs.map((pdf: any) => (
      <Link
        to={`/pdf/${pdf.id}`}
        key={pdf.id}
        className="group bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 flex flex-col items-center cursor-pointer border border-transparent hover:border-purple-300"
      >
        <HiOutlineDocumentText className="text-purple-500 text-5xl mb-4 group-hover:scale-110 transition" />
        <span className="text-lg font-medium text-gray-800 text-center break-words group-hover:text-purple-700">
          {pdf.filename}
        </span>
      </Link>
    ))}
  </div>
);

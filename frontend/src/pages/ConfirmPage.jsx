import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import api from "../services/api";

const ConfirmPage = () => {
  const { token } = useParams();
  const hasRun = useRef(false);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token && !hasRun.current) {
      hasRun.current = true;
      api
        .get(`/subscriptions/confirm/${token}`)
        .then((res) => {
          if (res.data.success) {
            setStatus("success");
          } else {
            setStatus("error");
            setMessage(res.data.message || "Confirmation failed");
          }
        })
        .catch((err) => {
          setStatus("error");
          setMessage(
            err.response?.data?.message ||
              "This confirmation link is invalid or has already been used.",
          );
        });
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <div>
            <Loader
              size={48}
              className="text-pink-500 mx-auto mb-4 animate-spin"
            />
            <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-2">
              Confirming your subscription...
            </h2>
            <p className="text-gray-500">Please wait a moment.</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <CheckCircle size={48} className="text-pink-500 mx-auto mb-4" />
            <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-2">
              You are confirmed!
            </h2>
            <p className="text-gray-500 mb-8">
              Welcome to Blogbase. Your subscription is now active. Check your
              inbox for a welcome email.
            </p>
            <Link
              to="/"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              Start Reading
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-2">
              Confirmation failed
            </h2>
            <p className="text-gray-500 mb-8">
              {message ||
                "This confirmation link is invalid or has already been used."}
            </p>
            <Link
              to="/subscribe"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              Subscribe again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmPage;

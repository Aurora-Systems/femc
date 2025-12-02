import React from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface NoticePreviewProps {
  noticeData: {
    firstName: string;
    middleName?: string;
    maidenName?: string;
    nickname?: string;
    lastName: string;
    location: string;
    birthDate?: string;
    passedDate: string;
    obituary: string;
    serviceDetails?: string;
    photo?: string;
    noticeType: string;
  };
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isSubmitting?: boolean;
}

export function NoticePreview({ noticeData, onClose, onConfirm, isSubmitting = false }: NoticePreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto min-h-screen">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl text-[#0f172a]">Preview Your Notice</h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 border-2 border-[#0f172a] rounded-lg overflow-hidden">
            <div className="bg-[#0f172a] text-white px-6 py-3">
              <p className="text-sm opacity-80">{noticeData.noticeType}</p>
            </div>
            
            {noticeData.photo && (
              <div className="w-full h-64 bg-slate-200">
                <img 
                  src={noticeData.photo} 
                  alt={`${noticeData.firstName} ${noticeData.middleName || ""} ${noticeData.lastName}`.trim()}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6 bg-white">
              <h3 className="text-3xl text-[#0f172a] mb-2">
                {[
                  noticeData.firstName,
                  noticeData.middleName,
                  noticeData.nickname && `"${noticeData.nickname}"`,
                  noticeData.lastName
                ].filter(Boolean).join(" ")}
                {noticeData.maidenName && noticeData.maidenName !== noticeData.lastName && (
                  <span className="text-xl text-slate-600 font-normal">
                    {" "}(née {noticeData.maidenName})
                  </span>
                )}
              </h3>
              
              <div className="text-slate-600 mb-4">
                <p>{noticeData.location}</p>
                {noticeData.birthDate && noticeData.passedDate && (
                  <p className="text-sm mt-1">
                    {formatDate(noticeData.birthDate)} - {formatDate(noticeData.passedDate)}
                  </p>
                )}
                {!noticeData.birthDate && noticeData.passedDate && (
                  <p className="text-sm mt-1">
                    Passed away {formatDate(noticeData.passedDate)}
                  </p>
                )}
              </div>

              <div className="border-t pt-4 mb-4">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {noticeData.obituary}
                </p>
              </div>

              {noticeData.serviceDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-[#0f172a] mb-2">Service Details</h4>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">
                    {noticeData.serviceDetails}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-slate-50 border rounded-lg p-4">
            <p className="text-sm text-slate-600">
              This is how your notice will appear on the website. Please review carefully before submitting.
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <Button 
              onClick={onConfirm}
              className="flex-1 bg-[#0f172a] hover:bg-[#1e3a5f]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Edit Notice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { X, MapPin, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
    dateOfPassing?: string;
    obituary: string;
    serviceDetails?: string;
    photo?: string;
    noticeType: string;
    organizationName?: string;
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

  const calculateAge = (birthDate: string, passedDate: string): number | null => {
    if (!birthDate || !passedDate) return null;
    try {
      const birth = new Date(birthDate);
      const passed = new Date(passedDate);
      let age = passed.getFullYear() - birth.getFullYear();
      const monthDiff = passed.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && passed.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    } catch {
      return null;
    }
  };

  const isDeathNotice = noticeData.noticeType === "Death Notice";
  const isCondolenceNotice = noticeData.noticeType === "Condolences Notice";
  const age = noticeData.birthDate && noticeData.passedDate 
    ? calculateAge(noticeData.birthDate, noticeData.passedDate) 
    : null;

  const getPlaceholderImage = (): string => {
    switch (noticeData.noticeType) {
      case "Death Notice":
        return "https://funeralnotices.sirv.com/1.png";
      case "Memorial Service":
        return "https://funeralnotices.sirv.com/3.png";
      case "Tombstone Unveiling":
        return "https://funeralnotices.sirv.com/2.png";
      default:
        return "https://funeralnotices.sirv.com/1.png";
    }
  };

  const imageSrc = noticeData.photo || getPlaceholderImage();

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
          <Card className="border-2 border-slate-200 overflow-hidden gap-0">
            <div className="bg-[#0f172a] text-white px-6 py-3">
              <p className="text-sm opacity-80">{noticeData.noticeType}</p>
            </div>
            <div className="relative w-full bg-slate-200" style={{ aspectRatio: '1/1' }}>
              <ImageWithFallback
                src={imageSrc}
                alt={isCondolenceNotice && noticeData.organizationName 
                  ? noticeData.organizationName 
                  : `${noticeData.firstName} ${noticeData.middleName || ""} ${noticeData.lastName}`.trim()}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ps-6 pe-6 pb-6 pt-2">
              {isCondolenceNotice && noticeData.organizationName ? (
                <h3 className="text-xl text-[#0f172a] mb-1">
                  {noticeData.organizationName}
                </h3>
              ) : (
                <h3 className="text-xl text-[#0f172a] mb-1">
                  {[
                    noticeData.firstName,
                    noticeData.middleName,
                    noticeData.maidenName && `"${noticeData.maidenName}"`,
                    noticeData.lastName,
                    noticeData.nickname && `(${noticeData.nickname})`,

                  ].filter(Boolean).join(" ")}
                  {/* {noticeData.maidenName && noticeData.maidenName !== noticeData.lastName && (
                    <span className="text-slate-600 font-normal">
                      {" "}({noticeData.maidenName})
                    </span>
                  )} */}
                </h3>
              )}
              <div className="flex items-start justify-between mb-4">
                {isDeathNotice ? (
                  <>
                    {noticeData.birthDate && noticeData.passedDate && (
                      <p className="text-slate-600 mb-3">
                        {formatDate(noticeData.birthDate)} - {formatDate(noticeData.passedDate)}
                        {age !== null && (
                          <span className="ml-2">(Age {age})</span>
                        )}
                      </p>
                    )}
                    {!noticeData.birthDate && noticeData.passedDate && (
                      <p className="text-slate-600 mb-3">
                        Passed away {formatDate(noticeData.passedDate)}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {noticeData.birthDate && noticeData.dateOfPassing && (
                      <p className="text-slate-600 mb-3">
                        {formatDate(noticeData.birthDate)} - {formatDate(noticeData.dateOfPassing)}
                      </p>
                    )}
                    {!noticeData.birthDate && noticeData.dateOfPassing && (
                      <p className="text-slate-600 mb-3">
                        Passed away {formatDate(noticeData.dateOfPassing)}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="text-sm text-slate-600 mb-4">
                {!isCondolenceNotice &&
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{noticeData.location}</span>
                </div>
}
                {noticeData.passedDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(noticeData.passedDate)}</span>
                  </div>
                )}
              </div>

              <p className="text-slate-700 mb-4 whitespace-pre-wrap">
                {noticeData.obituary}
              </p>

              {noticeData.serviceDetails && (
                <div className="bg-slate-50 rounded p-3 mb-4">
                  <p className="text-sm text-slate-700">
                    <span className="text-[#0f172a]">Service:</span>{" "}
                    {noticeData.serviceDetails}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="mt-6 bg-slate-50 border rounded-lg p-4">
            <p className="text-sm text-slate-600">
              This is how your notice will appear on the website. Please review carefully before submitting. Edits will not be allowed after submission. Contact admin if edits need to be made at admin@funeralnotices.co.zw
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <Button 
              onClick={onConfirm}
              className="flex-1 bg-[#0f172a] hover:bg-[#1e3a5f]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Checkout"}
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

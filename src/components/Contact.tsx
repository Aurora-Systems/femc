import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { contactDetails } from "../constants/contactDetails";
import { emailjsConfig } from "../constants/emailjsConfig";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
     
      // Prepare template parameters
      const templateParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "Not provided",
        subject: formData.subject || "Contact Form Submission",
        message: formData.message,
        to_email: contactDetails.email,
      };

      // Send email using EmailJS
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        templateParams,
        emailjsConfig.publicKey
      );

      toast.success("Thank you for contacting us! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("EmailJS error:", error);
      toast.error(
        error.text || "Failed to send message. Please try again or contact us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl text-[#0f172a] mb-4">Contact Us</h1>
          <p className="text-lg text-slate-600">
            We're here to help and answer any questions you may have. 
            Contact us and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information Cards */}
          <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-[#0f172a]">
            <div className="bg-[#0f172a] text-white rounded-full p-4 w-fit mb-4">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="text-xl text-[#0f172a] mb-2">Phone</h3>
            <p className="text-slate-600 mb-4">Available 8am to 5pm</p>
            <Button 
              className="w-full bg-[#0f172a] hover:bg-[#1e3a5f]"
              onClick={() => window.location.href = `tel:${contactDetails.phone}`}
            >
              <Phone className="h-4 w-4 mr-2" />
              {contactDetails.phone}
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-[#0f172a]">
            <div className="bg-[#0f172a] text-white rounded-full p-4 w-fit mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-xl text-[#0f172a] mb-2">Email</h3>
            <p className="text-slate-600 mb-4">We'll respond within 24 hours</p>
            <Button 
              className="w-full bg-[#0f172a] hover:bg-[#1e3a5f]"
              onClick={() => window.location.href = `mailto:${contactDetails.email}`}
            >
              <Mail className="h-4 w-4 mr-2" />
              {contactDetails.email}
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-[#0f172a]">
            <div className="bg-[#0f172a] text-white rounded-full p-4 w-fit mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-xl text-[#0f172a] mb-2">Address</h3>
            <p className="text-slate-600 mb-4">Visit us at our office</p>
            <p className="text-slate-700">
              {contactDetails.address}
            </p>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="max-w-2xl mx-auto p-8 border-2 border-slate-200">
          <h2 className="text-2xl text-[#0f172a] mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">
                  Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  className="mt-1"
                  value={formData.name}
                  name="name"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  name="email"
                  className="mt-1"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  className="mt-1"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="subject">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="Subject"
                  className="mt-1"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">
                Message *
              </Label>
              <Textarea
                id="message"
                placeholder="Your message..."
                className="mt-1 min-h-[150px]"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0f172a] hover:bg-[#1e3a5f]"
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}


import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../init/server";
import axios from "axios";
import { Loader2, Download } from "lucide-react";
import { Button } from "./ui/button";
import db from "../init/db";

interface PaymentData {
    paid: boolean;
    total: number;
    message: string;
    [key: string]: any;
}

const PaymentResultAd = () => {
    const [reference_number, setReferenceNumber] = useState<string | null>(null);
    const [reference_exists, setReferenceExists] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [paid, setPaid] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [companyName, setCompanyName] = useState<string | null>(null);

    const navigate = useNavigate();
    
    const fetchUserCompanyName = async () => {
        try {
            const { data: { session } } = await db.auth.getSession();
            if (!session) return;

            const { data: profile, error } = await db
                .from("users")
                .select("organization_name")
                .eq("user_id", session.user.id)
                .single();

            if (error) {
                console.error("Error fetching user profile:", error);
                return;
            }

            if (profile && profile.organization_name) {
                setCompanyName(profile.organization_name);
            }
        } catch (error) {
            console.error("Error fetching company name:", error);
        }
    };

    const check_payment_status = async () => {
        setLoading(true);
        setError(null);
        try{
        const reference_number = localStorage.getItem("reference_number");
        console.log(reference_number);
        if (!reference_number) {
            setLoading(false);
            setReferenceExists(false);
            return;
        }
        
        setReferenceExists(true);
        setReferenceNumber(reference_number);
        
        // Fetch user company name from database
        await fetchUserCompanyName();
        
        const req = await axios.get(`${routes.check_ad_status}${reference_number}`);
        if (req.status === 200) {
                if(req.data.paid){
                    setPaid(true);
                    setPaymentData(req.data);
                    setError(null);
                } else {
                    setPaid(false);
                    setError(null);
                }
        } else {
            setReferenceExists(false);
            setError("Failed to check payment status");
        }
    } catch (error: any) {
        console.error(error);
        setError(error.response?.data?.message || error.message || "An error occurred while checking payment status");
    } finally {
        setLoading(false);
    }
    }

    const downloadReceipt = () => {
        if (!paymentData || !reference_number) return;

        const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Receipt - ${reference_number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        .receipt-header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .receipt-header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .receipt-header p {
            font-size: 14px;
            color: #666;
        }
        .receipt-info {
            margin-bottom: 30px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label {
            font-weight: bold;
            color: #555;
        }
        .info-value {
            color: #333;
        }
        .receipt-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #000;
        }
        .receipt-section h2 {
            font-size: 20px;
            margin-bottom: 15px;
            color: #000;
        }
        .status-success {
            color: #22c55e;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body {
                padding: 20px;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-header">
        <h1>PAYMENT RECEIPT</h1>
        <p>Advertisement Payment Confirmation</p>
    </div>

    <div class="receipt-info">
        ${companyName ? `
        <div class="info-row">
            <span class="info-label">Company Name:</span>
            <span class="info-value">${companyName}</span>
        </div>
        ` : ''}
        ${(paymentData.total) ? `
        <div class="info-row">
            <span class="info-label">Amount Paid:</span>
            <span class="info-value">USD ${(paymentData.total || 0).toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="info-row">
            <span class="info-label">Description:</span>
            <span class="info-value">Paid for ad placement</span>
        </div>
    </div>

    <div class="footer">
        <p>This is an official receipt for your payment.</p>
        <p>Please keep this receipt for your records.</p>
        <p>For any inquiries, please contact our support team.</p>
        <p style="margin-top: 20px;">Generated on ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
        `;

        // Create a blob and download
        const blob = new Blob([receiptHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${reference_number}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Also open in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(receiptHTML);
            printWindow.document.close();
            // Auto-trigger print dialog after a short delay
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }
    }

    useEffect(() => {
        check_payment_status();
    }, []);
    return (
        <div className="min-h-screen flex items-center flex-col justify-center p-3">
            <div>
            <h1 className="text-4xl font-bold mb-3">Ad Payment Result</h1>

            </div>
            {
                loading?
                <>
                    <div className="flex flex-col justify-center items-center">
                        <Loader2 className="animate-spin" />
                       <p>Please wait. Checking payment status...</p>
                    </div>
                </>
                :
                <>
                    {reference_exists?
                    <>
                        {
                        error?<>
                        <p className="text-center text-red-500">An error occurred while checking payment status. Please try again.</p>
                            <Button onClick={check_payment_status} className="mt-3">Check Again</Button>
                        </>:<>
                        <h1>Payment {paid ? "Success" : "Failed"}</h1>
                        {paid ? <p className="text-center">Your payment has been successful. Your ad will be reviewed and approved by admin.</p> : <p className="text-center">Your payment has failed. Please try again.</p>}
                        {!paid?<Button onClick={check_payment_status} className="mt-3">Check Again</Button>:
                        <div className="flex flex-col gap-3 mt-3">
                            <Button onClick={downloadReceipt} className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download Receipt
                            </Button>
                            <Button onClick={() => navigate("/dashboard")} variant="outline">Go to Dashboard</Button>
                        </div>}
                        </>}
                    </>
                    :
                    <>
                        <p className="text-center">You do not have an active payments, if you made a payment and your ad is not displayed, please <a href="/contact" className="text-blue-500 underline "><u className="underline text-blue-500">contact us</u></a>.</p>
                    </>
                    }
                </>
            }
        </div>
    )
}

export default PaymentResultAd;


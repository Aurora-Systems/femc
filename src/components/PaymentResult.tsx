import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import server_url from "../init/server";
import axios from "axios";
import { Loader2 } from "lucide-react";



const PaymentResult = () => {
    const [referecnce_number, setReferenceNumber] = useState<string | null>(null);
    const [reference_exists, setReferenceExists] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const check_payment_status = async () => {
      
        const reference_number = localStorage.getItem("reference_number");
        if (!reference_number) {
            setLoading(false);
            setReferenceExists(false);
        }
        const req = await axios.get(`${server_url}/api/payments/${reference_number}`);
        if (req.status === 200) {
            setReferenceExists(true);
        } else {
            setReferenceExists(false);
        }
    }
    return (
        <div className="min-h-screen flex items-center  flex-col justify-center">
            <div>
            <h1 className="text-4xl font-bold mb-3">Payment Result</h1>

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
                        <h1>Payment</h1>
                    </>
                    :
                    <>
                        <p>You do not have an active payments, if you made a payment and your notice is not displayed, please <a href="/contact" className="text-blue-500 underline "><u className="underline text-blue-500">contact us</u></a>.</p>
                    </>
                    }
                </>
            }
        </div>
    )
}

export default PaymentResult;
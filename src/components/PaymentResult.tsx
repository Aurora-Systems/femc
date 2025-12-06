import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import server_url, { routes } from "../init/server";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";



const PaymentResult = () => {
    const [reference_number, setReferenceNumber] = useState<string | null>(null);
    const [reference_exists, setReferenceExists] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [paid, setPaid] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const check_payment_status = async () => {
        setLoading(true);
        try{
        const reference_number = localStorage.getItem("reference_number");
        console.log(reference_number);
        if (!reference_number) {
            setLoading(false);
            setReferenceExists(false);
        }else{
            setReferenceExists(true);
        }
        const req = await axios.get(`${routes.check_status}${reference_number}`);
        if (req.status === 200) {
                if(req.data.paid){
                    setPaid(true);
                } else {
                    setPaid(false);
                }
        } else {
            setReferenceExists(false);
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
    }

    useEffect(() => {
        check_payment_status();
    }, []);
    return (
        <div className="min-h-screen flex items-center flex-col justify-center p-3">
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
                        {
                        error?<>
                        <p className="text-center text-red-500">An error occurred while checking payment status. Please try again.</p>
                            <Button onClick={check_payment_status} className="mt-3">Check Again</Button>
                        </>:<>
                        <h1>Payment {paid ? "Success" : "Failed"}</h1>
                        {paid ? <p className="text-center">Your payment has been successful. You can now view your notice.</p> : <p className="text-center">Your payment has failed. Please try again.</p>}
                        {!paid?<Button onClick={check_payment_status} className="mt-3">Check Again</Button>:<></>}
                        </>}
                    </>
                    :
                    <>
                        <p className="text-center">You do not have an active payments, if you made a payment and your notice is not displayed, please <a href="/contact" className="text-blue-500 underline "><u className="underline text-blue-500">contact us</u></a>.</p>
                    </>
                    }
                </>
            }
        </div>
    )
}

export default PaymentResult;
const server_url = "https://femc-hsc0eratckb3chdn.eastus-01.azurewebsites.net/";

export const routes = {
    intiate_transaction: server_url + "transactions/initiate",
    initiate_ad_transaction: server_url + "transactions/initiate-ad",
    check_status: server_url + "transactions/check-status/", //payment status for notices
    check_ad_status: server_url + "transactions/check-ad-status/", //payment status for ads
}
export default server_url;
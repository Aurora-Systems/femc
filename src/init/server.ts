const server_url = "https://femc-payments.attribute.deno.net/"/*"http://localhost:8080/"*/ //"https://femc-hsc0eratckb3chdn.eastus-01.azurewebsites.net/";

export const routes = {
    intiate_transaction: server_url + "transactions/initiate",
    check_status: server_url + "transactions/check_status/",
}
export default server_url;
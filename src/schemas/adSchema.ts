interface Ad{
    name:string,
    text:string,
    link:string,
    photo_id:string,
    expires:string,
    clicks:number,
    user_id:string,
    active:boolean,
    total:number,
    reference_number:string|null,
    currency:string,
    redirect_url:string|null,
    paid:boolean,
    status:"pending"|"approved"|"rejected",
    rejection_reason:string|null,
}

export default Ad;
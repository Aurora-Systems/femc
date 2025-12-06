export interface Notice {
    notice_type: "death_notice" | "memorial_service" | "tombstone_unveiling"
    user_id: string,
    first_name: string,
    middle_name: string|null,
    maiden_name: string|null,
    nickname: string|null,
    last_name: string,
    location: string, // location of the event
    dob: string, // date of birth
    dop: string|null, // date of passing
    event_date: string, // event date
    event_details: string, // event details
    obituary: string|null, // obituary details
    announcement:string|null, // announcement details
    photo_id: string|null,
    relationship:string, // relationship to the deceased
    active:boolean, // status of the notice
    reference_number:string|null, // reference number of the notice
    redirect_url:string|null, // redirect url of the notice
    tribute?:number|null, // tribute count
}
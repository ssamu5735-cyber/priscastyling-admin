export type Product={ $id?:string; name:string; slug:string; category:string; description:string; price:number; sizes:string[]; colours:string[]; image:string; gallery?:string[]; status:'Published'|'Draft'|'Sold out'|'Coming soon'; featured?:boolean; hasDiscount?:boolean; originalPrice?:number; discountLabel?:string };
// Empty: this fallback is only used if Appwrite is unreachable. The admin
// dashboard itself always reads live data via listAllProducts().
export const seedProducts:Product[]=[];
export const money=(n:number)=>`₦${new Intl.NumberFormat('en-NG').format(n)}`;
export const whatsappNumber=process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'2348135296095';

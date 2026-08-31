import type {Metadata} from 'next';import './globals.css';
const title='TrackMe Suite — Control Tower';
const description='Real-time visibility for in-transit trips, exceptions, and logistics operations.';
export const metadata:Metadata={title,description,openGraph:{title,description,images:[{url:'/og.png',width:1672,height:941,alt:title}]},twitter:{card:'summary_large_image',title,description,images:['/og.png']}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className="font-sans antialiased">{children}</body></html>}

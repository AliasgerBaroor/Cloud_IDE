import { Provider } from "@/components/ui/provider"
import "./globals.css";
import { Providers } from "@/redux/provider";

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
      <Providers>
      <Provider>{children}</Provider>
      </Providers>
      
      </body>
    </html>
  );
}


export default RootLayout;
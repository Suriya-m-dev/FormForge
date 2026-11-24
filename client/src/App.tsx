import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { router } from "./app/router";

const App = () => {
  return (
    <>
      <RouterProvider router={router} />

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3000}
      />
    </>
  );
};

export default App;
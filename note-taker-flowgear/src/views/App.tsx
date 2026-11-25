import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Flowgear } from "flowgear-webapp";
import { NotesWorkspace } from "../components/notes/NotesWorkspace";

export default function App() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    void Flowgear.Sdk.setParentPath(pathname + search);
  }, [pathname, search]);

  return <NotesWorkspace />;
}

import React, { useEffect, useState } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { UploadScreen } from "./components/UploadScreen";
import { Workbench } from "./components/Workbench";
import type { Dataset } from "./types";

export function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="h-full w-full">
      {showSplash ? (
        <SplashScreen />
      ) : dataset ? (
        <Workbench
          dataset={dataset}
          onReplace={setDataset}
          onReset={() => setDataset(null)}
        />
      ) : (
        <UploadScreen onLoaded={setDataset} />
      )}
    </div>
  );
}

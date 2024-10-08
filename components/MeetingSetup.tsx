"use client"

import { DeviceSettings, VideoPreview, useCall } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

// Component for setting up the meeting (mic/camera settings) before joining
const MeetingSetup = ({ setIsSetupComplete }: { setIsSetupComplete: (value: boolean) => void }) => {
    // State to track if the mic and camera are toggled on/off
    const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);

    // Get the current call object using Stream's SDK
    const call = useCall();

    // Ensure that the useCall hook is only used within a Stream call component
    if (!call) {
        throw new Error('useCall must be used within streamCall component');
    }

    // Effect to enable or disable mic/camera based on isMicCamToggledOn state
    useEffect(() => {
        if (isMicCamToggledOn) {
            // If mic/camera is toggled on, disable both
            call?.camera.disable();
            call?.microphone.disable();
        } else {
            // If mic/camera is toggled off, enable both
            call?.camera.enable();
            call?.microphone.enable();
        }
    }, [isMicCamToggledOn, call?.camera, call?.microphone]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
            {/* Title for setup */}
            <h1 className="text-2xl font-bold">Setup</h1>

            {/* Video preview for the user before joining the call */}
            <VideoPreview />

            {/* Checkbox to toggle mic/camera settings */}
            <div className="flex h-16 items-center justify-center gap-3">
                <label className="flex items-center justify-center gap-2 font-medium">
                    <input 
                        type="checkbox" 
                        checked={isMicCamToggledOn}
                        // Toggle mic/camera on checkbox change
                        onChange={(e) => setIsMicCamToggledOn(e.target.checked)}
                    />
                    Join with mic and camera off
                </label>

                {/* Device settings component (e.g., for choosing camera/mic) */}
                <DeviceSettings />
            </div>

            {/* Button to join the meeting */}
            <Button className="rounded-md bg-green-500 px-4 py-2.5" 
                onClick={() => {
                    // Call the join method to join the meeting
                    call.join();

                    // Mark the setup as complete by setting the flag to true
                    setIsSetupComplete(true);
                }}
            >
                Join Meeting
            </Button>
        </div>
    );
}

export default MeetingSetup;

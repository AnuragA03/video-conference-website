"use client"

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk"
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const EndCallButton = () => {
    // Retrieve the current call context using useCall hook
    const call = useCall();

    // Initialize Next.js router for navigation
    const router = useRouter();

    // Access local participant data via the useCallStateHooks
    const { useLocalParticipant } = useCallStateHooks();
    const localParticipant = useLocalParticipant();

    // Check if the current local participant is the meeting owner
    // The meeting owner is identified by matching the local participant's user ID with the one who created the call
    const isMeetingOwner = localParticipant && call?.state.createdBy && localParticipant.userId === call.state.createdBy.id;

    // If the local participant is not the meeting owner, render nothing (return null)
    if (!isMeetingOwner) return null;

    return (
      // Button to end the call for everyone
      <Button 
        onClick={async () => {
            // End the current call asynchronously
            await call.endCall();
            // Redirect the user to the home page after ending the call
            router.push('/')
        }} 
        className="bg-red-500" // Red color button for 'End Call'
      >
        End Call for Everyone
      </Button>
    );
};

export default EndCallButton;
